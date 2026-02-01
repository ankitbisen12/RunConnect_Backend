import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { createHashData, signToken } from '../utils/common.js';
import { promisify } from 'util';

export const signUp = catchAsync(async (req, res, next) => {
    //easily create user can specify role as admin. so we are passing only required fields.
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    //TODO: fixed it with token functionality
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: newUser
    });
});


export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body; ``

    if (!email || !password) {
        return next(new Error('Please provide email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPasword(password, user.password))) {
        return next(new Error('Incorrect email or password'));
    };

    const token = signToken(user._id);

    //if everything  is ok send the response to frontend.
    res.status(201).json({
        status: 'success',
        token,
        // data: user, //don't expose entire info of user.
    });
});

export const protect = catchAsync(async (req, res, next) => {
    //1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new Error('You are not logged in! Please log in to get access.'));
    }


    //2) Verification  token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new Error('The user belonging to this token does no longer exist.'));
    }

    //4)check if user chnaged passwrod after the token was issued. //super important for security.
    if (currentUser.passwordChangedAt(decoded.iat)) {
        return next(new Error('User recently changed password! Please log in again.'));
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

export const isLoggedIn = catchAsync(async (req, res, next) => { });

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new Error('You do not have permission to perform this action'));
        }

        next();
    }
};

export const forgotPassword = catchAsync(async (req, res, next) => {
    //find user based on posted email
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new Error('There is no user with email address.Please create account first.'));
    }

    //generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    //send it it  user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `Forgot your Password ? Submit a patch requets with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password , please ignore this email`;
    // console.log(resetUrl, message);

    try {
        await sendEmail({
            email: user.email,
            subject: 'your password reset token {valid for 10 min}',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new Error('There was an error sending the email.Try again later!'));
    }
});

export const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = createHashData(req.params.token);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });


    if (!user) {
        return next(new Error('Token is invalid or has expired'));
    };

    //update the password 

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();


    //send JWT.
    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token,
    });


});

export const updatePassword = catchAsync(async (req, res, next) => {

    //find user
    const user = await User.findById(req.user.id).select('+password');

    if (!await user.correctPasword(req.body.currentPassword, user.password)) {
        return next(new Error('Your current password is wrong'));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //logged in with new token
    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token,
    });
});


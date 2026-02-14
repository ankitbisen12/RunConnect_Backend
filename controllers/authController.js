import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { createHashData, createSendToken } from '../utils/common.js';
import { promisify } from 'util';
import AppError from '../utils/appError.js';

export const signUp = catchAsync(async (req, res, next) => {
    console.log("Inside Signup controller", req.body);
    //easily create user can specify role as admin. so we are passing only required fields.
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.confirmPassword
    });

    console.log("User inside signup controller", newUser);
    createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    };

    createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
    //1) Getting token and check if it's there
    let token;
    console.log("Reached protect");
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        console.log("Reached authorization");
        token = req.headers.authorization.split(' ')[1];
        console.log("token haeder", token);
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    //2) Verification  token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);

    //3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    console.log("currentUser", currentUser);

    if (!currentUser) {
        return next(new Error('The user belonging to this token does no longer exist.'));
    }

    //4)check if user chnaged passwrod after the token was issued. //super important for security.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new Error('User recently changed password! Please log in again.'));
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    console.log("req.user", req.user);
    req.user = currentUser;
    console.log("req.user", req.user);
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
    createSendToken(user, 200, res);
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
    createSendToken(user, 200, res);
});


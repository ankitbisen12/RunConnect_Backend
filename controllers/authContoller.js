import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { signToken } from '../utils/common.js';
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

export const forgotPassword = catchAsync(async (req, res, next) => { });

export const resetPassword = catchAsync(async (req, res, next) => { });

export const updatePassword = catchAsync(async (req, res, next) => { });


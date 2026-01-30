import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { signToken } from '../utils/common.js';

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

export const protect = catchAsync(async (req, res, next) => { });

export const isLoggedIn = catchAsync(async (req, res, next) => { });

export const restrictTo = (...roles) => { };

export const forgotPassword = catchAsync(async (req, res, next) => { });

export const resetPassword = catchAsync(async (req, res, next) => { });

export const updatePassword = catchAsync(async (req, res, next) => { });


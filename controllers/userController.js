import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { getOne, getAll, updateOne, deleteOne } from './handleFactory.js';
import { filterObj } from '../utils/common.js';

//TODO: fetch only necessary data .Don't expose password or some security related fields.
export const getUser = getOne(User);
export const getAllUsers = getAll(User);

export const deleteProfile = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;

    //don't delete the user permanently just set active to false
    await User.findByIdAndUpdate(userId, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const updateProfile = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new Error('This route is not for password updates. Please use /updateMyPassword', 400));
    }

    const userId = req.user?.id;
    //filtered out unwanted fieldnames that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
        new: true,
        runValidators: true
    });

    res.json({
        status: 'success',
        user: updatedUser
    });
});

// Not using these functions for user for now
// export const updateUser = updateOne(User);
// export const deleteUser = deleteOne(User);


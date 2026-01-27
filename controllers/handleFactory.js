import { Model } from "mongoose";
import catchAsync from "../utils/catchAsync";

export const getOne = catchAsync(async (Model) => {
    const id = req?.params?.id;
    const doc = await Model.findById(id);

    if (!doc) {
        return next(new Error('No document found with that ID'));
    }

    res.json({
        status: 'success',
        data: doc
    });
});

export const getAll = catchAsync(async (Model) => {
    const docs = await Model.find();

    res.json({
        status: 'success',
        resultLength: docs.length,
        data: docs
    })
});

export const updateOne = catchAsync(async (Model) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new Error('No document found with that ID', 404));
    }

    return res.json({
        status: 'success',
        data: doc
    });
});

export const deleteOne = catchAsync(async (Model) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new Error('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: doc
    });
});
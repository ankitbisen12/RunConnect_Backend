import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getOne = Model => catchAsync(async (req, res, next) => {
    const id = req?.params?.id;
    console.log(id);
    const doc = await Model.findById(id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const getAll = Model => catchAsync(async (req, res, next) => {
    console.log("req.query inside getAll", req.query);
    const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();
    const docs = await features.query;

    if (!docs) {
        return next(new AppError('No document find with this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        resultLength: docs.length,
        data: docs
    })
});

export const createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newDoc
    });
});

export const updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: doc
    });
});

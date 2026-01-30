import catchAsync from "../utils/catchAsync.js";

export const getOne = Model => catchAsync(async (req, res, next) => {
    const id = req?.params?.id;
    const doc = await Model.findById(id);

    if (!doc) {
        return next(new Error('No document found with that ID'));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const getAll = Model => catchAsync(async (req, res, next) => {
    const docs = await Model.find();

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
        return next(new Error('No document found with that ID'));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

export const deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new Error('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: doc
    });
});

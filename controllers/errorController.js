import AppError from "../utils/appError.js";

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please enter value`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data ${errors.join(', ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Inavlid token ,Please log in again', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired!, Please log in again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    if (!err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    else {
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        })
    }
}

const globalErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV == 'development') {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV == 'development') {
        let error = { ...err, name: err.name, message: err.message };

        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidateError') error = handleValidationErrorDB(error);
        if (err.name === 'ValidateError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();

        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();



        sendErrorProd(error, res);
    }
};

export default globalErrorHandler;
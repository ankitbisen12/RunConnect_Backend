//Here  next(err)  express automatically pass the error and calls the error class. 
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => next(err));
    };
};

export default catchAsync;

export const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

export const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

export const createHashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

export const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: user
    });
};

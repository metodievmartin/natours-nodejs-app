const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Get from the config file & convert the JWT expiration time from days to milliseconds
    const tokenExpirationDate = Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

    const cookieOptions = {
        expires: new Date(tokenExpirationDate),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Set values to undefined so that they are not displayed in the response
    user.password = undefined;
    user.active = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    // Explicitly select the password otherwise it will not show up
    const user = await User.findOne({email}).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything is ok, send the token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Check if there's a token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const fetchedUser = await User.findById(decoded.id);

    if (!fetchedUser) {
        return next(
            new AppError('The user owning this token no longer exists.', 401)
        );
    }

    // 4) Check if user changed password after token was issued
    const isPasswordChangedAfter = await fetchedUser.changedPasswordAfter(decoded.iat);
    if (isPasswordChangedAfter) {
        return next(
            new AppError('Invalid token. User changed password recently. Please log in again.', 401)
        );
    }

    // 5) Add current user's details to the request body
    req.user = fetchedUser;

    // 6) Grant access to the protected route
    next();
});

// Receives the roles that have permission to access the resource
// *Must be called only after the "protect" middleware func for it needs current user details
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // If user's current role is not included in the roles arr throw an error
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user registered with that email.', 404));
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = 'Forgot your password?\n' +
        `Submit a PATCH request with your new password and PasswordConfirm to: ${resetURL}\n` +
        'If you didn\'t forget your password, please ignore this email!';

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (err) {
        // Reset the token in case of an error
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(
            new AppError('There was an error sending the email. Try again later!', 500)
        );
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // Query the user by the token & check if has not expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    // 2) If token has not expired and there is user, set the new password

    if (!user) {
        return next(
            new AppError('Token is invalid or has expired!', 400)
        );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update passwordChangedAt property for that user

    // Via middleware function on the userModel

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from the DB
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if the POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(
            new AppError('Your current password is incorrect.', 401)
        );
    }


    // 3) If correct, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
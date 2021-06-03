const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require("../utils/AppError");
const { getAll, updateOne, getOne, deleteOne } = require("./handlerFactory");

exports.getAllUsers = getAll(User);

exports.getUser = getOne(User);

// Do NOT update passwords with this - use the dedicated authController handler (updatePassword)
exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not for password updates. Please use /updateMyPassword route', 400)
        );
    }

    // 2) Filter out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, { active: false });

   res.status(204).json({
      status: 'success',
      data: null
   });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};

// Middleware that sets the current user ID to req.params so that the current user can be fetched using the factory handler
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};


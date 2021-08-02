const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/AppError");

exports.getOverview = catchAsync(async (req, res, next) => {
    // Fetch all Tours from DB
    const tours = await Tour.find();

    // Render the page with tour data
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
});

exports.getTour = catchAsync(async (req, res, next) => {
    // Fetch the tour & populate the 'review'
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with this name', 404));
    }

    // Render the page with tour data
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings by the logged user
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Extract all tour IDs into an array
    const tourIDs = bookings.map(el => el.tour);

    // 3) Fetch the tours by their IDs
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Bookings',
        tours
    });
});


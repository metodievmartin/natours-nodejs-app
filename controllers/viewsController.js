const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    // Fetch all Tours from DB
    const tours = await Tour.find();

    // Render the page with tour data
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
});

exports.getTour = catchAsync(async (req, res) => {
    // Fetch the tour & populate the 'review'
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    // Render the page with tour data
    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    })
});


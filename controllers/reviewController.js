const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const { createOne, updateOne, getOne, deleteOne } = require("./handlerFactory");

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId};

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// A middleware that ensures 'tour ID' and 'user ID' are being added to req.body
// thus allows nested routes and could handle calls from both '/api/v1/reviews' & '/api/v1/tours/:tourId/reviews'
exports.setTourAndUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.getReview = getOne(Review);

exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
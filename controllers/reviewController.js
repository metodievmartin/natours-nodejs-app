const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const { updateOne, deleteOne } = require("./handlerFactory");

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

exports.createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes - for it handles '/api/v1/reviews' & '/api/v1/tours/:tourId/reviews' routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

   const newReview = await Review.create(req.body);

   res.status(201).json({
       status: 'success',
       data: {
           review: newReview
       }
   });
});

exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
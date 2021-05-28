const express = require('express');

const { protect, restrictTo } = require("../controllers/authController");
const { getAllReviews, createReview, updateReview, deleteReview } = require('./../controllers/reviewController');

// Create the router with the mergeParams option
// so that it will have access to the req.params coming from mounted/nested routers
const router = express.Router({ mergeParams: true })

router
    .route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'), createReview);

router
    .route('/:id')
    .patch(updateReview)
    .delete(deleteReview);

module.exports = router;
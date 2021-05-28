const express = require("express");
const reviewRouter = require("../routes/reviewRouter");
const { protect, restrictTo } = require("../controllers/authController");
const {
    getAllTours,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    createTour,
    getTour,
    updateTour,
    deleteTour
} = require('./../controllers/tourControler');

const router = express.Router();

// Use middleware to create a nested route for the reviews
router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router
    .route('/tour-stats')
    .get(getTourStats);

router
    .route('/monthly-plan/:year')
    .get(getMonthlyPlan);

router
    .route('/')
    .get(protect, getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
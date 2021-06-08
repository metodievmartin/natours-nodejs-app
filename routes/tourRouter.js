const express = require("express");
const reviewRouter = require("../routes/reviewRouter");
const {getToursWithin} = require("../controllers/tourControler");
const {protect, restrictTo} = require("../controllers/authController");
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

// '/api/v1/tours'
const router = express.Router();

// Use middleware to create a nested route for the reviews
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router.route('/tour-stats')
    .get(getTourStats);

router.route('/monthly-plan/:year')
    .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);

router.route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router.route('/:id')
    .get(getTour)
    .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
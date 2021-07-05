const express = require("express");
const reviewRouter = require("../routes/reviewRouter");
const {protect, restrictTo} = require("../controllers/authController");
const tourCtrl = require('./../controllers/tourControler');

// '/api/v1/tours'
const router = express.Router();

// Use middleware to create a nested route for the reviews
router.use('/:tourId/reviews', reviewRouter);

// Get top 5 cheapest tours
router.route('/top-5-cheap')
    .get(tourCtrl.aliasTopTours, tourCtrl.getAllTours);

// Get tour stats
router.route('/tour-stats')
    .get(tourCtrl.getTourStats);

// Get monthly plan
router.route('/monthly-plan/:year')
    .get(protect, restrictTo('admin', 'lead-guide', 'guide'), tourCtrl.getMonthlyPlan);

// Get tours within
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourCtrl.getToursWithin);

// Get distances
router.route('/distances/:latlng/unit/:unit')
    .get(tourCtrl.getDistances);

// Get all tours, create a tour
router.route('/')
    .get(tourCtrl.getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), tourCtrl.createTour);

// Get, update, delete a single tour
router.route('/:id')
    .get(tourCtrl.getTour)
    .patch(
        protect,
        restrictTo('admin', 'lead-guide'),
        tourCtrl.uploadTourImages,
        tourCtrl.resizeTourImages,
        tourCtrl.updateTour
    )
    .delete(protect, restrictTo('admin', 'lead-guide'), tourCtrl.deleteTour);

module.exports = router;
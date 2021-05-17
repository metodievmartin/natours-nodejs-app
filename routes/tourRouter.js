const express = require("express");
const {protect} = require("../controllers/authController");
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
    .delete(deleteTour);

module.exports = router;
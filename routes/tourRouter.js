const express = require("express");
const {
    getAllTours,
    aliasTopTours,
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
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
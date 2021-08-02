const express = require('express');

const { protect } = require("../controllers/authController");
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get('/checkout-session/:tourId', protect, bookingController.getCheckoutSession)

module.exports = router;
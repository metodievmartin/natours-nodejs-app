const express = require('express');
const viewsController = require("../controllers/viewsController");
const { isLoggedIn, protect } = require("../controllers/authController");
const { createBookingCheckout } = require("../controllers/bookingController");

const router = express.Router();

router.get('/', createBookingCheckout, isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', isLoggedIn, viewsController.getTour);
router.get('/login',isLoggedIn , viewsController.getLoginForm);
router.get('/me', protect, viewsController.getAccount);
router.get('/my-tours', protect, viewsController.getMyTours);

module.exports = router;

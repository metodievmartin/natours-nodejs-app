const express = require('express');
const viewsController = require("../controllers/viewsController");
const { isLoggedIn, protect } = require("../controllers/authController");

const router = express.Router();

router.get('/', isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', isLoggedIn, viewsController.getTour);
router.get('/login',isLoggedIn , viewsController.getLoginForm);
router.get('/me', protect, viewsController.getAccount);

module.exports = router;

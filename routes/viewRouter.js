const express = require('express');
const authController = require("../controllers/authController");
const viewsController = require("../controllers/viewsController");

const router = express.Router();

// Middleware that checks if there's a valid logged user and decorates the res.locals object with 'user' property
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm)

module.exports = router;

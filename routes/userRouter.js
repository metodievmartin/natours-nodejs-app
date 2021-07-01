const express = require("express");
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    restrictTo,
    updatePassword,
    logout
} = require("../controllers/authController");
const {
    createUser,
    getAllUsers,
    deleteUser,
    getUser,
    updateUser,
    getMe,
    updateMe,
    deleteMe
} = require("../controllers/userController");

// '/api/v1/users'
const router = express.Router();

// Authorization actions endpoints - access by everyone
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// Password actions endpoints - access by everyone
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
// - access by logged users
router.patch( '/updateMyPassword', protect, updatePassword);

// Use the protect middleware here to auth guard all of the routes below
router.use(protect);

// Current user actions endpoints - access by logged users
router.get('/me', getMe, getUser);
router.patch( '/updateMe', updateMe);
router.delete( '/deleteMe', deleteMe);

// Use middleware here to restrict the access by role to all of the routes below
router.use(restrictTo('admin'));

// Users CRUD actions - access by logged admin users only
router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
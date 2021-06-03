const express = require("express");
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword
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

const router = express.Router();

// Authorization actions endpoints
router.post('/signup', signup);
router.post('/login', login);

// Password actions endpoints
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch( '/updateMyPassword', protect, updatePassword);

// Current user actions endpoints
router.get('/me', protect, getMe, getUser);
router.patch( '/updateMe', protect, updateMe);
router.delete( '/deleteMe', protect, deleteMe);

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
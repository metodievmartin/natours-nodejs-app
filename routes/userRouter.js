const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");
const {
    createUser,
    getAllUsers,
    deleteUser,
    getUser,
    updateUser
} = require("../controllers/userController");

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

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
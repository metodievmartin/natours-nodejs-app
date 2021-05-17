const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Your password cannot be less than 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on SAVE and CREATE
            validator: function (currentVal) {
                return currentVal === this.password;
            },
            message: 'Password don\'t match'
        }
    },
    passwordChangedAt: Date
});

// User model middleware
userSchema.pre('save', async function (next) {
    // Runs only when the password has been modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Clear the passwordConfirm field
    this.passwordConfirm = undefined;

    next();
});

// User model instance methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp) {
    // This field will exist only if the password has ever been changed
    if (this.passwordChangedAt) {
        // Convert the date to the format used by JWT (timestamp in milliseconds)
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // Returns true if the password has been changed after issuing the JWT
        return JWTTimestamp < changedTimestamp;
    }

    // Default case - password never changed
    return false;
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// -- QUERY MIDDLEWARE --
// Using regex to match all the methods starting with 'find' (findOne(), findByID(), etc.)
// otherwise it will run only for the .find() method

// Populate each booking with the user and the tour name
bookingSchema.pre(/^find/, function(next) {
    //'this' refers to the query object
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
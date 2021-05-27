const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// -- QUERY MIDDLEWARE --
// Using regex to match all the methods starting with 'find' (findOne(), findByID(), etc.)
// otherwise it will run only for the .find() method

// Populate the 'tour' & 'user' fields with the selected data on each request,
// querying by the stored 'tour' & 'user' id references
reviewSchema.pre(/^find/, function(next) {
    /*
    this.populate({
            path: 'tour',
            select: 'name'
        }).populate({
            path: 'user',
            select: 'name photo'
        });
        */

    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next()
});

module.exports = mongoose.model('Review', reviewSchema);
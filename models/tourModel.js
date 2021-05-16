const mongoose = require('mongoose');
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must be maximum 40 characters long'],
        minlength: [10, 'A tour name must be at least 10 characters long'],
        //validate: [validator.isAlpha, 'Tour name must contain only characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be one of the following: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'The rating cannot be less than 1.0'],
        max: [5, 'The rating cannot be greater than 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // 'this' refers to the current doc only on NEW document creation /won't work on update doc/
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be bellow regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() /won't work on update doc/
tourSchema.pre('save', function(next) {
    //'this' refers to the document that is to be saved
    this.slug = slugify(this.name, {lower: true});
    next();
});

// QUERY MIDDLEWARE
// Using regex to match all the methods starting with 'find' (findOne(), findByID(), etc.)
// otherwise it will run only for the .find() method
tourSchema.pre(/^find/, function(next) {
    //'this' refers to the query object
    this.find({secretTour: {$ne: true}});
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
   //'this' refers to the aggregation object
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    next();
});

module.exports = mongoose.model('Tour', tourSchema);
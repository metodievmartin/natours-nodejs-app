const Tour = require('./../models/tourModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
    getAll,
    createOne,
    updateOne,
    getOne,
    deleteOne
} = require("./handlerFactory");

exports.getAllTours = getAll(Tour);

exports.getTour = getOne(Tour, { path: 'reviews' })

exports.createTour = createOne(Tour);

exports.updateTour = updateOne(Tour);

exports.deleteTour = deleteOne(Tour);

// Middleware to manipulate the query string for a predefined route '/top-5-cheap'
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
};

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}}
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        },
        {
            $sort: {avgPrice: 1}
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = Number(req.params.year);

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {$month: '$startDates'},
                numTourStarts: {$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {numTourStarts: -1}
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError('Please provide latitude and longitude in the correct format (lat,lng).', 400)
        );
    }

    // Calculates the radiance by dividing the distance by the Earth's radius in miles or kilometers respectively
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    // Filters the tours that fall within the provided radius from the provided coordinates
    // based on each tour's start location using the geospatial operators
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError('Please provide latitude and longitude in the correct format (lat,lng).', 400)
        );
    }

    // Create a multiplier based on the unit in order to convert the value from meters to the desired unit
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

/*
    $geoNear must be at the first stage and needs at least one geospatial index ('2dsphere') in order to work
    'near' - GeoJSON object which to calculate the distances from - calculates between this point and all the startLocations
    'distanceField' - sets the name of the field where all the distances will be stored
    'distanceMultiplier' - optional multiplier to be applied on the distance value since it's returned in meters by default
*/
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [Number(lng), Number(lng)]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});


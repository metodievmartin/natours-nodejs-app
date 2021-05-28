const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Factory function that returns a generic handler to delete a single document
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const docID = req.params.id;
        const doc = await Model.findByIdAndDelete(docID);

        if (!doc) {
            return next(new AppError('No document found with this ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

// Factory function that returns a generic handler to update a single document
exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const docID = req.params.id;

        const doc = await Model.findByIdAndUpdate(docID, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if (!doc) {
            return next(new AppError('No document found with this ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

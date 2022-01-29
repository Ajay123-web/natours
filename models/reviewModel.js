const mongoose = require('mongoose');
const Tour = require('./tourModel.js');
//const User = require('./userModel.js');
/*Reviews are referenced to the tour and user by parent referencing 
so we populate required fields of tours and users when we need a review*/

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Cannot be empty']
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
      required: [true, 'Review must belong to some tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

//statics are model based method and hence this points to the model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};
//One user can post only 1 review on same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/* in place of this.constructor we could have used Review 
 but it was not possible because we declare the model name after the schema */
/* below middleware is to call the above method after saving a review */
/* post methods dont have next */
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
//To update tour ratings when a review is deleted or updated
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) Review.calcAverageRatings(doc.tour); // Use Review
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

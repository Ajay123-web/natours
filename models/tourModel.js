const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel.js');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'Tour name must have less than or equal to 40 characters'
      ],
      minLength: [
        10,
        'Tour name must have greater than or equal to 10 characters'
      ]
      //validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficulty cant have this value'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Tour must have rating greater than equal to 1'],
      max: [5.0, 'Tour must have rating less than equal to 5'],
      set: (val) => Math.round(val * 10) / 10 //round value of rating
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to the doc on new doc creation and not update
          return val < this.price;
        },
        message: 'Value of price discount must be less than the price'
      }
    },
    summary: {
      type: String,
      required: [true, 'Tour must have a summary'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a image cover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
      //select: false     does not send it in the output
    },
    startDates: [Date],
    //we save loctions as an embeded document not as a regular object
    startLocation: {
      //GeoJSON object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  //this helps to display virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//.index make fields with index for efficient queries
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //indexing start locations in a 2D sphere

/*virtual properties are those which are not saved in the database and
are used when a property can be derived from other properties in schema */

//this gives access to the current document
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual property for reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //property of foreign field where key is tored
  localField: '_id'
});

//DOCUMENT middleware that runs between .create and .save
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* Below middleware is to embed guides in tour model itself which is not a good way because we may need to update users*/
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordResetExpires -passwordResetToken -passwordChangedAt'
  });
  next();
});

tourSchema.post('save', function (doc, next) {
  //doc is the finished doc
  //console.log(doc);
  next();
});

//Query Middleware
// tourSchema.pre('find', function (next) {

tourSchema.pre(/^find/, function (next) {
  //any query that starts with find
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milisec`);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema); //it is the collection
module.exports = Tour;

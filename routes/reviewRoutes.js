const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router({ mergeParams: true }); //to get access to the tourId

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router.get('/:id', reviewController.getReview);
router.delete(
  '/:id',
  authController.restrictTo('user', 'admin'),
  reviewController.deleteReview
);
router.patch(
  '/:id',
  authController.restrictTo('user', 'admin'),
  reviewController.updateReview
);
module.exports = router;

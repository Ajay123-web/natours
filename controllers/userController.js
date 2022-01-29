const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory.js');
const multer = require('multer');
const sharp = require('sharp');

//storing images in the disk storage
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}-${ext}`);
//   }
// });

//store image in buffer
const multerStorage = multer.memoryStorage();

//ensure that the uploaded file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only an image file!', 400), false);
  }
};

/* Body parser is not capable of handling files and cant put the file data in req.body that is the reason we need multer*/
//const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo'); //photo is the field in the form that has the photo

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  //we need to do this manually because when we store the image in buffer its name is not set
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500) //we assume every image is square in our css so we convert it to a square
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) //compressing
    .toFile(`public/img/users/${req.file.filename}`); //save image on disk

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //IF THERE IS ANY PASSWORD FIELD RETURN ERROR
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This is not the correct route to update password.', 400)
    );
  }
  const filteredObj = filterObj(req.body, 'name', 'email');
  if (req.file) filteredObj.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.createUser = (_req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use signup instead.'
  });
};

//requestedAt: req.requestTime
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User); //only admin will be allowed to do this

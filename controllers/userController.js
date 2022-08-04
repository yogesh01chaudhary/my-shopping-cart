const UserDB = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/CustomError");
const cookieToken = require("../utils/cookieToken");
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("photo is required for signup", 400));
  }

  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(
      new CustomError(
        "Name, password and email are required please fill the form completely",
        400
      )
    );
  }

  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await UserDB.create({
    name,
    email,
    password,
    photo: { id: result.public_id, secure_url: result.secure_url },
  });
  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomError("please provide email and password", 400));
  }

  const user = await UserDB.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new CustomError("Email or password does not match or exist email", 400)
    );
  }

  const isPasswordMatch = await user.isValidPassword(password);

  if (!isPasswordMatch) {
    return next(
      new CustomError("Email or password does not match or exist password", 400)
    );
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({ success: true, message: "LogOut Success" });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserDB.findOne({ email });
  if (!user) {
    return next(new CustomError("Email not found as registered user", 400));
  }

  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your URLanf hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Tstore- Password Reset Email",
      message,
    });
    res
      .status(200)
      .send({ success: "true", message: "Email sent successfully" });
  } catch (e) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(e.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserDB.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("Password and confirm password do not match", 400)
    );
  }
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await UserDB.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await UserDB.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidPassword(req.body.oldPassword);

  if (!isCorrectOldPassword) {
    return next(new CustomError("Old Password is incorrect", 400));
  }
  user.password = req.body.password;
  await user.save();
  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = { name: req.body.name, email: req.body.email };

  if (req.files) {
    const user = await UserDB.findById(req.user.id);
    const imageId = user.photo.id;

    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await UserDB.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await UserDB.find();
  res.status(200).json({ success: true, users });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await UserDB.findById(req.params.id);
  if (!user) {
    return next(new (CustomError("No User Found", 400))());
  }

  res.status(200).json({ success: true, user });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await UserDB.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await UserDB.findById(req.params.id);
  if (!user) {
    return next(new CustomError("No Such User Exists", 400));
  }

  const imageId = user.photo.id;
  await cloudinary.v2.uploader.destroy(imageId);
  await user.remove();
  res.status(200).json({ success: true });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await UserDB.find({ role: "user" });
  res.status(200).json({ success: true, users });
});

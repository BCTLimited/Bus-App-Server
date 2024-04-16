import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import userService from "../services/userService.js";
import OTP from "../models/otp.js";
import generateOTP from "../utils/generateOTP.js";
import emailUtils from "../utils/emailUtils.js";
import generateToken from "../config/generateToken.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// SignUp User
const signUpUser = asyncWrapper(async (req, res, next) => {
  const { user } = await userService.registerUser(req.body);
  // Generate and send OTP
  const otp = generateOTP();
  const emailInfo = await emailUtils.sendOTPByEmail(
    req.body.email,
    user.userName,
    otp
  );
  await OTP.create({ email: req.body.email, otp });
  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

//Login User
const signInUser = asyncWrapper(async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);
  await userService.validatePassword(user._id, password);
  const userProfile = await userService.findUserProfileById(user._id);

  // Checks if user email has been verified
  if (!userProfile.isVerified) {
    throw customError(401, "Email not verified!");
  }

  //generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    id: user._id,
    token,
    role: user.role,
    image: userProfile.image,
  });
});

//GET USER
const getUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const userProfile = await userService.findUserProfileById(userId);
  res.status(200).json({
    userProfile,
  });
});

//UPDATE USER
const updateUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { password, ...userDetails } = req.body;

  // updating userProfile model
  const updatedProfileInfo = {};
  const profileFields = ["homeLocation", "workLocation"];
  profileFields.forEach((field) => {
    if (userDetails[field]) {
      updatedProfileInfo[field] = userDetails[field];
    }
  });
  if (req.files && req.files.image) {
    updatedProfileInfo.image = await uploadService.uploadUserImage(
      req.files.image.tempFilePath
    );
  }
  await userService.updateUserProfile(userId, updatedProfileInfo);

  // updating user model
  const updatedUserInfo = {};
  const userFields = ["userName", "lastName", "email", "phoneNumber"];
  userFields.forEach((field) => {
    if (userDetails[field]) {
      updatedUserInfo[field] = userDetails[field];
    }
  });
  await userService.updateUserModel(userId, updatedUserInfo);

  return res.status(200).json({ message: "Details Updated Successfully!" });
});

const sendOTP = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await userService.findUserByEmail(email);

  if (await userService.isUserVerified(user._id)) {
    return res.status(200).json({ message: "User Already Verified" });
  }

  const otpBody = await OTP.findOneAndDelete({ email });

  const otp = generateOTP();

  const emailInfo = await emailUtils.sendOTPByEmail(email, user.userName, otp);
  await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const verifyOTP = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await userService.findUserByEmail(email);

  if (await userService.isUserVerified(user._id)) {
    return res.status(200).json({ message: "User Already Verified" });
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return res.status(400).json({ message: "Invalid or Expired OTP" });
  }

  await UserProfile.findOneAndUpdate(
    { userId: user._id },
    { isVerified: true }
  );
  res.status(200).json({ message: "Profile Verified" });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const user = await userService.findUserByEmail(email);

  const otp = generateOTP();

  const emailInfo = await emailUtils.sendOTPByEmail(email, user.userName, otp);
  await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await userService.findUserByEmail(email);

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    throw customError(400, "Invalid or Expired OTP");
  }

  user.password = password;
  await user.save();
  await OTP.findOneAndDelete({ email, otp });
  res.status(200).json({ message: "Password Updated!" });
});

export {
  signUpUser,
  signInUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
};

import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import userService from "../services/userService.js";
import OTP from "../models/otp.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTPByEmail from "../utils/sendOTPByEmail.js";
import generateToken from "../config/generateToken.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";

// SignUp User
const signUpUser = asyncWrapper(async (req, res, next) => {
  // checks for the required fields on req.body
  const fields = [
    "userName",
    "lastName",
    "phoneNumber",
    "email",
    "homeLocation",
  ];
  const missingField = fields.find((field) => !req.body[field]);
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  const { user } = await userService.registerUser(req.body);
  // Generate and send OTP
  const otp = generateOTP();
  const emailInfo = await sendOTPByEmail(req.body.email, user.userName, otp);
  await OTP.create({ email: req.body.email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

//Login User
const signInUser = asyncWrapper(async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;

  if (!email || !password) {
    throw customError(400, "Please provide email and password");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw customError(401, "No User with this Email");
  }

  await userService.validatePassword(user._id, password);

  const userProfile = await UserProfile.findOne({ userId: user._id });

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

  // Retrieve user profile with populated user information excluding certain fields
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "userId",
      select: "-_id -password -__v",
    })
    .select("-__v -createdAt -updatedAt -isVerified");

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  res.status(200).json({
    userProfile,
    // Include other fields from userProfile as needed
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

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  if (await userService.isUserVerified(user._id)) {
    return res.status(200).json({ message: "User Already Verified" });
  }

  const otp = generateOTP();

  const emailInfo = await sendOTPByEmail(email, user.userName, otp);
  await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const verifyOTP = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

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

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  const otp = generateOTP();

  const emailInfo = await sendOTPByEmail(email, user.userName, otp);
  await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(400, "No User with this Email");
  }

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

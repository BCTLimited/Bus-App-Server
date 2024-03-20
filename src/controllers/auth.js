import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import userService from "../services/userService.js";
import OTP from "../models/otp.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTPByEmail from "../utils/sendOTPByEmail.js";
import generateToken from "../config/generateToken.js";

// SignUp User
const signUpUser = async (req, res, next) => {
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
    return next(customError(400, `${missingField} is required!`));
  }

  try {
    const { user } = await userService.registerUser(req.body);
    // Generate and send OTP
    const otp = generateOTP();
    const emailInfo = await sendOTPByEmail(req.body.email, user.userName, otp);
    await OTP.create({ email: req.body.email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${emailInfo.envelope.to}`,
    });
  } catch (error) {
    return next(error);
  }
};

//Login User
const signInUser = async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;

  if (!email || !password) {
    return next(customError(400, "Please provide email and password"));
  }

  const userProfile = await UserProfile.findOne({}).populate({
    path: "userId",
    match: { email: email.toLowerCase() }, // Match the email within the populated user document
  });

  if (!userProfile.userId) {
    return next(customError(401, "No User with this Email"));
  }

  try {
    await userService.validatePassword(userProfile._id, password);
    // Checks if user email has been verified
    if (!userProfile.isVerified) {
      return next(customError(401, "Email not verified!"));
    }

    //generate new token
    const token = generateToken(userProfile._id);

    res
      .status(200)
      .json({ id: userProfile._id, token, image: userProfile.image });
  } catch (error) {
    next(error);
  }
};

//GET USER
const getUser = async (req, res, next) => {
  const { userId } = req.user;

  try {
    // Retrieve user profile with populated user information excluding certain fields
    const userProfile = await UserProfile.findOne({ _id: userId })
      .populate({
        path: "userId",
        select: "-_id -password -phoneNumber -role -__v -createdAt -updatedAt",
      })
      .select("-__v -createdAt -updatedAt -isVerified");

    if (!userProfile) {
      return next(customError(404, "User profile not found"));
    }

    res.status(200).json({
      userProfile,
      // Include other fields from userProfile as needed
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE USER
const updateUser = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  if (await userService.isUserVerified(user._id)) {
    return res.status(200).json({ message: "User Already Verified" });
  }

  const otp = generateOTP();

  try {
    const emailInfo = await sendOTPByEmail(email, user.userName, otp);
    await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${emailInfo.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  if (await userService.isUserVerified(user._id)) {
    return res.status(200).json({ message: "User Already Verified" });
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return res.status(400).json({ message: "Invalid or Expired OTP" });
  }

  try {
    await UserProfile.findOneAndUpdate(
      { userId: user._id },
      { isVerified: true }
    );
    res.status(200).json({ message: "Profile Verified" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otp = generateOTP();

  try {
    const emailInfo = await sendOTPByEmail(email, user.userName, otp);
    await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${emailInfo.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(400, "No User with this Email"));
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return next(customError(400, "Invalid or Expired OTP"));
  }

  try {
    user.password = password;
    await user.save();
    await OTP.findOneAndDelete({ email, otp });
    res.status(200).json({ message: "Password Updated!" });
  } catch (error) {
    next(error);
  }
};

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

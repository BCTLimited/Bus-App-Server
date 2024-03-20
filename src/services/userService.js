import UserProfile from "../models/userProfile.js";
import User from "../models/user.js";
import customError from "../utils/customError.js";
// const validateMongoId = require("../utils/validateMongoId");

async function registerUser(userData) {
  try {
    const user = await User.create({ ...userData });
    const userProfile = await UserProfile.create({
      userId: user._id,
      ...userData,
    });

    return { user, userProfile };
  } catch (error) {
    throw error;
  }
}

async function updateUserProfile(userId, userDetails) {
  try {
    // Updating userProfile model
    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      userDetails
    );
    return { message: "Details Updated Successfully!", userProfile };
  } catch (error) {
    throw error;
  }
}

async function updateUserModel(userId, userInfo) {
  const userProfile = await UserProfile.findOne({ _id: userId });
  try {
    // Updating user model
    await User.findOneAndUpdate({ _id: userProfile.userId }, userInfo);
    return { message: "User Info Updated Successfully!" };
  } catch (error) {
    throw error;
  }
}

async function validatePassword(userId, password) {
  if (!password) {
    throw customError(401, "Please provide password");
  }
  const userProfile = await UserProfile.findOne({ _id: userId });
  if (!userProfile) {
    throw customError(404, "This User Doesn't Exist");
  }

  const user = await User.findOne({ _id: userProfile.userId });
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }
}

async function isUserVerified(userId) {
  const userProfile = await UserProfile.findOne({ userId });
  return userProfile && userProfile.isVerified;
}

export default {
  registerUser,
  updateUserProfile,
  updateUserModel,
  validatePassword,
  isUserVerified,
};

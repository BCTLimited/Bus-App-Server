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
      { userId },
      userDetails
    );

    if (!userProfile) {
      throw customError(400, "User Profile Not Found");
    }

    console.log(userProfile);
    return { message: "Details Updated Successfully!", userProfile };
  } catch (error) {
    console.log(`Error updating userProfile Model ${error.message}`);
    throw error;
  }
}

async function updateUserModel(userId, userInfo) {
  try {
    // Updating user model
    const user = await User.findOneAndUpdate({ _id: userId }, userInfo);
    if (!user) {
      throw customError(400, "User Not Found");
    }
    return { message: "User Info Updated Successfully!" };
  } catch (error) {
    console.log(`Error updating user Model ${error.message}`);
    throw error;
  }
}

async function validatePassword(userId, password) {
  if (!password) {
    throw customError(401, "Please provide password");
  }

  const user = await User.findById(userId);
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }
}

async function isUserVerified(userId) {
  const userProfile = await UserProfile.findOne({ userId });

  if (!userProfile) {
    throw customError(404, "User doesn't exist");
  }

  return userProfile.isVerified;
}

export default {
  registerUser,
  updateUserProfile,
  updateUserModel,
  validatePassword,
  isUserVerified,
};

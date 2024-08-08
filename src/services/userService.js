import UserProfile from "../models/userProfile.js";
import User from "../models/user.js";
import customError from "../utils/customError.js";
import user from "../models/user.js";
// const validateMongoId = require("../utils/validateMongoId");

const excludedFields = ["-password", "-__v", "-createdAt", "-updatedAt"];

async function registerUser(userData) {
  // checks for the required fields on userData
  const fields = [
    "userName",
    "lastName",
    "phoneNumber",
    "email",
    "homeLocation",
  ];

  const missingField = fields.find((field) => !userData[field]);
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  const user = await User.findOne({ email: userData?.email.toLowerCase() });

  if (user) {
    throw customError(400, "User with this email already exists");
  }

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

async function findUserByEmail(email) {
  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    excludedFields
  );

  if (!user) {
    throw customError(401, "No User with this Email");
  }

  return user;
}

async function findUserProfileById(userId) {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "userId",
      select: excludedFields,
    })
    .select(excludedFields);

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }
  return userProfile;
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

    return { message: "Details Updated Successfully!", userProfile };
  } catch (error) {
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
  findUserByEmail,
  findUserProfileById,
};

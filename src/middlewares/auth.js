import jwt from "jsonwebtoken";
import customError from "../utils/customError.js";
import User from "../models/user.js";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(customError(401, "No Token Provided"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, username: payload.username };
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return next(customError(401, "Token Expired"));
    }
    return next(customError(401, "Invalid Token"));
  }
};

const isAdmin = async (req, res, next) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });

  if (!user || user.role !== "admin") {
    return next(customError(401, "Unauthorized"));
  }

  next();
};

export { auth, isAdmin };

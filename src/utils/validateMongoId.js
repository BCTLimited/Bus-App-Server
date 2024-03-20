import mongoose from "mongoose";

const validateMongoId = (id) => {
  // Checks if id is a valid mongoose id
  const isValid = mongoose.isValidObjectId(id);
  return isValid;
};

export default validateMongoId;

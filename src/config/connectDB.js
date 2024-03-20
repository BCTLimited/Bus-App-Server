import mongoose from "mongoose";

const connectDB = async (url) => {
  return await mongoose.connect(url, {
    dbName: "BUS-APP",
  });
};

export default connectDB;

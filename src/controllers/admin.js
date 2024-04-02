import Users from "../models/user.js";

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ users });
};

export { getAllUsers };

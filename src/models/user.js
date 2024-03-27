import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      trim: true,
      required: [true, "Please provide an a username"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Please provide an last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [3, "Password is too short"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log("password hashed");
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  // Check if the password is being modified
  if (!this._update.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this._update.password, salt);
    this._update.password = hashedPassword;
    console.log("Password hashed for update");
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (incomingPassword) {
  const isMatch = await bcrypt.compare(incomingPassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);

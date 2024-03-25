import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import {
  addNewDriver,
  getAllDrivers,
  getDriverDetails,
  updateDriver,
} from "../controllers/driver.js"; // Update import statements

const router = express.Router();

// Driver Routes
router
  .route("/")
  .get(getAllDrivers) // Update to use getAvailableDrivers
  .post(addNewDriver) // Update to use addNewDriver
  .all(methodNotAllowed);
router
  .route("/:id")
  .get(getDriverDetails)
  .patch(updateDriver)
  .all(methodNotAllowed); // Update to use getDriverDetails and updateDriver

export default router;

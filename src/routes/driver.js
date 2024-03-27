import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import {
  addNewDriver,
  getAllDrivers,
  getDriverDetails,
  updateDriver,
} from "../controllers/driver.js";

const router = express.Router();

// Driver Routes
router.route("/").get(getAllDrivers).post(addNewDriver).all(methodNotAllowed);
router
  .route("/:id")
  .get(getDriverDetails)
  .patch(updateDriver)
  .all(methodNotAllowed);

export default router;

import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import {
  addNewBus,
  getAvailableBuses,
  getBusDetails,
  updateBus,
} from "../controllers/bus.js";

const router = express.Router();

// User Routes
router
  .route("/")
  .get(auth, getAvailableBuses)
  .post(addNewBus)
  .all(methodNotAllowed);
router.route("/:id").get(getBusDetails).patch(updateBus).all(methodNotAllowed);

export default router;

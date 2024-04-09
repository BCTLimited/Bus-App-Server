import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth, isAdmin } from "../middlewares/auth.js";
import {
  bookTrip,
  getAllTrips,
  getSingleTrip,
  updateTrip,
} from "../controllers/trip.js";

const router = express.Router();

router
  .route("/")
  .get(auth, getAllTrips)
  .post(auth, bookTrip)
  .all(methodNotAllowed);
router
  .route("/:tripId")
  .get(getSingleTrip)
  .patch(isAdmin, updateTrip)
  .all(methodNotAllowed);

export default router;

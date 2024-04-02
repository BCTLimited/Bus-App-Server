import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import { bookTrip, getAllTrips, getTripCode } from "../controllers/trip.js";

const router = express.Router();

router
  .route("/")
  .get(auth, getAllTrips)
  .post(auth, bookTrip)
  .all(methodNotAllowed);
// router.route("/:id").get().patch().all(methodNotAllowed);
router.route("/:id/code").get(auth, getTripCode).all(methodNotAllowed);

export default router;

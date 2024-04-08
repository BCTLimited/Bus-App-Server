import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { getDriverRatings, rateRide } from "../controllers/rating.js";

const router = express.Router();

// Rating Routes
// router.route("/").all(methodNotAllowed);

router.route("/:routeId").post(rateRide).all(methodNotAllowed);
router.route("/driver/:driverId").get(getDriverRatings).all(methodNotAllowed);

export default router;

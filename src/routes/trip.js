import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import { bookTrip } from "../controllers/trip.js";

const router = express.Router();

router.route("/").get(auth).post(auth, bookTrip).all(methodNotAllowed);
// router.route("/:id").get().patch().all(methodNotAllowed);

export default router;

import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { getAllRiders, getSingleRider } from "../controllers/rider.js";
const router = express.Router();

router.route("/").get(getAllRiders).all(methodNotAllowed);
router.route("/:riderId").get(getSingleRider).all(methodNotAllowed);

export default router;

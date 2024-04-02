import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { getLocations } from "../controllers/location.js";

const router = express.Router();

// Location Routes
router.route("/").get(getLocations).all(methodNotAllowed);

export default router;

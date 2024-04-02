import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import {
  addLocation,
  deleteLocation,
  getLocations,
  getSingleLocation,
  updateLocation,
} from "../controllers/location.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Location Routes
router
  .route("/")
  .get(getLocations)
  .post(isAdmin, addLocation)
  .all(methodNotAllowed);

router
  .route("/:id")
  .get(isAdmin, getSingleLocation)
  .patch(isAdmin, updateLocation)
  .delete(isAdmin, deleteLocation)
  .all(methodNotAllowed);

export default router;

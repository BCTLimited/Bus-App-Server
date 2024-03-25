import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { auth } from "../middlewares/auth.js";
import {
  addNewRoute,
  getAvailableRoutes,
  getRouteDetails,
  updateRoute,
} from "../controllers/route.js";

const router = express.Router();

// User Routes
router
  .route("/")
  .get(getAvailableRoutes)
  .post(addNewRoute)
  .all(methodNotAllowed);
router
  .route("/:id")
  .get(getRouteDetails)
  .patch(updateRoute)
  .all(methodNotAllowed);

export default router;

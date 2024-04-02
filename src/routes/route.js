import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import { isAdminOrDriver, isAdmin } from "../middlewares/auth.js";
import {
  addNewRoute,
  deleteRoute,
  getAvailableRoutes,
  getDriverRoutes,
  getRouteDetails,
  updateRoute,
} from "../controllers/route.js";

const router = express.Router();

router
  .route("/")
  .get(getAvailableRoutes)
  .post(isAdmin, addNewRoute)
  .all(methodNotAllowed);

router.route("/driver").get(isAdminOrDriver, getDriverRoutes);
router
  .route("/:id")
  .get(getRouteDetails)
  .patch(isAdminOrDriver, updateRoute)
  .delete(isAdmin, deleteRoute)
  .all(methodNotAllowed);

export default router;

import express from "express";
import methodNotAllowed from "../utils/methodNotAllowed.js";
import {
  createDriver,
  createTrip,
  createVehicle,
  deleteTrip,
  getAllDrivers,
  getAllRiders,
  getAllTrips,
  getAllVehicles,
  getDriver,
  getRider,
  getTrip,
  getVehicle,
  updateDriver,
  updateTrip,
  updateVehicle,
} from "../controllers/admin.js";

const router = express.Router();

router.route("/route").get(getAllTrips).post(createTrip).all(methodNotAllowed);
router
  .route("/route/:routeId")
  .get(getTrip)
  .patch(updateTrip)
  .delete(deleteTrip)
  .all(methodNotAllowed);

router.route("/rider").get(getAllRiders).all(methodNotAllowed);
router.route("/rider/:riderId").get(getRider).all(methodNotAllowed);

router
  .route("/driver")
  .get(getAllDrivers)
  .post(createDriver)
  .patch(updateDriver)
  .all(methodNotAllowed);
router.route("/driver/:driverId").get(getDriver).all(methodNotAllowed);

router
  .route("/bus")
  .get(getAllVehicles)
  .post(createVehicle)
  .patch(updateVehicle)
  .all(methodNotAllowed);
router.route("/bus/:busId").get(getVehicle).all(methodNotAllowed);

export default router;

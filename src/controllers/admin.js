import asyncWrapper from "../middlewares/asyncWrapper.js";
import busService from "../services/busService.js";
import routeService from "../services/routeService.js";
import riderService from "../services/riderService.js";
import driverService from "../services/driverService.js";

// Trips
const getAllTrips = asyncWrapper(async (req, res) => {
  const { routes, count, counts, pagination } =
    await routeService.getAvailableRoutes(req.query);
  res.status(200).json({ routes, count, counts, pagination });
});

const getTrip = asyncWrapper(async (req, res) => {
  const { routeId } = req.params;
  const route = await routeService.getRouteDetails(routeId);
  res.status(200).json({ route });
});

const createTrip = asyncWrapper(async (req, res) => {
  const route = await routeService.addNewRoute(req.body);
  res.status(200).json({ message: "Route Added", route });
});

const updateTrip = asyncWrapper(async (req, res) => {
  const { routeId } = req.params;
  const route = await routeService.updateRoute(routeId, req.body);
  res.status(200).json({ message: "Route Updated", route });
});

const deleteTrip = asyncWrapper(async (req, res) => {
  const { routeId } = req.params;
  const route = await routeService.deleteRoute(routeId);
  res.status(200).json({ message: "Route Deleted", route });
});

// Riders
const getAllRiders = asyncWrapper(async (req, res) => {
  const { riders, count, pages, pagination, monthlyStats } =
    await riderService.getAllRiders(req.query);
  res.status(200).json({ riders, count, pages, pagination, monthlyStats });
});

const getRider = asyncWrapper(async (req, res) => {
  const { riderId } = req.params;
  const rider = await riderService.getRider(riderId);
  res.status(200).json({ rider });
});

// Drivers
const getAllDrivers = asyncWrapper(async (req, res) => {
  const { drivers, count, pagination } = await driverService.getAllDrivers(
    req.query
  );
  res.status(200).json({ drivers, count, pagination });
});

const createDriver = asyncWrapper(async (req, res) => {
  const driver = await driverService.addNewDriver(req.body, req.files);
  res.status(200).json({ message: "Driver Added", driver });
});

const getDriver = asyncWrapper(async (req, res) => {
  const { driverId } = req.params;
  const driver = await driverService.getDriverDetails(driverId);
  res.status(200).json({ driver });
});

const updateDriver = asyncWrapper(async (req, res) => {
  const { driverId } = req.params;
  if (req.files && req.files.image) {
    req.body.image = req.files.image;
  }
  const driver = await driverService.updateDriver(driverId, req.body);
  res.status(200).json({ message: "Driver Updated" });
});

const deleteDriver = asyncWrapper(async (req, res) => {
  const { driverId } = req.params;
  res.status(200).json({ message: "Soon" });
});

// Vehicles
const getAllVehicles = asyncWrapper(async (req, res) => {
  const { buses, count, pages, pagination } =
    await busService.getAvailableBuses(req.query);
  res.status(200).json({ buses, count, pages, pagination });
});

const getVehicle = asyncWrapper(async (req, res, next) => {
  const { busId } = req.params;
  const bus = await busService.getBusDetails(busId);
  res.status(200).json({ bus });
});

const createVehicle = asyncWrapper(async (req, res, next) => {
  const bus = await busService.addNewBus(req.body);
  res.status(200).json({ message: "Bus Added", bus });
});

const updateVehicle = asyncWrapper(async (req, res, next) => {
  const { busId } = req.params;
  const bus = await busService.updateBus(id, req.body);
  res.status(200).json({ message: "Bus Updated", bus });
});

const deleteVehicle = asyncWrapper(async (req, res) => {
  const { busId } = req.params;
  res.status(200).json({ message: "Soon" });
});

export {
  getAllTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getAllRiders,
  getRider,
  getAllDrivers,
  createDriver,
  getDriver,
  updateDriver,
  deleteDriver,
  getAllVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};

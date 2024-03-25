import asyncWrapper from "../middlewares/asyncWrapper.js";
import DriverService from "../services/driverService.js";

const getAllDrivers = asyncWrapper(async (req, res) => {
  const drivers = await DriverService.getAllDrivers();
  res.status(200).json({ drivers });
});

const addNewDriver = asyncWrapper(async (req, res) => {
  const driver = await DriverService.addNewDriver(req.body);
  res.status(200).json({ message: "Driver Added", driver });
});

const updateDriver = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const driver = await DriverService.updateDriver(id, req.body);
  res.status(200).json({ message: "Driver Updated", driver });
});

const getDriverDetails = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const driver = await DriverService.getDriverDetails(id);
  res.status(200).json({ driver });
});

export { getAllDrivers, addNewDriver, updateDriver, getDriverDetails };

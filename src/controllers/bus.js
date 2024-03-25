import asyncWrapper from "../middlewares/asyncWrapper.js";
import BusService from "../services/busService.js";

const getAvailableBuses = asyncWrapper(async (req, res, next) => {
  // const { pickUp, dropOff } = req.query;
  const buses = await BusService.getAvailableBuses();
  res.status(200).json({ buses });
});

const addNewBus = asyncWrapper(async (req, res, next) => {
  const bus = await BusService.addNewBus(req.body);
  res.status(200).json({ message: "Bus Added", bus });
});

const updateBus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const bus = await BusService.updateBus(id, req.body);
  res.status(200).json({ message: "Bus Updated", bus });
});

const getBusDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const bus = await BusService.getBusDetails(id);
  res.status(200).json({ bus });
});

export { getAvailableBuses, addNewBus, updateBus, getBusDetails };

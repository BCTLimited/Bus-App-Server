import BusService from "../services/busService.js";

const getAvailableBuses = async (req, res, next) => {
  try {
    const { pickUp, dropOff } = req.query;
    const buses = await BusService.getAvailableBuses(pickUp, dropOff);
    res.status(200).json({ buses });
  } catch (error) {
    next(error);
  }
};

const addNewBus = async (req, res, next) => {
  try {
    const bus = await BusService.addNewBus(req.body);
    res.status(200).json({ message: "Bus Added", bus });
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  const { id } = req.params;
  try {
    const bus = await BusService.updateBus(id, req.body);
    res.status(200).json({ message: "Bus Updated", bus });
  } catch (error) {
    next(error);
  }
};

const getBusDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    const bus = await BusService.getBusDetails(id);
    res.status(200).json({ bus });
  } catch (error) {
    next(error);
  }
};

export { getAvailableBuses, addNewBus, updateBus, getBusDetails };
import asyncWrapper from "../middlewares/asyncWrapper.js";
import locationService from "../services/locationService.js";

const getLocations = asyncWrapper(async (req, res) => {
  const locations = await locationService.getLocations();
  res.status(200).json(locations);
});

const addLocation = asyncWrapper(async (req, res) => {
  const location = await locationService.addLocation(req.body);
  res.status(200).json({ message: "Location Added", location });
});

const updateLocation = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const location = await locationService.updateLocation(id, req.body);
  res.status(200).json({ message: "Location Updated", location });
});

const deleteLocation = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const location = await locationService.deleteLocation(id, req.body);
  res.status(200).json({ message: "Location Deleted", location });
});

const getSingleLocation = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const location = await locationService.getSingleLocation(id);
  res.status(200).json({ location });
});

export {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getSingleLocation,
};

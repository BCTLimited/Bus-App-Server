import asyncWrapper from "../middlewares/asyncWrapper.js";
import RouteService from "../services/routeService.js";

const getAvailableRoutes = asyncWrapper(async (req, res, next) => {
  const { pickUp, dropOff } = req.query;
  const routes = await RouteService.getAvailableRoutes(pickUp, dropOff);
  res.status(200).json({ routes });
});

const addNewRoute = asyncWrapper(async (req, res, next) => {
  const route = await RouteService.addNewRoute(req.body);
  res.status(200).json({ message: "Route Added", route });
});

const updateRoute = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const route = await RouteService.updateRoute(id, req.body);
  res.status(200).json({ message: "Route Updated", route });
});

const getRouteDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const route = await RouteService.getRouteDetails(id);
  res.status(200).json({ route });
});

export { getAvailableRoutes, addNewRoute, updateRoute, getRouteDetails };

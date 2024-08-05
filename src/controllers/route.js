import asyncWrapper from "../middlewares/asyncWrapper.js";
import RouteService from "../services/routeService.js";

const getAvailableRoutes = asyncWrapper(async (req, res, next) => {
  // Get the current time and the time 48 hours later
  const currentTime = new Date();
  const nextDayTime = new Date(currentTime.getTime() + 48 * 60 * 60 * 1000);
  const startDate = currentTime.toISOString().split("T")[0];
  const endDate = nextDayTime.toISOString().split("T")[0];
  const { routes, count, counts, pagination } =
    await RouteService.getAvailableRoutes({ ...req.query, startDate, endDate });
  res.status(200).json({ routes, count, counts, pagination });
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

const deleteRoute = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const route = await RouteService.deleteRoute(id);
  res.status(200).json({ message: "Route Deleted", route });
});

const getRouteDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const route = await RouteService.getRouteDetails(id);
  res.status(200).json({ route });
});

const getDriverRoutes = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const route = await RouteService.getDriverRoutes(userId);
  res.status(200).json({ route });
});

export {
  getAvailableRoutes,
  addNewRoute,
  updateRoute,
  deleteRoute,
  getRouteDetails,
  getDriverRoutes,
};

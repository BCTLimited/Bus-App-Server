import TripService from "../services/tripService.js";

const bookTrip = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const trip = await TripService.bookTrip(userId, req.body);
    res.status(200).json({ message: "Trip Booked", trip });
  } catch (error) {
    next(error);
  }
};

export { bookTrip };

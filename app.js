import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import connectDB from "./src/config/connectDB.js";
import notFound from "./src/middlewares/notFound.js";
import errorMiddleware from "./src/middlewares/error.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import { auth, isAdmin } from "./src/middlewares/auth.js";
import rateLimitMiddleware from "./src/middlewares/rateLimitMiddleware.js";

// Routes
import authRouter from "./src/routes/auth.js";
import busRouter from "./src/routes/bus.js";
import tripRouter from "./src/routes/trip.js";
import ratingRouter from "./src/routes/rating.js";
import driverRouter from "./src/routes/driver.js";
import routeRouter from "./src/routes/route.js";
import locationRouter from "./src/routes/location.js";
import riderRouter from "./src/routes/rider.js";
import adminRouter from "./src/routes/admin.js";

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
//Logging
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// Apply the rate limiter to all requests
app.use(rateLimitMiddleware);

// General Routes
app.use("/api/auth", authRouter);
app.use("/api/trip", auth, tripRouter);
app.use("/api/rating", auth, ratingRouter);

// **
app.use("/api/route", auth, routeRouter);
app.use("/api/location", auth, locationRouter);

// Admin routes
app.use("/api/driver", auth, isAdmin, driverRouter);
app.use("/api/bus", auth, isAdmin, busRouter);
app.use("/api/rider", auth, isAdmin, riderRouter);
app.use("/api/admin", auth, isAdmin, adminRouter);

app.use(notFound);
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    console.log(`DB Connected!`);
    app.listen(port, console.log(`Server is listening at PORT:${port}`));
  } catch (error) {
    console.log(`Couldn't connect because of ${error.message}`);
    process.exit(1); //
  }
};

start();

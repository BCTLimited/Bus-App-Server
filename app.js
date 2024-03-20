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

// Routes
import authRouter from "./src/routes/auth.js";
import busRouter from "./src/routes/bus.js";
import tripRouter from "./src/routes/trip.js";

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

app.use("/api/auth", authRouter);
app.use("/api/bus", busRouter);
app.use("/api/trip", tripRouter);

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

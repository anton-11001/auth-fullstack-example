const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectToDb = require("./db/connectToDb");
const errorMiddleware = require("./middlewares/error");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.use((req, res) => {
  return res.status(404).json({
    message: "Endpoint not found",
  });
});

app.use(errorMiddleware);

const start = async () => {
  try {
    await connectToDb();

    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

start();

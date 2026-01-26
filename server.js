import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  throw new Error("DATABASE or DATABASE_PASSWORD missing in config.env");
}

//replacing password placeholder with actual password
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful"));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

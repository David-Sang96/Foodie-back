/* eslint-disable no-undef */
const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT, "127.0.0.1", () => {
      console.log(`server is listening on port ${process.env.PORT}...`);
    });
  })
  .catch((err) => console.log(err));

/* eslint-disable no-undef */
const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");
const port = process.env.PORT || 8100;

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to database");
    app.listen(port, "127.0.0.1", () => {
      console.log(`server is listening on port ${port}...`);
    });
  })
  .catch((err) => console.log(err));

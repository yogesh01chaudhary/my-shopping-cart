const mongoose = require("mongoose");
const { DATABASE_URL } = process.env;
exports.connect = () => {
  mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("DATABASE CONNECTED SUCCESSFULLY");
    })
    .catch((e) => {
      console.log({ error: e.name, message: "DATABASE CONNECTION FAILED" });
      process.exit(1);
    });
};

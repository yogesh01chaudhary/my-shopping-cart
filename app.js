const express = require("express");
const app = express();

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileUpload");

//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookies and File Upload
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

//temp check
app.set("view engine", "ejs");

//morgan middleware
// app.use(morgan(":id :method :url :response-time"))
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/homeRoute");
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const payment = require("./routes/paymentRoute");
const order = require("./routes/orderRoute");

//route middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

//signup test
app.get("/signuptest", (req, res) => {
  res.render("signup");
});
module.exports = app;

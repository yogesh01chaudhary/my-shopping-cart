const express = require("express");
const router = express.Router();
const {
  sendStripeKey,
  captureStripePayment,
  sendRazorPayKey,
  captureRazorPayPayment,
} = require("../controllers/paymentController");

const { isLoggedIn, customRole } = require("../middleware/userMiddleware");

router.route("/stripeKey").get(isLoggedIn, sendStripeKey);
router.route("/stripePayment").post(captureStripePayment);
router.route("/razorPaykey").get(isLoggedIn, sendRazorPayKey);
router.route("/razorPayPayment").post(captureRazorPayPayment);

module.exports = router;

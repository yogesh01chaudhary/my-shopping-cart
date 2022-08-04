const BigPromise = require("../middleware/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({ stripekey: process.env.STRIPE_KEY });
});

exports.captureStripePayment = BigPromise(async (rq, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currnecy: "inr",

    metadata: { integration_check: "accept_a_payment " },
  });

  res
    .status(200)
    .json({
      success: true,
      amount: req.body.amount,
      client_secret: paymentIntent.client_secret,
    });
});

exports.sendRazorPayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({ stripekey: process.env.RAZORPAY_API_KEY });
});

exports.captureRazorPayPayment = BigPromise(async (rq, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
  });

  res
    .status(200)
    .json({ sucess: true, amount: req.body.amount, order: myOrder });
});

const BigPromise = require("../middleware/bigPromise");
exports.home = BigPromise(async (req, res) => {
  // const db =await Userdb.findOne({email})
  res
    .status(200)
    .send({ message: "Hello Radhey Welcome to Shopping Cart", success: true });
});

exports.homeDummy = (req, res) => {
  try {
    {
      // const db =await Userdb.findOne({email})
      res.status(200).send({
        message: "Hello Radhey Welcome to Shopping Cart Again",
        success: true,
      });
    }
  } catch (e) {
    console.log({ error: e.name });
  }
};

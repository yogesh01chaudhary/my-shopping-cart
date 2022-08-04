const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
  managerAllUser,
} = require("../controllers/userController");

const { isLoggedIn, customRole } = require("../middleware/userMiddleware");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userDashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/user/update").post(isLoggedIn, updateUserDetails);

router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);
module.exports = router;

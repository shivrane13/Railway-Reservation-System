const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const userController2 = require("../controller/userController2");

router.get("/", userController.homePage);
router.get("/search", userController.getSearchPage);
router.get("/history", userController.getHistoryPage);
router.get("/create-account", userController.getCreateAccount);
router.get("/login", userController.getLoginPage);
router.get("/review/:id", userController.getReview);
router.get(
  "/booktikit/:id/:source/:destination/:date",
  userController.getBookTikit
);
router.get("/tikitbooksuccessfully", userController.getsuccefullmsg);
router.get("/about", userController.getAboutPage);
router.get("/contact", userController.getContactPage);

router.get(
  "/getStationNamesRecomendation/:inputSname",
  userController.getStationNamesRecomendation
);
router.get(
  "/getStationCodeRecomendation/:code",
  userController.getStationCodeRecomendation
);
router.get(
  "/getTrainNumberRecomendation/:trainno",
  userController.getTrainNumberRecomendation
);

router.get("/billPage/:id", userController.getTrainTikitPage);
router.get("/downloadTikit/:id", userController.downloadTickit);

router.post("/searchTrainbyname", userController.getTrainByName);
router.post("/searchBtnStation", userController.getTrainsbtwnStation);

router.post("/create-account", userController2.CreateAccount);
router.post("/login", userController2.userLogin);
router.post("/logout", userController2.userLogout);

router.post("/review", userController2.saveReview);
router.post("/review/:rid/delete", userController2.deleteReview);
router.post("/booktikit", userController2.bookTicket);

router.post(
  "/tickit/cancle/:ticketid/:trainid/:date",
  userController2.cancleTickit
);

module.exports = router;

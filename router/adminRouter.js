const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

router.get("/home", adminController.getadminpage);
router.get("/shedule", adminController.getShedulePage);
router.get("/train", adminController.getTrainPage);
router.get("/traindetail/:trainno", adminController.getTrainByName);
router.get("/admin/tiketdetail/:id", adminController.getTicketDetail);

router.get("/trainlist", adminController.getTrainList);
router.get("/addTrain", adminController.getAddTrain);

router.get("/tikitoftrain/:trainno/:date", adminController.getTikitsofTrain);

router.get(
  "/getStationRecommendation/:inputSname",
  adminController.getStationNamesRecomendation
);

router.get(
  "/getStationCodeRecomendation/:code",
  adminController.getStationCodeRecomendation
);

router.get(
  "/getTrainNumberRecommendation/:trainno",
  adminController.getTrainNumberRecomendation
);

router.get(
  "/getTrainSheduleByDate/:date",
  adminController.getTrainSheduleByDate
);

router.post("/shedule", adminController.sheduleTrain);
router.post("/cancletrain/:id", adminController.cancleTrain);

router.post("/addTrain", adminController.addTrain);

router.post(
  "/getTickitsByNameAndDate",
  adminController.getTickitsByNameAndDate
);

router.get("/report", adminController.getReportPage);
router.post(
  "/getReportDataByTrainNumer",
  adminController.getReportDataByTrainNumer
);

module.exports = router;

const db = require("../database/data");

async function getadminpage(req, res) {
  try {
    const [data1] = await db.query(
      "select count(train_shedule_id) as totalTrain from train_shedule where date =  CURDATE() and iscancel is null "
    );
    const [data2] = await db.query(
      "select sum(price) as totalPrice from ticket where date =  CURDATE() and iscancel is null and istraincancel is null"
    );
    const [data3] = await db.query(
      "select count(id) as totalConform from ticket where date =  CURDATE() and stage = 'C' and iscancel is null and istraincancel is null"
    );
    const [data4] = await db.query(
      "select count(id) as totalTicket from ticket where date =  CURDATE() and iscancel is null and istraincancel is null"
    );
    const data = {
      totalTicket: data4[0].totalTicket,
      totalPrice: data2[0].totalPrice,
      totalConform: data3[0].totalConform,
      totalTrain: data1[0].totalTrain,
    };
    res.render("admin/home.ejs", { data: data });
  } catch (err) {
    console.log(err);
  }
}

async function getShedulePage(req, res) {
  let report;
  try {
    const [totalTrain] = await db.query(
      "select count(id) as totalTrain from trainlist"
    );
    const [totalSheduleTrain] = await db.query(
      "select count(train_shedule_id) as totaltrainShedule from train_shedule where date = CURDATE() group by iscancel"
    );

    report = {
      totalTrains: totalTrain[0] ? totalTrain[0].totalTrain : 0,
      totalSheduleTrain: totalSheduleTrain[0]
        ? totalSheduleTrain[0].totaltrainShedule
        : 0,
      totalCancleTrain: totalSheduleTrain[1]
        ? totalSheduleTrain[1].totaltrainShedule
        : 0,
    };

    const [data] = await db.query(
      `select train_shedule.* ,DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate  , trainlist.tsname as trainname 
    from train_shedule, trainlist 
    WHERE train_shedule.trainno = trainlist.trainnumber
    and date = CURDATE() `
    );
    //console.log(data);
    res.render("admin/shedule.ejs", { data: data, report: report });
  } catch (err) {
    console.log(err);
  }
}

async function getTrainSheduleByDate(req, res) {
  const date = req.params.date;
  try {
    let report;
    const [totalTrain] = await db.query(
      "select count(id) as totalTrain from trainlist"
    );

    const [totalSheduleTrain] = await db.query(
      "select count(train_shedule_id) as totaltrainShedule from train_shedule where date = ? group by iscancel",
      date
    );

    report = {
      totalTrains: totalTrain[0].totalTrain,
      totalSheduleTrain: totalSheduleTrain[0]
        ? totalSheduleTrain[0].totaltrainShedule
        : 0,
      totalCancleTrain: totalSheduleTrain[1]
        ? totalSheduleTrain[1].totaltrainShedule
        : 0,
    };

    const [data] = await db.query(
      `select train_shedule.* ,DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate  , trainlist.tsname as trainname 
    from train_shedule, trainlist 
    WHERE train_shedule.trainno = trainlist.trainnumber
    and date = ?`,
      date
    );
    const responseJson = {
      report: report,
      data: data,
    };
    res.json(responseJson);
  } catch (err) {
    console.log(err);
  }
}

async function getTrainPage(req, res) {
  try {
    const [totalTicket] = await db.query(
      "select count(id) as totalTickit from ticket where date >= CURDATE()"
    );

    const [conformTikits] = await db.query(
      "select count(id) as count from ticket where date >= CURDATE() and stage = 'C' and iscancel is null"
    );

    const [waitingTikits] = await db.query(
      "select count(id) as count from ticket where date >= CURDATE() and stage = 'W' and iscancel is null"
    );

    const [totalCancel] = await db.query(
      "select count(id) as cancelTikits from ticket where date >= CURDATE() and iscancel IS NOT NULL"
    );

    let report = {
      totalTicket: totalTicket[0].totalTickit,
      conformTikits: conformTikits[0] ? conformTikits[0].count : 0,
      waitingTikits: waitingTikits[0] ? waitingTikits[0].count : 0,
      totalCancel: totalCancel[0] ? totalCancel[0].cancelTikits : 0,
    };

    const [data] = await db.query(
      "select *, DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate from ticket WHERE date >= CURDATE() ORDER BY id DESC"
    );
    res.render("admin/tikit.ejs", { data: data, report: report });
  } catch (err) {
    console.log(err);
  }
}

async function getTickitsByNameAndDate(req, res) {
  try {
    const date = req.body.date;
    const trainno = req.body.trainno;

    const [totalTicket] = await db.query(
      "select count(id) as totalTickit from ticket where trainSheduleDate = ? and trainno = ?",
      [date, trainno]
    );

    const [conformTikits] = await db.query(
      "select count(id) as count from ticket where trainSheduleDate = ? and trainno = ? and stage = 'C' and iscancel is null",
      [date, trainno]
    );

    const [waitingTikits] = await db.query(
      "select count(id) as count from ticket where trainSheduleDate = ? and trainno = ? and stage = 'W' and iscancel is null",
      [date, trainno]
    );

    const [totalCancel] = await db.query(
      "select count(id) as cancelTikits from ticket where trainSheduleDate = ? and trainno = ? and iscancel IS NOT NULL",
      [date, trainno]
    );

    let report = {
      totalTicket: totalTicket[0] ? totalTicket[0].totalTickit : 0,
      conformTikits: conformTikits[0] ? conformTikits[0].count : 0,
      waitingTikits: waitingTikits[0] ? waitingTikits[0].count : 0,
      totalCancel: totalCancel[0] ? totalCancel[0].cancelTikits : 0,
    };

    const [data] = await db.query(
      "select *, DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate from ticket WHERE trainSheduleDate = ? and trainno = ? ORDER BY id DESC",
      [date, trainno]
    );
    const responseOutput = {
      data: data,
      report: report,
    };
    res.json(responseOutput);
  } catch (err) {
    console.log(err);
  }
}

async function sheduleTrain(req, res) {
  try {
    const number = req.body.number;
    const date = req.body.date;
    const available = req.body.available;

    data = [number, date, available];
    await db.query(
      "INSERT INTO `train_shedule`(`trainno`,`date`,`available`)VALUES(?);",
      [data]
    );
    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
}

async function getTrainByName(req, res) {
  const no = req.params.trainno;
  try {
    const [response] = await db.query(
      "select * from trainlist where trainnumber = ?",
      no
    );
    const trainData = response[0];
    const stops = JSON.parse(trainData["allstopsArray"]);
    const [shedule_train] = await db.query(
      "select *, DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate from train_shedule where trainno = ? and date = CURDATE()",
      no
    );
    sheduleTrain_info = shedule_train[0];
    res.render("admin/searchbyno.ejs", {
      trainData: trainData,
      sheduleTrain_info: sheduleTrain_info,
      stops: stops,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" }); // Handle errors and send an appropriate response
  }
}

async function getTicketDetail(req, res) {
  try {
    const id = req.params.id;
    const [data] = await db.query("select * from ticket where id= ?", id);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let ticketDetail = data[0];
    const date = new Date(ticketDetail.date);
    const humanReadableDate = date.toLocaleDateString(undefined, options);
    ticketDetail = { ...ticketDetail, date: humanReadableDate };
    res.render("admin/tiketdetail.ejs", { ticketDetail: ticketDetail });
  } catch (err) {
    console.log(err);
  }
}

async function cancleTrain(req, res) {
  const id = req.params.id;
  try {
    await db.query(
      "UPDATE train_shedule SET iscancel = 1 WHERE train_shedule_id = ?",
      [id]
    );

    const [data] = await db.query(
      "SELECT * FROM train_shedule WHERE train_shedule_id = ?",
      [id]
    );

    if (data.length === 0) {
      return res.status(404).json({ error: "Train schedule not found" });
    }

    await db.query(
      "UPDATE ticket SET istraincancel = 1 WHERE trainno = ? AND date = ? AND id IS NOT NULL",
      [data[0].trainno, data[0].date]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error canceling train:", err);
    res
      .status(500)
      .json({ error: "An error occurred while canceling the train" });
  }
}

async function getTrainList(req, res) {
  try {
    const [data] = await db.query("select * from trainlist");
    res.render("admin/trainlist.ejs", { data: data });
  } catch (e) {
    console.log(e);
  }
}

async function getAddTrain(req, res) {
  const massage = "";
  res.render("admin/addtrain.ejs", {
    massage: massage,
  });
}

async function addTrain(req, res) {
  const formbody = req.body;
  const totalStation = parseInt(formbody.totalStation);
  try {
    let allStopArray = [];
    for (let i = 0; i < totalStation; i++) {
      StationCode = `stationcode${i}`;
      stationname = `stationname${i}`;
      arivaltime = `arivaltime${i}`;
      departureTime = `departureTime${i}`;
      Day = `Day${i}`;
      distanceFromSorce = `distanceFromSorce${i}`;

      allStopArray.push({
        StationCode: formbody[StationCode].toUpperCase(),
        StationName: formbody[stationname],
        ArivalTime: formbody[arivaltime],
        DepartureTime: formbody[departureTime],
        Day: parseInt(formbody[Day]),
        DistanceFromSorce: parseInt(formbody[distanceFromSorce]),
      });
    }

    const data = [
      formbody.trainumber,
      formbody.tsname,
      formbody.tlname,
      formbody.sorce,
      formbody.deparcherTime,
      formbody.destination,
      formbody.arivalTime,
      formbody.totaltime,
      parseInt(formbody.tkm),
      totalStation ? totalStation : 0,
      parseFloat(formbody.avgspeed),
      JSON.stringify(allStopArray),
    ];
    console.log(data);
    const [existingTrain] = await db.query(
      "select * from trainlist where trainnumber = ?",
      formbody.trainumber
    );
    if (existingTrain.length == 0) {
      await db.query(
        "INSERT INTO trainlist(`trainnumber`,`tsname`,`tlname`,`sorce`,`deparcherTime`,`detination`,`arivaltime`,`TotalTime`,`Totalkm`,`TotalStation`,`avgspeed`,`allstopsArray`) VALUES (?)",
        [data]
      );
      const massage = "Train Inserted Sucessfully";
      const isError = 0;
      res.render("admin/addtrain.ejs", { massage: massage, isError: isError });
    } else {
      const isError = 1;
      const massage = "Train number allready exist";
      res.render("admin/addtrain.ejs", { massage: massage, isError: isError });
    }
  } catch (e) {
    console.log(e);
  }
}

function getStationNamesRecomendation(req, res) {
  const input = req.params.inputSname.toUpperCase();
  const stationNames = require("../database/stationcode.json");
  let output = [];
  for (const stationName of stationNames) {
    if (stationName.name.toUpperCase().startsWith(input)) {
      output.push(stationName);
    }
  }
  res.json(output);
}

function getStationCodeRecomendation(req, res) {
  const input = req.params.code.toUpperCase();
  const stationNames = require("../database/stationcode.json");
  let output = [];
  for (const stationName of stationNames) {
    if (stationName.code.toUpperCase().startsWith(input)) {
      output.push(stationName);
    }
  }
  res.json(output);
}

async function getTikitsofTrain(req, res) {
  const trainno = req.params.trainno;
  const dateparams = req.params.date;
  try {
    const date = new Date(dateparams);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");

    const mysqlDate = `${year}-${month}-${day}`;

    const [totalTicket] = await db.query(
      "select count(id) as totalTickit from ticket where trainSheduleDate = ? and trainno = ?",
      [mysqlDate, trainno]
    );

    const [conformTikits] = await db.query(
      "select count(id) as count from ticket where trainSheduleDate = ? and trainno = ? and stage = 'C' and iscancel is null ",
      [mysqlDate, trainno]
    );

    const [waitingTikits] = await db.query(
      "select count(id) as count from ticket where trainSheduleDate = ? and trainno = ? and stage = 'W' and iscancel is null ",
      [mysqlDate, trainno]
    );

    const [totalCancel] = await db.query(
      "select count(id) as cancelTikits from ticket where trainSheduleDate = ? and trainno = ? and iscancel IS NOT NULL",
      [mysqlDate, trainno]
    );

    let report = {
      totalTicket: totalTicket[0].totalTickit,
      conformTikits: conformTikits[0] ? conformTikits[0].count : 0,
      waitingTikits: waitingTikits[0] ? waitingTikits[0].count : 0,
      totalCancel: totalCancel[0] ? totalCancel[0].cancelTikits : 0,
    };

    const [data] = await db.query(
      "select *,DATE_FORMAT(date, '%W, %M %d, %Y') AS sdate from ticket where trainno = ? and trainSheduleDate = ?",
      [trainno, mysqlDate]
    );
    res.render("admin/tikit2", { data: data, report: report });
  } catch (err) {
    console.log(err);
  }
}

async function getTrainNumberRecomendation(req, res) {
  const input = req.params.trainno;
  const [data] = await db.query(
    `select trainnumber, tsname from trainlist where trainnumber like "${input}%";`
  );
  res.json(data);
}

async function getTrainNumberFromSheduleForGettingTickits(req, res) {
  const date = req.body.date;
  const [sheduleData] = await db.query(
    "select * from train_shedule where date = ?",
    date
  );
  res.json(sheduleData);
}

async function getReportPage(req, res) {
  try {
    let data = {};
    let [cCount] = await db.query(
      "select count(id) as cCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and stage = 'C'"
    );
    let [wCount] = await db.query(
      "select count(id) as wCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and stage = 'W'"
    );
    let [cancelCount] = await db.query(
      "select count(id) as cancelCount from ticket where trainSheduleDate = CURDATE() and iscancel is not null"
    );
    cCount = cCount[0] ? cCount[0].cCount : 0;
    wCount = wCount[0] ? wCount[0].wCount : 0;
    cancelCount = cancelCount[0] ? cancelCount[0].cancelCount : 0;

    let [yCount] = await db.query(
      "select count(id) as yCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and selectedScheme = 'select'"
    );
    let [aCount] = await db.query(
      "select count(id) as aCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and selectedScheme = 'adult'"
    );
    let [childCount] = await db.query(
      "select count(id) as childCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and selectedScheme = 'child'"
    );
    let [hCount] = await db.query(
      "select count(id) as hCount from ticket where trainSheduleDate = CURDATE() and iscancel is null and selectedScheme = 'handicap'"
    );
    yCount = yCount[0] ? yCount[0].yCount : 0;
    aCount = aCount[0] ? aCount[0].aCount : 0;
    childCount = childCount[0] ? childCount[0].childCount : 0;
    hCount = hCount[0] ? hCount[0].hCount : 0;

    let [lineChart] = await db.query(
      `SELECT 
          DAYNAME(d.date) AS dayName,
          COUNT(t.id) AS totalTicket
      FROM 
          ( 
              -- Generate the last 7 days
              SELECT CURDATE() - INTERVAL n DAY AS date
              FROM (
                  SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
              ) AS days
          ) d
      LEFT JOIN ticket t 
          ON DATE(t.trainSheduleDate) = d.date
      WHERE d.date >= CURDATE() - INTERVAL 7 DAY
      GROUP BY d.date
      ORDER BY d.date ASC;
      `
    );
    const dayName = [];
    const totalTicket = [];

    for (const d of lineChart) {
      dayName.push(d.dayName);
      totalTicket.push(d.totalTicket);
    }
    data["pieChar1"] = {
      ConformCount: cCount,
      WaitingCount: wCount,
      CancelCount: cancelCount,
    };
    data["pieChar2"] = {
      youngCount: yCount,
      adultCount: aCount,
      childCount: childCount,
      handicapCount: hCount,
    };
    data["lineChart"] = {
      day: dayName,
      totalCount: totalTicket,
    };
    data = JSON.stringify(data);
    res.render("admin/report", { data: data });
  } catch (err) {
    console.log(err);
  }
}

async function getReportDataByTrainNumer(req, res) {
  const trainnumber = req.body.trainnumber;
  const date = req.body.selectedDate;
  try {
    let data = {};
    let [cCount] = await db.query(
      "select count(id) as cCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and stage = 'C'",
      [trainnumber, date]
    );
    let [wCount] = await db.query(
      "select count(id) as wCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and stage = 'W'",
      [trainnumber, date]
    );
    let [cancelCount] = await db.query(
      "select count(id) as cancelCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is not null",
      [trainnumber, date]
    );
    cCount = cCount[0] ? cCount[0].cCount : 0;
    wCount = wCount[0] ? wCount[0].wCount : 0;
    cancelCount = cancelCount[0] ? cancelCount[0].cancelCount : 0;

    let [yCount] = await db.query(
      "select count(id) as yCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and selectedScheme = 'select'",
      [trainnumber, date]
    );
    let [aCount] = await db.query(
      "select count(id) as aCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and selectedScheme = 'adult'",
      [trainnumber, date]
    );
    let [childCount] = await db.query(
      "select count(id) as childCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and selectedScheme = 'child'",
      [trainnumber, date]
    );
    let [hCount] = await db.query(
      "select count(id) as hCount from ticket where trainno = ? and trainSheduleDate = ? and iscancel is null and selectedScheme = 'handicap'",
      [trainnumber, date]
    );
    yCount = yCount[0] ? yCount[0].yCount : 0;
    aCount = aCount[0] ? aCount[0].aCount : 0;
    childCount = childCount[0] ? childCount[0].childCount : 0;
    hCount = hCount[0] ? hCount[0].hCount : 0;

    let [lineChart] = await db.query(
      `SELECT 
          DAYNAME(d.date) AS dayName,
          COUNT(t.id) AS totalTicket
      FROM 
          ( 
              -- Generate the last 7 days
              SELECT CURDATE() - INTERVAL n DAY AS date
              FROM (
                  SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
              ) AS days
          ) d
      LEFT JOIN ticket t 
          ON DATE(t.trainSheduleDate) = d.date
          AND t.trainno = ?
      WHERE d.date >= CURDATE() - INTERVAL 7 DAY
      GROUP BY d.date
      ORDER BY d.date ASC;
      `,
      trainnumber
    );
    const dayName = [];
    const totalTicket = [];

    for (const d of lineChart) {
      dayName.push(d.dayName);
      totalTicket.push(d.totalTicket);
    }
    data["pieChar1"] = {
      ConformCount: cCount,
      WaitingCount: wCount,
      CancelCount: cancelCount,
    };
    data["pieChar2"] = {
      youngCount: yCount,
      adultCount: aCount,
      childCount: childCount,
      handicapCount: hCount,
    };
    data["lineChart"] = {
      day: dayName,
      totalCount: totalTicket,
    };
    data = JSON.stringify(data);
    res.json({ data: data });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getadminpage: getadminpage,
  getShedulePage: getShedulePage,
  getTrainPage: getTrainPage,
  sheduleTrain: sheduleTrain,
  getTrainByName: getTrainByName,
  getTicketDetail: getTicketDetail,
  cancleTrain: cancleTrain,
  getTrainList: getTrainList,
  getAddTrain: getAddTrain,
  addTrain: addTrain,
  getStationNamesRecomendation: getStationNamesRecomendation,
  getStationCodeRecomendation: getStationCodeRecomendation,
  getTikitsofTrain: getTikitsofTrain,
  getTrainNumberRecomendation: getTrainNumberRecomendation,
  getTrainSheduleByDate: getTrainSheduleByDate,
  getTickitsByNameAndDate: getTickitsByNameAndDate,
  getTrainNumberFromSheduleForGettingTickits:
    getTrainNumberFromSheduleForGettingTickits,
  getReportPage: getReportPage,
  getReportDataByTrainNumer: getReportDataByTrainNumer,
};

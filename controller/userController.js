const axios = require("axios");
const db = require("../database/data");
const { json } = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function homePage(req, res) {
  try {
    let notifyJson = { result: false };
    if (req.session.user) {
      const userid = req.session.user.id;
      const [data] = await db.query(
        "SELECT *,DATE_FORMAT(date, '%W, %M %d, %Y') AS formatedDate FROM ticket WHERE userid = ? and date >= CURDATE() and iscancel IS NULL and istraincancel IS NULL  ORDER BY date ASC",
        userid
      );
      if (data[0]) {
        data[0] = {
          ...data[0],
          iscancel: data[0].iscancel == null ? false : true,
          istraincancel: data[0].istraincancel == null ? false : true,
        };
      }
      notifyJson["result"] = true;
      notifyJson["data"] = data[0];
    }
    notifyJson = JSON.stringify(notifyJson);
    res.render("user/index.ejs", { notifyJson: notifyJson });
  } catch (err) {
    console.log(err);
  }
}

function getSearchPage(req, res) {
  res.render("user/search.ejs");
}

async function getHistoryPage(req, res) {
  try {
    if (req.session.user) {
      const userid = req.session.user.id;
      try {
        const [data] = await db.query(
          "SELECT *,DATE_FORMAT(date, '%W, %M %d, %Y') AS formatedDate FROM ticket WHERE userid = ? and date >= CURDATE() ORDER BY date ASC",
          userid
        );

        const [data2] = await db.query(
          "SELECT *,DATE_FORMAT(date, '%W, %M %d, %Y') AS formatedDate FROM ticket WHERE userid = ? and date < CURDATE() ORDER BY date ASC",
          userid
        );

        res.render("user/history.ejs", { data: data, data2: data2 });
      } catch (err) {
        console.log(err);
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
}

function getLoginPage(req, res) {
  try {
    let sessionInputData = req.session.loginMessage;
    if (!sessionInputData) {
      sessionInputData = { hasError: false, message: "", email: "", pass: "" };
    }

    res.render("user/login.ejs", { inputData: sessionInputData });
  } catch (err) {
    console.log(err);
  }
}

function isIntegerString(value) {
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && String(parsed) === value;
}

async function getTrainByName(req, res) {
  const no = req.body.tno;
  try {
    const [response] = await db.query(
      "select * from trainlist where trainnumber = ?",
      no
    );
    const trainData = response[0];
    const stops = JSON.parse(trainData["allstopsArray"]);
    res.render("user/searchbyno.ejs", { trainData: trainData, stops: stops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" }); // Handle errors and send an appropriate response
  }
}

function formatDateToDDMMMYYYY(dateString) {
  const date = new Date(dateString);
  const humanReadableDate = date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return humanReadableDate;
}

function substractDate(initialDate, num) {
  let date = initialDate;
  let dateObj = new Date(date);

  dateObj.setDate(dateObj.getDate() - num);

  const year = dateObj.getFullYear();
  const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  const day = ("0" + dateObj.getDate()).slice(-2);
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

async function getTrainsbtwnStation(req, res) {
  const stationFrom = req.body.sfrom;
  const stationTo = req.body.sto;
  let date = req.body.date;
  var mydate = new Date(date);
  var str = mydate.toString("dd-MMMM-yyyy");
  try {
    const [response] = await db.query("select * from trainlist");
    let data = [];
    let timeofstation2 = "";
    let timeofstation1 = "";
    for (const r of response) {
      let stopjson = JSON.parse(r.allstopsArray);
      for (const stop of stopjson) {
        let fareInfo = {};
        if (stop.StationCode == stationFrom) {
          fareInfo["stationFrom"] = stop;
          timeofstation1 = stop.DepartureTime;
          for (const stop2 of stopjson) {
            if (
              stop2.StationCode == stationTo &&
              stop2.DistanceFromSorce > stop.DistanceFromSorce
            ) {
              fareInfo["stationTo"] = stop2;
              r["fareInfo"] = fareInfo;
              timeofstation2 = stop2.ArivalTime;
              r["duration"] = timeDifference(timeofstation1, timeofstation2);
              data.push(r);
            }
          }
        }
      }
    }
    for (let i = 0; i < data.length; i++) {
      let newDate = date;
      if (data[i].fareInfo.stationFrom.Day !== undefined) {
        if (data[i].fareInfo.stationFrom.Day > 1) {
          newDate = substractDate(date, data[i].fareInfo.stationFrom.Day - 1);
        }
      }
      const [shedule] = await db.query(
        "SELECT * FROM train_shedule WHERE trainno = ? and date = ?",
        [data[i].trainnumber, newDate]
      );
      if (shedule.length !== 0) {
        let waiting = [{ weighting: 0 }];
        if (shedule[0].available == 0) {
          [waiting] = await db.query(
            "select count(id) as weighting from ticket where trainno = ? and trainSheduleDate = ? and stage = 'W'",
            [data[i].trainnumber, newDate]
          );
        }
        data[i] = {
          ...data[i],
          shedule: true,
          isCancel: shedule[0].iscancel,
          available: shedule[0].available,
          waiting: waiting[0].weighting,
          isDepartured: compareDepartureTime(
            data[i].fareInfo.stationFrom.DepartureTime,
            date
          ),
        };
        //console.log(data[i]);
      } else {
        data[i] = { ...data[i], shedule: false, isCancel: null };
      }
    }
    const fdate = formatDateToDDMMMYYYY(str);

    data.sort((a, b) => {
      const timea = parseTime(a.fareInfo.stationFrom.ArivalTime);
      const timeb = parseTime(b.fareInfo.stationFrom.ArivalTime);
      return timea - timeb;
    });
    //console.log(data);
    res.render("user/search.ejs", { data: data, date: date, fdate: fdate });
  } catch (err) {
    console.error("Error fetching train data:", err);
    res.status(500).json({ error: err.message });
  }
}

function parseTime(timeStr) {
  if (timeStr.toLowerCase() === "source") return 0; // Handle 'Source' time if present

  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(1970, 0, 1, hours, minutes); // Fixed date, but use time to compare
}

function compareDepartureTime(stationDepartureTimeStr, stationDateStr) {
  // Get the current time in India (Asia/Kolkata timezone)
  const nowInIndia = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const now = new Date(nowInIndia);

  const [departureHours, departureMinutes] = stationDepartureTimeStr
    .split(":")
    .map(Number);

  const stationDate = new Date(stationDateStr);

  // Create a new Date object for the departure time using the station date and departure time
  const departureTime = new Date(
    stationDate.getFullYear(),
    stationDate.getMonth(),
    stationDate.getDate(),
    departureHours,
    departureMinutes
  );

  // Compare the current time with the departure time
  if (now > departureTime) {
    return true; // Departure time has passed
  } else {
    return false; // Departure time is in the future
  }
}

async function getReview(req, res) {
  const no = req.params.id;
  let userId = 0;
  try {
    const [response] = await db.query(
      "select * from trainlist where trainnumber = ?",
      no
    );
    const [reviews] = await db.query(
      `select review.*, user.fname
        from review, user
        where review.userid = user.userid
        and review.trainno = ?
        ORDER BY rid DESC`,
      no
    );
    if (req.session.user != null) {
      userId = req.session.user.id;
    }
    const data = response;
    const trainData = {
      tno: data[0].trainnumber,
      tname: data[0].tsname,
      totaltime: data[0].TotalTime,
      dtime: data[0].deparcherTime,
      atime: data[0].arivaltime,
      sfrom: data[0].sorce,
      sto: data[0].detination,
      tfname: data[0].tlname,
      userId: userId,
    };
    res.render("user/review.ejs", { trainData, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" }); // Handle errors and send an appropriate response
  }
}

function getCreateAccount(req, res) {
  let sessionInputData = req.session.inputMassage;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      message: "",
      fname: "",
      lname: "",
      email: "",
      pass: "",
      mno: "",
      gender: "",
      addr: "",
      Occupation: "",
      bdate: "",
      Nationality: "",
    };
  }

  res.render("user/createaccount.ejs", {
    inputData: sessionInputData,
  });
}

function timeDifference(startTime, endTime) {
  // Convert the time strings to arrays of integers [hours, minutes, seconds]
  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);
  start[2] = start[2] ? start[2] : 0;
  end[2] = end[2] ? end[2] : 0;
  // Calculate the total seconds for each time
  const startInSeconds = start[0] * 3600 + start[1] * 60 + start[2];
  const endInSeconds = end[0] * 3600 + end[1] * 60 + end[2];

  // Calculate the difference in seconds, considering overlap into the next day
  let differenceInSeconds = endInSeconds - startInSeconds;

  // If the difference is negative, add 24 hours in seconds (next day)
  if (differenceInSeconds < 0) {
    differenceInSeconds += 24 * 3600;
  }

  // Convert the difference back to hours and minutes
  const hours = Math.floor(differenceInSeconds / 3600);
  const minutes = Math.floor((differenceInSeconds % 3600) / 60);

  // Format the result as "HH:mm"
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

async function getBookTikit(req, res) {
  const stationFrom = req.params.source;
  const stationTo = req.params.destination;
  const tid = req.params.id;
  const date = req.params.date;
  const userid = req.session.user.id;
  const [user] = await db.query("SELECT * FROM USER WHERE userid = ?", userid);

  try {
    const [response] = await db.query(
      "select * from trainlist where id = ?",
      tid
    );
    const data = response[0];
    const allstationJson = JSON.parse(data.allstopsArray);
    for (const s of allstationJson) {
      if (s.StationName === stationFrom) {
        data["stationfrom"] = s;
      }
      if (s.StationName === stationTo) {
        data["stationTo"] = s;
      }
    }
    const distance =
      data.stationTo.DistanceFromSorce - data.stationfrom.DistanceFromSorce;
    const price = distance * 0.5;
    data["duration"] = timeDifference(
      data.stationfrom.DepartureTime,
      data.stationTo.ArivalTime
    );
    data["distance"] = distance;
    res.render("user/booktikit.ejs", {
      train: data,
      price: price,
      user: user[0],
      date: date,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

function getsuccefullmsg(req, res) {
  res.render("user/tikitsucc.ejs");
}

function getAboutPage(req, res) {
  res.render("user/about.ejs");
}

function getContactPage(req, res) {
  res.render("user/contact.ejs");
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

async function getTrainNumberRecomendation(req, res) {
  const input = req.params.trainno;
  const [data] = await db.query(
    `select trainnumber, tsname from trainlist where trainnumber like "${input}%";`
  );
  res.json(data);
}

async function getTrainTikitPage(req, res) {
  const id = req.params.id;
  let [data] = await db.query("select * from ticket where id = ?", id);
  data = data[0];
  data = {
    ...data,
    date: dateWithFormate(data.date),
    issuedate: dateWithFormate(data.issuedate),
  };
  res.render("user/trainTikitPDF", { data: data });
}

function dateWithFormate(date) {
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "short",
  };
  const formatedDate = new Date(date).toLocaleDateString("en-IN", options);
  return formatedDate;
}

async function downloadTickit(req, res) {
  const id = req.params.id;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the bill page
    await page.goto(`http://localhost:3000/billPage/${id}`, {
      waitUntil: "networkidle2",
    });

    // Format today's date for folder name (YYYY-MM-DD)
    const todayDate = new Date().toISOString().split("T")[0];

    const stringId = id.toString();

    await page.setViewport({ width: 1680, height: 1050 });

    const outputDir = path.join(__dirname, `../public/tickets/${todayDate}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = path.join(outputDir, `ticket${stringId}.pdf`);
    await page.pdf({
      path: pdfPath,
      printBackground: true,
      format: "A4",
    });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket${stringId}.pdf"`,
    });

    res.sendFile(pdfPath);
  } catch (e) {
    console.error("Error generating ticket:", e.message);
    res.status(500).send("Failed to generate ticket.");
  }
}

module.exports = {
  homePage: homePage,
  getSearchPage: getSearchPage,
  getHistoryPage: getHistoryPage,
  getTrainByName: getTrainByName,
  getTrainsbtwnStation: getTrainsbtwnStation,
  getReview: getReview,
  getLoginPage: getLoginPage,
  getCreateAccount: getCreateAccount,
  getBookTikit: getBookTikit,
  getsuccefullmsg: getsuccefullmsg,
  getAboutPage: getAboutPage,
  getContactPage: getContactPage,
  getStationCodeRecomendation: getStationCodeRecomendation,
  getStationNamesRecomendation: getStationNamesRecomendation,
  getTrainNumberRecomendation: getTrainNumberRecomendation,
  getTrainTikitPage: getTrainTikitPage,
  downloadTickit: downloadTickit,
};

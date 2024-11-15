const session = require("express-session");
const db = require("../database/data");

async function CreateAccount(req, res) {
  try {
    const email = req.body.email;
    const [existingUser] = await db.query(
      "SELECT email FROM USER WHERE email = ?",
      email
    );
    if (existingUser.length != 0) {
      req.session.inputMassage = {
        hasError: true,
        message: "Email is already exist",
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        pass: req.body.pass,
        mno: req.body.mno,
        gender: req.body.gender,
        addr: req.body.addr,
        Occupation: req.body.Occupation,
        bdate: req.body.bdate,
        Nationality: req.body.Nationality,
      };
      req.session.save(function () {
        res.redirect("/create-account");
      });
    } else {
      const data = [
        req.body.fname,
        req.body.lname,
        req.body.email,
        req.body.pass,
        req.body.mno,
        req.body.gender,
        req.body.addr,
        req.body.Occupation,
        req.body.bdate,
        req.body.Nationality,
      ];
      await db.query(
        "INSERT INTO user (fname, lname, email, pass, mno, gender, addr, occ, bdate, nationality) VALUES (?)",
        [data]
      );
      req.session.inputMassage = null;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
}

async function userLogin(req, res) {
  const email = req.body.email;
  const pass = req.body.password;
  try {
    const [data] = await db.query("SELECT * FROM user WHERE email = ?", email);
    if (data.length == 0 || data[0].pass != pass) {
      req.session.loginMessage = {
        hasError: true,
        message: "Invalid username or Password",
        email: email,
        pass: pass,
      };
      req.session.save(function () {
        res.redirect("/login");
      });
    } else {
      req.session.user = {
        id: data[0].userid,
        email: data[0].email,
        name: data[0].fname,
      };
      req.session.loginMessage = null;
      req.session.inputMassage = null;
      req.session.isAuthenticated = true;
      req.session.save(function () {
        res.redirect("/");
      });
    }
  } catch (err) {
    console.log(err);
  }
}

async function userLogout(req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
}

async function saveReview(req, res) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = new Date().toLocaleDateString("en-IN", options);
  const data = [req.body.review, req.body.trainNo, req.body.userid, date];
  try {
    await db.query(
      "INSERT INTO review (rev, trainno, userid, date) VALUES (?)",
      [data]
    );
  } catch (err) {
    console.log(err);
  }
}

async function deleteReview(req, res) {
  const rid = req.params.rid;
  try {
    await db.query("delete from review where rid = ?;", rid);
    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
}

function getTodaysDate() {
  const date = Date.now();
  const todayDate = formatDateForSQL(date);
  return todayDate;
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

function getMax(arr, prop) {
  var max;
  for (var i = 0; i < arr.length; i++) {
    if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
      max = arr[i];
  }
  return max;
}

async function bookTicket(req, res) {
  const formData = req.body;
  let price = req.body.distance * 0.5;
  let stage = "W";
  var blockNo = "A-01";
  const inssueDate = getTodaysDate();
  try {
    trainDayAtSource = parseInt(formData.dayNo) - 1;
    const trainSheduleDate =
      trainDayAtSource >= 1
        ? substractDate(formData.date, trainDayAtSource)
        : formData.date;

    const [sno] = await db.query(
      "select max(seatno) as sno, blockNo from ticket where trainno = ? and trainSheduleDate = ? group by id",
      [formData.trianNo, trainSheduleDate]
    );
    const [available] = await db.query(
      "select available from train_shedule where trainno=? and date = ?",
      [formData.trianNo, trainSheduleDate]
    );

    const [tempdata] = await db.query(
      "select * from temp_tikit where trainno = ? and date = ?",
      [formData.trianNo, trainSheduleDate]
    );

    if (available[0].available !== null) {
      let a = available[0].available;
      if (tempdata.length != 0) {
        await db.query(
          "update train_shedule set available = ? where trainno = ? and date = ?",
          [a - 1, formData.trianNo, trainSheduleDate]
        );
        var seatno = tempdata[0].sno;
        var blockNo = tempdata[0].blockNo;
        stage = "C";
        //console.log(seatno);
        //console.log(tempdata[0].id);
        await db.query("delete from temp_tikit where id = ?", tempdata[0].id);
      } else {
        if (a > 0) {
          stage = "C";
          await db.query(
            "update train_shedule set available = ? where trainno = ? and date = ?",
            [a - 1, formData.trianNo, trainSheduleDate]
          );

          const maxSeatNo = getMax(sno, "sno");
          if (maxSeatNo == undefined) {
            var seatno = 1;
          } else {
            ns = maxSeatNo.sno;
            blockNo = maxSeatNo.blockNo;

            var seatno = ns + 1;
            var bstr = blockNo.charAt(0);
            var bno = parseInt(blockNo.slice(-2));
            if (bno < 10) {
              bno++;
            } else {
              bno = "1";
              bstr = String.fromCharCode(bstr.charCodeAt(0) + 1);
            }
            if (bno < 10) {
              blockNo = bstr + "-0" + bno;
            } else {
              blockNo = bstr + "-" + bno;
            }
          }
        }
      }
    }

    if (
      formData.selectedScheme == "child" ||
      formData.selectedScheme == "adult"
    ) {
      price = price / 2;
    } else if (formData.selectedScheme == "handicap") {
      price = price / 4;
    }
    const data = [
      formData.trianNo,
      formData.userid,
      formData.from,
      formData.DepartureTime,
      formData.destination,
      formData.ArivalTime,
      price,
      formData.date,
      formData.distance,
      seatno,
      stage == "W" ? "-" : blockNo,
      stage,
      formData.fname,
      formData.lname,
      formData.mno,
      formData.email,
      formData.trainname,
      inssueDate,
      formData.selectedScheme,
      trainSheduleDate,
    ];

    await db.query(
      `INSERT INTO ticket
     (trainno,userid,source,DepartureTime,destination,ArivalTime,price,date,km,seatno,blockNo,stage,fname,lname,mno,email, trainname,issuedate, selectedScheme,trainSheduleDate) VALUES
          (?)`,
      [data]
    );

    res.redirect("/history");
  } catch (err) {
    console.log(err);
  }
}

function formatDateForSQL(dateString) {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Get the year, month, and day parts from the Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Format the date as YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

async function cancleTickit(req, res) {
  const tikitid = req.params.ticketid;
  const trainid = req.params.trainid;
  try {
    const date = formatDateForSQL(req.params.date);
    let [tikitData] = await db.query(
      "select * from ticket where id = ?",
      tikitid
    );
    tikitData = tikitData[0];

    await db.query("update ticket set iscancel = 1 where id = ?", tikitid);

    const seatno = tikitData.seatno;
    const blockNo = tikitData.blockNo;

    const [isthere] = await db.query(
      "select * from ticket where trainno = ? and trainSheduleDate = ? and stage = 'W'",
      [trainid, tikitData.trainSheduleDate]
    );

    if (isthere.length != 0) {
      await db.query(
        `UPDATE ticket JOIN ( 
                      SELECT min(id) AS min_id
                      FROM ticket WHERE trainno = ? 
                      AND trainSheduleDate = ?
                      AND stage = "W") AS subquery
                  ON ticket.id = subquery.min_id
                  SET ticket.seatno = ?, ticket.blockNo = ? ,ticket.stage = "C"`,
        [trainid, tikitData.trainSheduleDate, seatno, blockNo]
      );
    } else {
      const [data] = await db.query(
        "select available from train_shedule where trainno = ? and date = ?",
        [trainid, tikitData.trainSheduleDate]
      );
      const avb = data[0].available;
      const nabv = avb + 1;
      await db.query(
        `update train_shedule set available = ${nabv} where trainno = ? and date = ?`,
        [trainid, tikitData.trainSheduleDate]
      );
      await db.query(
        "INSERT INTO temp_tikit(sno,blockNo,trainno,date)VALUES(?, ? ,? ,?)",
        [seatno, blockNo, trainid, tikitData.trainSheduleDate]
      );
    }
    res.redirect("/history");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  CreateAccount: CreateAccount,
  userLogin: userLogin,
  userLogout: userLogout,
  saveReview: saveReview,
  deleteReview: deleteReview,
  bookTicket: bookTicket,
  cancleTickit: cancleTickit,
};

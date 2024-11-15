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

async function bookTicket(req, res) {
  const formData = req.body;
  const price = req.body.distance * 0.5;
  let stage = "W";
  var blockNo = "A-01";
  const [sno] = await db.query(
    "select max(seatno) as sno from ticket where trainno = ? and date = ?",
    [formData.trianNo, formData.date]
  );

  const [available] = await db.query(
    "select available from train_shedule where trainno=? and date = ?",
    [formData.trianNo, formData.date]
  );

  const [tempdata] = await db.query(
    "select * from temp_tikit where trainno = ? and date = ?",
    [formData.trianNo, formData.date]
  );

  //console.log(tempdata.length);

  if (available[0].available !== null) {
    let a = available[0].available;
    /*
    if (a > 0) {
      stage = "C";
      await db.query(
        "update train_shedule set available = ? where trainno = ? and date = ?",
        [a - 1, formData.trianNo, formData.date]
      );

      ns = sno[0].sno;
      if (ns == undefined) {
        var seatno = 1;
      } else {
        var seatno = ns + 1;
      }
    } else {
      if (tempdata.length != 0) {
        var seatno = tempdata[0].sno;
        stage = "C";
        //console.log(seatno);
        //console.log(tempdata[0].id);
        await db.query("delete from temp_tikit where id = ?", tempdata[0].id);
      }
    }
    */
    if (tempdata.length != 0) {
      await db.query(
        "update train_shedule set available = ? where trainno = ? and date = ?",
        [a - 1, formData.trianNo, formData.date]
      );
      var seatno = tempdata[0].sno;
      stage = "C";
      //console.log(seatno);
      //console.log(tempdata[0].id);
      await db.query("delete from temp_tikit where id = ?", tempdata[0].id);
    } else {
      if (a > 0) {
        stage = "C";
        await db.query(
          "update train_shedule set available = ? where trainno = ? and date = ?",
          [a - 1, formData.trianNo, formData.date]
        );

        ns = sno[0].sno;
        if (ns == undefined) {
          var seatno = 1;
        } else {
          var seatno = ns + 1;
        }
      }
    }
  }

  const data = [
    formData.trianNo,
    formData.userid,
    formData.from,
    formData.destination,
    price,
    formData.date,
    formData.distance,
    seatno,
    blockNo,
    stage,
    formData.fname,
    formData.lname,
    formData.mno,
    formData.email,
    formData.trainname,
  ];

  try {
    await db.query(
      `INSERT INTO ticket
     (trainno,userid,source,destination,price,date,km,seatno,blockNo,stage,fname,lname,mno,email, trainname) VALUES
          (?)`,
      [data]
    );

    res.redirect("/tikitbooksuccessfully");
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
  const date = formatDateForSQL(req.params.date);

  await db.query("update ticket set iscancel = 1 where id = ?", tikitid);
  const [s] = await db.query("select seatno from ticket where id = ?", tikitid);
  const seatno = s[0].seatno;

  const [isthere] = await db.query(
    "select * from ticket where trainno = ? and date = ? and stage = 'W'",
    [trainid, date]
  );

  if (isthere.length != 0) {
    await db.query(
      `UPDATE ticket JOIN ( 
                      SELECT min(id) AS min_id
                      FROM ticket WHERE trainno = ? 
                      AND date = ?
                      AND stage = "W") AS subquery
                  ON ticket.id = subquery.min_id
                  SET ticket.seatno = ?, ticket.stage = "C"`,
      [trainid, date, seatno]
    );
  } else {
    const [data] = await db.query(
      "select available from train_shedule where trainno = ? and date = ?",
      [trainid, date]
    );
    const avb = data[0].available;
    const nabv = avb + 1;
    await db.query(
      `update train_shedule set available = ${nabv} where trainno = ? and date = ?`,
      [trainid, date]
    );
    await db.query("INSERT INTO temp_tikit(sno,trainno,date)VALUES(?, ? ,?)", [
      seatno,
      trainid,
      date,
    ]);
  }
  res.redirect("/history");
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

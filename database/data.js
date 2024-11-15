const express = require("express");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  database: "railway",
  user: "root",
  password: "gaurav",
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySql Connected.....");
  } catch (error) {
    console.error(error);
  }
})();

module.exports = db;

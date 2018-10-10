const db2 = require('idb-pconnector');

let db;

// connection shows up in ACT under current user & type 'PJ'
function connectDatabase() {
  if (!db) {
    try {
      // connection credentials come from the user
      db = new db2.Connection().connect();
      db.debug(true);
    } catch (err) {
      console.error("Connection issue", err);
    }
  }

  return db;
}


module.exports = connectDatabase();
const { DBPool } = require('idb-pconnector');

let db;

// connection shows up in ACT under current user & type 'PJ'
function connectDatabase() {
  if (!db) {
    try {
      // connection credentials come from the user
      db = new DBPool({}, {debug: true});
    } catch (err) {
      console.error("Connection issue", err);
    }
  }

  return db;
}

module.exports = connectDatabase();

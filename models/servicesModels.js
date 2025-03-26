const db = require('../db/connection');

function fetchServices() {
    return db.query('SELECT * FROM services;').then((result) => {
        return result.rows;
      });
}

module.exports = {fetchServices};
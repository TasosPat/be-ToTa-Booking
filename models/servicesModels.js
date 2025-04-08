const db = require('../db/connection');

function fetchServices() {
    return db.query('SELECT * FROM services;').then((result) => {
        return result.rows;
      });
}

function insertService({ name, duration, price, description }) {
  return db
    .query('INSERT INTO services (name, duration, price, description) VALUES ($1, $2, $3, $4) RETURNING *;', [name, duration, price, description])
    .then(({ rows }) => {
      return rows[0];
    })
}

module.exports = {fetchServices, insertService};
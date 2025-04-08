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

function removeService(service_id) {
  return db
  .query(`DELETE FROM services WHERE service_id = $1`, [service_id])
  .then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        msg: `Service with ID "${service_id}" is not found`,
        status: 404,
      });
    }
    // { msg: 'Service deleted successfully' }
  });
}

module.exports = {fetchServices, insertService, removeService};
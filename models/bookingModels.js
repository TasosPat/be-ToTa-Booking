const db = require('../db/connection');

function insertBooking({user_id, service_id, booking_time}) {
    return db
    .query('INSERT INTO bookings (user_id, service_id, booking_time) VALUES ($1, $2, $3) RETURNING *;', [user_id, service_id, booking_time])
    .then(({ rows }) => {
        if (!rows[0].user_id || !rows[0].service_id) {
            return Promise.reject({
              status: 400,
              msg: 'Bad Request'
            });
          }
      return rows[0];
    })
}

function removeBooking(booking_id) {
  return db
    .query(`DELETE FROM bookings WHERE booking_id = $1`, [booking_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          msg: `Booking with ID "${booking_id}" is not found`,
          status: 404,
        });
      }
    });
}

module.exports = { insertBooking, removeBooking };
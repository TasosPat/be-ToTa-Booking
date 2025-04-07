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

module.exports = { insertBooking };
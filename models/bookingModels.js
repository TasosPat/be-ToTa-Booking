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

function changeBooking({ service_id, booking_time, status = "pending" }, booking_id) {
  let query = `UPDATE bookings SET `;
  const values = [];
  if(service_id) {
    query+= `service_id = $${values.length + 1}, `
    values.push(service_id);
  }
  if(booking_time) {
    query+= `booking_time = $${values.length + 1}, `
    values.push(booking_time);
  }
  query+= `status = $${values.length + 1} WHERE booking_id = $${values.length + 2} RETURNING *;`
  values.push(status, booking_id);
  return db
  .query(query, values)
  .then((booking) => {
    return booking.rows[0];
  })
}

module.exports = { insertBooking, removeBooking, changeBooking };
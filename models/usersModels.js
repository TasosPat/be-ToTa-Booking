const db = require('../db/connection');

function insertUser({name, email, phone_no}) {
    return db
    .query('INSERT INTO users (name, email, phone_no) VALUES ($1, $2, $3) RETURNING *;', [name, email, phone_no])
    .then(({ rows }) => {
      return rows[0];
    })
}

function fetchUserByID(user_id) {
    return db
    .query(`SELECT * FROM users
    WHERE users.user_id = $1 `, [user_id])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No user found for user_id: ${user_id}`
        });
      }
      return result.rows[0];
    });
}

function fetchBookings({ user_id, service_id, booking_id }) {
  let query = `SELECT * FROM bookings WHERE 1=1`
  const values = [];
  if(user_id) {
    query+=` AND user_id=$` + (values.length + 1);
    values.push(user_id)
  }
  if(service_id) {
    query+=` AND service_id=$` + (values.length + 1);
    values.push(service_id)
  }
  if(booking_id) {
    query+=` AND booking_id=$` + (values.length + 1);
    values.push(booking_id)
  }
  return db
  .query(query, values)
  .then(({ rows }) => {
    return rows;
  })
}

function removeUser(user_id) {
  return db
    .query(`DELETE FROM users WHERE user_id = $1`, [user_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          msg: `User with ID "${user_id}" is not found`,
          status: 404,
        });
      }
      // { msg: 'User deleted successfully' }
    });
}

function fetchUsers() {
  return db
  .query(`SELECT * FROM users`)
  .then(({ rows }) => {
    return rows;
  })
}

function changeUser({ name, email, phone_no }, user_id) {
  let query = `UPDATE users SET `;
  const values = [];
  if(name) {
    query+= `name = $${values.length + 1}, `
    values.push(name);
  }
  if(email) {
    query+= `email = $${values.length + 1}, `
    values.push(email);
  }
  if(phone_no) {
    query+= `phone_no = $${values.length + 1}, `
    values.push(phone_no);
  }
  query = query.slice(0, -2); 
  query+= ` WHERE user_id = $${values.length + 1} RETURNING *;`
  values.push(user_id);
  return db
  .query(query, values)
  .then((user) => {
    return user.rows[0];
  })
}

module.exports = {insertUser, fetchUserByID, fetchBookings, removeUser, fetchUsers, changeUser};
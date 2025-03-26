const db = require('../db/connection');

function insertUser({name, email, phone_no}) {
    return db
    .query('INSERT INTO users (name, email, phone_no) VALUES ($1, $2, $3) RETURNING *;', [name, email, phone_no])
    .then(({ rows }) => {
      return rows[0];
    })
}

module.exports = {insertUser};
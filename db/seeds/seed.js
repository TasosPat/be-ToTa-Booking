const db = require('../connection');
const format = require('pg-format');
const { bookingsData, servicesData, usersData } = require('../data/test-data/index');

const seed = () => {
  return db
    .query('DROP TABLE IF EXISTS bookings;')
    .then(() => db.query('DROP TABLE IF EXISTS users;'))
    .then(() => db.query('DROP TABLE IF EXISTS services;'))
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          firebase_uid VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone_no VARCHAR(20),
          role VARCHAR(50) CHECK (role IN ('user', 'admin')) DEFAULT 'user'
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE services (
          service_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          duration INT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE bookings (
          booking_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          service_id INT REFERENCES services(service_id) ON DELETE CASCADE,
          booking_time TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => {
      const insertUsersQuery = format(
        `INSERT INTO users (firebase_uid, name, email, phone_no, role) VALUES %L RETURNING *;`,
        usersData.map(({ firebase_uid, name, email, phone_no, role }) => [firebase_uid, name, email, phone_no, role])
      );
      return db.query(insertUsersQuery);
    })
    .then(() => {
      const insertServicesQuery = format(
        `INSERT INTO services (name, duration, price, description) VALUES %L RETURNING *;`,
        servicesData.map(({ name, duration, price, description }) => [
          name,
          duration,
          price,
          description,
        ])
      );
      return db.query(insertServicesQuery);
    })
    .then(() => {
      const insertBookingsQuery = format(
        `INSERT INTO bookings (user_id, service_id, booking_time, status) VALUES %L RETURNING *;`,
        bookingsData.map(({ user_id, service_id, booking_time, status }) => [
          user_id,
          service_id,
          booking_time,
          status,
        ])
      );
      return db.query(insertBookingsQuery);
    })
    .then(() => {
      console.log('✅ Database seeded successfully!');
    })
    .catch((err) => {
      console.error('❌ Error seeding database:', err);
    })
};

module.exports = seed;

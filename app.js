const express = require('express');
const cors = require('cors');
const app = express();
const { authenticate, restrictTo, checkBookingAccess, checkProfileAccess } = require("./middleware/auth");
const { getServices, addService, deleteService, updateService } = require("./controllers/servicesControllers.js");
const { addUser, getUserByID, getBookings, deleteUser, getUsers, updateUser } = require("./controllers/usersControllers.js");
const { addBooking, deleteBooking, updateBooking } = require("./controllers/bookingControllers.js");

app.use(cors());

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).send({ msg: "Server is running!" });
});

app.get('/api/services', getServices);
app.post('/api/services', addService);
app.delete('/api/services/:service_id', deleteService);
app.patch('/api/services/:service_id', updateService);

app.post('/api/users', authenticate, addUser);
app.get('/api/users', authenticate, restrictTo('admin'), getUsers);

app.get('/api/users/:user_id', authenticate, checkProfileAccess, getUserByID);
app.delete('/api/users/:user_id', deleteUser);
app.patch('/api/users/:user_id', updateUser);

app.get('/api/bookings', authenticate, checkBookingAccess, getBookings);

app.post('/api/bookings', authenticate, checkProfileAccess, addBooking);

app.delete('/api/bookings/:booking_id', deleteBooking);
app.patch('/api/bookings/:booking_id', updateBooking);


app.use((err, req, res, next) => {
    if(err.code === "22P02" || err.code === "23502") {
      res.status(400).send({ msg: 'Bad Request' });
    } else next(err);
  });

  app.use((err, req, res, next) => {
    if(err.code === "23505") {
      res.status(409).send({ msg: 'User already exists' });
    } else next(err);
  });

  app.use((err, req, res, next) => {
    if(err.code === "23503") {
      res.status(404).send({ msg: "User doesn't exist" });
    } else next(err);
  });

  app.use((err, req, res, next) => {
    if(err.status && err.msg) {
      res.status(err.status).send({msg: err.msg});
    } else next(err);
  });

  app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "Server Error!"});
  });

module.exports = app;
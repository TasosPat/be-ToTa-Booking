const {insertUser, fetchUserByID, fetchBookings, removeUser } = require("../models/usersModels.js");

function addUser(req, res, next) {
    const newUser = req.body;
    insertUser(newUser)
    .then((user) => {
        res.status(201).send({user});
    })
    .catch((err) => {
        next(err);
    })
}

function getUserByID(req, res, next) {
    const {user_id} = req.params;
    fetchUserByID(user_id)
    .then((user) => {
        res.status(200).send({ user })
    })
    .catch((err) => {
        next(err);
    })
}

function getBookings(req, res, next) {
    const { user_id, service_id, booking_id } = req.query;
    fetchBookings({ user_id, service_id, booking_id })
    .then((bookings) => {
        res.status(200).send({ bookings })
    })
    .catch((err) => {
        next(err);
    })
}

function deleteUser(req, res, next) {
    const {user_id} = req.params;
    removeUser(user_id)
    .then((result) => {
        res.status(204).send(result)
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = {addUser, getUserByID, getBookings, deleteUser};
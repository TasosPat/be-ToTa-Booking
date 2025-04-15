const {insertUser, fetchUserByID, fetchBookings, removeUser, fetchUsers, changeUser } = require("../models/usersModels.js");

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

function getUsers(req, res, next) {
    fetchUsers()
    .then((users) => {
        res.status(200).send({users})
    })
    .catch((err) => {
        next(err);
    })
}

function updateUser(req, res, next) {
    const { user_id } = req.params;
    const update = req.body;
    changeUser(update, user_id)
    .then((user) => {
        if (!user) {
            return Promise.reject({
              status: 404,
              msg: `No user found for user_id: ${user_id}`,
            });
          }
        res.status(200).send({ user })
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = {addUser, getUserByID, getBookings, deleteUser, getUsers, updateUser};
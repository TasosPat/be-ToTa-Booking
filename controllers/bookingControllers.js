const { insertBooking, removeBooking } = require("../models/bookingModels.js");

function addBooking(req, res, next) {
    const newBooking = req.body;
    insertBooking(newBooking)
    .then((booking) => {
        res.status(201).send({ booking });
    })
    .catch((err) => {
        next(err);
    })
}

function deleteBooking(req, res, next) {
    const {booking_id} = req.params;
    removeBooking(booking_id)
    .then((result) => {
        res.status(204).send(result)
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = { addBooking, deleteBooking };
const { insertBooking, removeBooking, changeBooking } = require("../models/bookingModels.js");

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

function updateBooking(req, res, next) {
    const { booking_id } = req.params;
    const update = req.body;
    changeBooking(update, booking_id)
    .then((booking) => {
        if (!booking) {
            return Promise.reject({
              status: 404,
              msg: `No booking found for booking_id: ${booking_id}`,
            });
          }
        res.status(200).send({ booking })
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = { addBooking, deleteBooking, updateBooking };
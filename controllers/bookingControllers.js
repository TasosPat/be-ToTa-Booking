const { insertBooking } = require("../models/bookingModels.js");

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

module.exports = { addBooking };
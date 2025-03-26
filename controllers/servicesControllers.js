const {fetchServices} = require("../models/servicesModels.js");

function getServices(req, res, next) {
    fetchServices()
    .then((services) => {
        res.status(200).send({ services });
    })
}

module.exports = {getServices};
const {fetchServices, insertService} = require("../models/servicesModels.js");

function getServices(req, res, next) {
    fetchServices()
    .then((services) => {
        res.status(200).send({ services });
    })
}

function addService(req, res, next) {
    const newService = req.body;
    insertService(newService)
    .then((service) => {
        res.status(201).send({service});
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = {getServices, addService};
const {fetchServices, insertService, removeService} = require("../models/servicesModels.js");

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

function deleteService(req, res, next) {
    const {service_id} = req.params;
    removeService(service_id)
    .then((result) => {
        res.status(204).send(result)
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = {getServices, addService, deleteService};
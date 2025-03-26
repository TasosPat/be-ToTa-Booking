const {insertUser} = require("../models/usersModels.js");

function addUser(req, res, next) {
    const newUser = req.body;
    insertUser(newUser)
    .then((user) => {
        res.status(201).send({user});
    })
    .catch((err) => {
        console.log(err);
        next(err);
    })
}

module.exports = {addUser};
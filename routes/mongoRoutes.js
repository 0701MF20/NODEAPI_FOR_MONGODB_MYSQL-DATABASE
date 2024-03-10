const express = require("express");
const mongosRouter = express.Router();
const mongoController = require('../controllers/mongoController');

mongosRouter.get("/", mongoController.getAllUsers);
mongosRouter.post("/", mongoController.createUser);

module.exports = mongosRouter;

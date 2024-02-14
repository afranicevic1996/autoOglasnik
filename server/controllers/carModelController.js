var express = require('express');
const dotenv = require('dotenv').config();
var CarModel = require("../models/CarModelsModel");

exports.getAllCarModels = async (req, res) => {
  var models = await CarModel.getCarModels();
  if(!models){
    var data = {error: true, message: "No models found!"}
    return res.status(200).json(data);
  }

  var data = {error: false, message: "Ok!", data: models};
  return res.status(200).json(data);
}
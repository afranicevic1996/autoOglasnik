var express = require('express');
const dotenv = require('dotenv').config();
var County = require("../models/CountyModel");

exports.getAllCounties = async (req, res) => {
    //get all
  var counties = await County.getCounties();
  if(!counties){
    var data = {error: true, message: "No counties found!"}
    return res.status(200).json(data);
  }

  var data = {error: false, message: "Ok!", data: counties};
  return res.status(200).json(data);
}
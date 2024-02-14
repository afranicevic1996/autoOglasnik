var express = require('express');
const dotenv = require('dotenv').config();
var CarBrand = require("../models/CarBrandModel");

exports.getAllCarBrands = async (req, res) => {
  var brands = await CarBrand.getCarBrands();
  if(!brands){
    var data = {error: true, message: "No brands found!"}
    return res.status(200).json(data);
  }

  var data = {error: false, message: "Ok!", data: brands};
  return res.status(200).json(data);
}
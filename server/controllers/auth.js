var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config();

exports.isLoggedIn = async (req, res) => {
  var token = req.cookies.tokenCookie;

  if(!token)
    return res.status(200).json({isLoggedIn: false});
  
  try{
    var tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  }catch(error){
    res.clearCookie("tokenCookie", {httpOnly: true});
    return res.status(200).json({isLoggedIn: false});
  }

  return res.status(200).json({isLoggedIn: true, userData: tokenData});
}

exports.logout = async (req, res) => {
    //logout
  var token = req.cookies.tokenCookie;

  if(!token)
    return res.status(200).json({error: false});

  res.clearCookie("tokenCookie", {httpOnly: true});
  return res.status(200).json({error: false});
}
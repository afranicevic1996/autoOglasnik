var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

exports.validateAuth = (req, res, next) => {
  var token = req.cookies.tokenCookie;

  //no auth cookie
  if(!token){
    var data = {error: true, message: "You are unauthenticated!"};
    return res.status(200).json(data);
  }

  try{
    var tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  }catch(error){
    //if token verification failed
    console.log("error name: " + error.name + " error text: " + error.message);
    res.clearCookie("tokenCookie", {httpOnly: true});

    var data = {error: true, message: "You are unauthenticated!"};
    return res.status(200).json(data);
  }

  //verification successful
  res.locals.tokenData = tokenData;
  next();
}
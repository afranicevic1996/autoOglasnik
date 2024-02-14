var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config();
var User = require("../models/UserModel");

exports.getUserByID = async (req, res) => {
  var tokenData = res.locals.tokenData;

  var user = await User.getUserByID(tokenData.id);
  if(!user){
    var data = {error: true, message: "Couldn't find user with given ID!"};
    return res.status(200).json(data);
  }

  var data = {error: false, message: "Ok!", data: user};
  return res.status(200).json(data);
}

exports.registerUser = async (req, res) => {
  //validacija

  //abort if user is already logged in
  if(req.cookies.tokenCookie){
    var data = {error: true, message: "Already logged in!"};
    return res.status(200).json(data);
  }

  //if user already exists
  if(await User.existsByUsernameOrEmail(req.body.username, req.body.email)){
    var data = {error: true, message: "User with this name/email combination already exists!"};
    return res.status(200).json(data);
  }

  var user = new User(null, req.body.username, req.body.email, req.body.password, "user", req.body.phoneNumber, req.body.countyID, req.body.address);
  user.password = await bcrypt.hash(user.password, 10); //password hashing

  //if registration failed
  if(!await user.registerUser()){
    var data = {error: true, message: "Registration failed, try again later!"};
    return res.status(200).json(data);
  }

  var data = {error: false, message: "Registration successful!"};
  return res.status(200).json(data);
}

exports.login = async (req, res) => {
  //validacija

  //abort if user is already logged in
  if(req.cookies.tokenCookie){
    var data = {error: true, message: "Already logged in!"};
    return res.status(200).json(data);
  }

  var user = await User.getUserByUsername(req.body.username);
  //if no user found
  if(!user){
    var data = {error: true, message: "Wrong username and password combination!"};
    return res.status(200).json(data);
  }

  //if wrong password
  if(!await bcrypt.compare(req.body.password, user.password)){
    var data = {error: true, message: "Wrong username and password combination!"};
    return res.status(200).json(data);
  }

  //creating user session
  var jwtPayload = {id: user.id, username: user.username};
  var jwToken = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {expiresIn: "2h"});
  res.cookie("tokenCookie", jwToken, 
    {
      maxAge: 3600000 * 2, //1hr * x
      httpOnly: true
    }
  );
  
  var data = {error: false, message: "Login successful!", userData: jwtPayload};
  return res.status(200).json(data);
}

exports.editProfile = async (req, res) => {
  //validacija

  var tokenData = res.locals.tokenData;
  
  var user = await User.getUserByID(tokenData.id);
  if(!user)
    return res.status(200).json({error: true, message: "Error getting user information!"});

  if(!await user.editProfile(req.body))
    return res.status(200).json({error: true, message: "Error editing user information!"});

    return res.status(200).json({error: false, message: "User information edited successfully!"});
}
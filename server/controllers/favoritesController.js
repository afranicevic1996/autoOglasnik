var express = require('express');
var Favorites = require("../models/FavoritesModel");
var Listing = require("../models/ListingsModel");
var User = require("../models/UserModel");

exports.getUsersFavStatus = async (req, res) => {
  //validacija

  var tokenData = res.locals.tokenData;
  if(!await Favorites.userHaveListingFavorited(tokenData.id, req.body.listingID))
    return res.status(200).json({error: false, favoriteStatus: false});

  return res.status(200).json({error: false, favoriteStatus: true});
}

exports.getFavoritesByUserID = async (req, res) => {
  var tokenData = res.locals.tokenData;
  var favoritedListingsID = await Favorites.getFavoritesByUserID(tokenData.id);

  if(favoritedListingsID === null)
    return res.status(200).json({error: false, message:"No favorited listings!", data: undefined});

  if(favoritedListingsID === false)
    return res.status(200).json({error: true, message: "Error getting favorites!"});

  var listingsIDArray = [];
  favoritedListingsID.forEach((item) => {
    listingsIDArray.push(item.listingID);
  });

  if(listingsIDArray.length === 1)
    var joinedIDs = listingsIDArray[0];
  else
    var joinedIDs = listingsIDArray.join();
  
  var favoritedListings = {};
  favoritedListings.data = await Listing.getListingsByMultipleIDs(joinedIDs);
  if(!favoritedListings.data)
    return res.status(200).json({error: true, message: "Error getting favorites!"});
  

  var user = await User.getUserByID(tokenData.id, false);
  favoritedListings.userInformation = user;
  return res.status(200).json({error: false, message:"Ok", data: favoritedListings});
}

exports.addFavorites = async (req, res) => {
  //validacija

  var tokenData = res.locals.tokenData;

  if(await Listing.isUsersListing(tokenData.id, req.body.listingID))
    return res.status(200).json({error: true, message: "You can't favorite your own listing!"});

  if(await Favorites.userHaveListingFavorited(tokenData.id, req.body.listingID))
    return res.status(200).json({error: true, message: "You already favorited this listing!"});

  var favorite = new Favorites(null, tokenData.id, req.body.listingID);
  if(!await favorite.createFavorite())
    return res.status(200).json({error: true, message: "Error creating favorite!"});

  return res.status(200).json({error: false, message: "Favorite created successfully!"});
}

exports.deleteFavorites = async (req, res) => {
  //validacija

  var tokenData = res.locals.tokenData;
  if(!await Favorites.deleteFavorite(tokenData.id, req.body.listingID))
    return res.status(200).json({error: true, message: "Error deleting favorite!"});

  return res.status(200).json({error: false, message: "Favorite deleted successfully!"});
}
var express = require('express');
const Listing = require("../models/ListingsModel");
const User = require("../models/UserModel");
const fileHandler = require("../helpers/deleteFiles");

exports.createListing = async (req, res) => {
  //validacija
  var tokenData = res.locals.tokenData;

  if(res.locals.multerErrors){
    console.log("multer upload errors!");
    console.log(res.locals.multerErrors);
    //delete added images

    //abort creating
    return res.status(200).json(res.locals.multerErrors);
  }

  var fileNames = [];
  if(req.files){
    req.files.forEach(image => {
      fileNames.push(image.filename);
    });

    fileNames = fileNames.toString();
  }

  var ts = new Date().toLocaleDateString('pt-br') + " " + new Date().toLocaleTimeString('pt-br');
  var newListing = new Listing(null, req.body.listingName, req.body.price, req.body.desc, req.body.brandID, req.body.modelID,
                               req.body.productionYear, req.body.mileage, req.body.engineName, req.body.engineType, req.body.engineKW,
                               req.body.registrationUntilMonth, req.body.registrationUntilYear, fileNames, tokenData.id, ts, req.body.listingType,
                               req.body.gearCount, req.body.transmissionType, req.body.vin);
  
  var listingID = await newListing.createListing();
  if(!listingID)
    return res.status(200).json({error: true, message: "Error while creating listing!"})
  

  return res.status(200).json({error: false, message: "Listing created successfully!", data: listingID});
}

exports.getListing = async (req, res) => {
  //validacija
  var listingID = req.params.id;
  var listing = await Listing.getListingByID(listingID);

  if(!listing)
    return res.status(200).json({error: true, message: "Error getting listing", data: null});

  var user = await User.getUserByID(listing.userID, false);

  listing.userInformation = user;
  if(listing.files.length === 0)
    listing.files = [];

  return res.status(200).json({error: false, message: "Ok!", data: listing});
}

exports.getListingByUserID = async (req, res) => {
  //validacija
  var listingID = req.params.id;
  var listings = {};
  listings.data = await Listing.getListingsByUserID(listingID);

  if(!listings)
    return res.status(200).json({error: true, message: "Error occured while getting listings!"});

  var user = await User.getUserByID(listings.data[0].userID, false);
  listings.userInformation = user;
  
  return res.status(200).json({error: false, message: "Ok!", data: listings});
}

exports.editListing = async (req, res) => {
    //validacija
    var tokenData = res.locals.tokenData;

    if(!await Listing.isUsersListing(tokenData.id, req.body.id))
      return res.status(200).json({error: true, message: "User doesn't own this listing!"});

    //no new files
    if(!req.files){
      //text only edit
      if(!req.body.filesToDelete){
        var newListing = new Listing(req.body.id, req.body.name, req.body.price, req.body.description, req.body.carBrandID, req.body.carModelID,
          req.body.productionYear, req.body.mileage, req.body.engineName, req.body.engineType, req.body.engineKW,
          req.body.registrationUntilMonth, req.body.registrationUntilYear, null, null, null, req.body.listingType,
          req.body.gearcount, req.body.transmissionType, req.body.vin);

        if(!await newListing.editListing())
          return res.status(200).json({error: true, message: "Failed to edit listing!"});

        return res.status(200).json({error: false, message: "Listing edited!"});
      }

      //picture only edit (delete)
      var filesToDelete = req.body.filesToDelete;
      var imagePathArray = [];
      filesToDelete.forEach((image) => {
        if(image.delete)
          imagePathArray.push("../client/public" + image.src);
      });
      
      //delete from db
      var newDBFiles = await Listing.deleteFiles(imagePathArray, req.body.id);
      if(newDBFiles === false)
        return res.status(200).json({error: true, message: "Error with deleting images!"});

      //delete from disk
      var deleteStatus = await fileHandler.deleteFiles(imagePathArray);
      
      return res.status(200).json({error: false, message: "Files deleted!", data: newDBFiles});
    }

    //handle new files
    else{
      if(res.locals.multerErrors)
        return res.status(200).json(res.locals.multerErrors);

      var files = await Listing.addFiles(req.files, req.body.id);
      if(!files)
        return res.status(200).json({error: true, message: "Error adding new files!"});

      return res.status(200).json({error: false, message:"Files added successfully", data: files});
    }

}

exports.deleteListing = async (req, res) => {
  //validacija
  var tokenData = res.locals.tokenData;

  if(!await Listing.isUsersListing(tokenData.id, req.body.listingID))
    return res.status(200).json({error: true, message: "User doesn't own this listing!"});

  var listing = await Listing.getListingByID(req.body.listingID);
  if(listing === 0)
    return res.status(200).json({error: true, message: "No listing with selected ID!"});

  if(listing === false)
    return res.status(200).json({error: true, message: "Error getting listing!"});

  //delete from db
  if(!await Listing.deleteListing(req.body.listingID))
    return res.status(200).json({error: true, message: "Error while deleting listing!"});

  //delete files from disk
  var imagePathArray = [];
  var images = listing.files;
  images = images.split(",");

  images.forEach((image) => {
    imagePathArray.push("../client/public/images/" + image);
  });
  
  var deleteStatus = await fileHandler.deleteFiles(imagePathArray);

  return res.status(200).json({error: false, message: "Listing deleted!"});
}

exports.getListingsFromAdvancedSearch = async (req, res) => {
  var searchData = req.body;
  var sqlQuery = "";

  for(var objProp in searchData){
    if(searchData[objProp].includes(",")){
      searchData[objProp] = searchData[objProp].split(",")
      continue;
    }
    
    if(objProp === "carBrandID" || objProp === "carModelID" || objProp === "countyID" || objProp === "listingType")
      searchData[objProp] = [searchData[objProp]];

  }
  
  for(var objProp in searchData){
    if(Array.isArray(searchData[objProp])){
      if(searchData[objProp].toString() !== ""){
        sqlQuery += objProp + " IN (" + searchData[objProp].toString() + ") AND ";
        continue;
      }
    }

    if(objProp.includes("From") && searchData[objProp] === "")
      searchData[objProp] = "0";
    
    if(objProp.includes("To") && searchData[objProp] === "")
      searchData[objProp] = "999999";
  }

  sqlQuery += 
    "listings.price >= " + searchData.priceFrom + " AND listings.price <= " + searchData.priceTo + " AND" +
    " listings.engineKW >= " + searchData.kwFrom + " AND listings.engineKW <= " + searchData.kwTo + " AND" +
    " listings.productionYear >= " + searchData.pYearFrom + " AND listings.productionYear <= " + searchData.pYearTo + " AND" +
    " listings.mileage >= " + searchData.mileageFrom + " AND listings.mileage <= " + searchData.mileageTo;

  if(searchData.engineType !== "")
    sqlQuery += " AND listings.engineType IN (" + searchData.engineType + ")";

  var totalQueryRows = await Listing.getCountOfAdvancedSearch(sqlQuery);
  if(totalQueryRows === 0)
    return res.status(200).json({error: false, data: []});

  if(searchData.sortBy !== undefined && searchData.sortBy !== ""){
    var sortOption = searchData.sortBy;
    if(sortOption === "desc")
      sqlQuery += " ORDER BY listings.createdAt DESC";
    else if(sortOption === "asc")
      sqlQuery += " ORDER BY listings.createdAt ASC";
    else if(sortOption === "pDesc")
      sqlQuery += " ORDER BY ABS(listings.price) DESC";
    else if(sortOption === "pAsc")
      sqlQuery += " ORDER BY ABS(listings.price) ASC";
  }

  if(searchData.page !== undefined && searchData.page !== ""){
    var itemsPerPage = 20;
    searchData.page = parseInt(searchData.page);
    var offset = (searchData.page - 1) * itemsPerPage;
    sqlQuery += " LIMIT " + offset + ", " + itemsPerPage;
  }

  var results = await Listing.advancedSearch(sqlQuery);
  if(results === null)
    return res.status(200).json({error: false, data: []});

  if(results === false)
    return res.status(200).json({error: true, data: "Error getting data"});

  results = {totalRows: totalQueryRows, results: [...results]}
  return res.status(200).json({error: false, data: results});  
}
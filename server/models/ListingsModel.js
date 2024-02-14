const db = require("../config/db");

module.exports = class Listing{
  constructor(id, name, price, description, carBrandID, carModelID, productionYear, mileage, 
  engineName, engineType, engineKW, registrationUntilMonth, registrationUntilYear, files, userID, createdAt, listingType,
  gearCount, transmissionType, vin){
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.carBrandID = carBrandID;
    this.carModelID = carModelID;
    this.productionYear = productionYear;
    this.mileage = mileage;
    this.engineName = engineName;
    this.engineType = engineType;
    this.engineKW = engineKW;
    this.registrationUntilMonth = registrationUntilMonth;
    this.registrationUntilYear = registrationUntilYear;
    this.files = files;
    this.userID = userID;
    this.createdAt = createdAt;
    this.listingType = listingType;

    this.gearCount = gearCount;
    this.transmissionType = transmissionType;
    this.vin = vin;
  }

  static getListingsByUserID = async (userID) => {
    try {
      var query = 
      "SELECT listings.id, name, price, files, createdAt, userID, mileage, productionYear " +
      "FROM listings " +
      "WHERE userID=" + userID +
      " ORDER BY createdAt DESC";
      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
          return null;
      
      return rows;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static getListingByID = async (id) => {
    try {
      var query = 
      "SELECT listings.id, listings.name, price, description, productionYear, mileage, engineName, engineKW, registrationUntilMonth, registrationUntilYear, " +
        "files, createdAt, userID, listingType, listings.carBrandID, listings.gearcount, listings.vin, carbrands.name as brandName, listings.carModelID, " +
        "carmodels.name AS modelName, transmissiontypes.name AS transmissionName, enginetypes.name AS engineTypeName, transmissionType, engineType " +
      "FROM listings " +
        "INNER JOIN carbrands ON carbrands.id = listings.carBrandID " +
        "INNER JOIN carmodels ON carmodels.id = listings.carModelID " +
        "INNER JOIN transmissiontypes ON transmissiontypes.id = listings.transmissionType " +
        "INNER JOIN enginetypes ON enginetypes.id = listings.engineType " +
      "WHERE listings.id=" + id;
      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
        return 0;
      
      return rows[0];
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static getListingsByMultipleIDs = async (listingsID) => {
    try {
      var query = 
      "SELECT listings.id, name, price, files, createdAt, userID, productionYear, mileage " +
      "FROM listings " +
      "WHERE listings.id IN (" + listingsID + ")";
      const [rows, fields] = await db.query(query);
      
      return rows;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  createListing = async () => {
    try {
      var query =
      "INSERT INTO listings (name, price, description, carBrandID, carModelID, productionYear, mileage, engineName, " +
      "engineType, engineKW, registrationUntilMonth, registrationUntilYear, files, userID, createdAt, listingType, " + 
      "gearCount, transmissionType, vin) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,   ?, ?, ?)";

      const [rows, fields] = await db.query(query, 
        [this.name, this.price, this.description, this.carBrandID, this.carModelID, this.productionYear, this.mileage, this.engineName,
         this.engineType, this.engineKW, this.registrationUntilMonth, this.registrationUntilYear, this.files, this.userID, this.createdAt, this.listingType,
         this.gearCount, this.transmissionType, this.vin]);
      if(!rows.affectedRows)
        return false;
      
      return rows.insertId;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  editListing = async () => {
    try {
      var query = "UPDATE listings SET name=?, price=?, description=?, carBrandID=?, carModelID=?, productionYear=?, mileage=?, engineName=?," +
                    "engineType=?, engineKW=?, registrationUntilMonth=?, registrationUntilYear=?, listingType=?, gearCount=?, transmissionType=?, vin=?" +
                  " WHERE id=?";

      const [rows, fields] = await db.query(query,
        [this.name, this.price, this.description, this.carBrandID, this.carModelID, this.productionYear, this.mileage, this.engineName,
         this.engineType, this.engineKW, this.registrationUntilMonth, this.registrationUntilYear, this.listingType, this.gearCount,
         this.transmissionType, this.vin, this.id]);

      if(!rows.affectedRows)
        return false;
      
      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }    
  }

  static isUsersListing = async (userID, listingID) => {
    try {
      var query = 
      "SELECT * FROM listings WHERE userID=" + userID + " AND id=" + listingID;
      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
          return false;
      
      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static deleteFiles = async (imagesToDelete, listingID) => {
    var imagesToDeleteCopy = [...imagesToDelete];
    try {
      var query = 
      "SELECT files FROM listings WHERE id=" + listingID;
      const [rows, fields] = await db.query(query);

      var currentFiles = rows[0].files;
      currentFiles = currentFiles.length < 1 ? [] : currentFiles.split(",");
    } 
    catch (error) {
      console.log(error);
      return false;
    }

    var splitted;
    imagesToDeleteCopy.forEach((image, index) => {
      splitted = image.split("/");
      imagesToDeleteCopy[index] = splitted[splitted.length - 1];
    });

    var newFiles = [];
    var flag = false;

    for(var i = 0; i < currentFiles.length; i++){
      flag = false;
      for(var j = 0; j < imagesToDeleteCopy.length; j++){
        if(currentFiles[i] == imagesToDeleteCopy[j]){
          flag = true;
          break;
        }
      }

      if(!flag)
        newFiles.push(currentFiles[i]);
    }

    var newFilesString = newFiles.toString();
    try {
      var query = "UPDATE listings SET files=? WHERE id=?";
      const [rows, fields] = await db.query(query, [newFilesString, listingID]);
      if(rows.affectedRows === 0)
        return false;
      

      return newFilesString;
    } 
    catch (error) {
      console.log(error);
      return false;
    }
  }

  static addFiles = async (fileArray, listingID) => {
    var imageString;
    try {
      var query = "SELECT files FROM listings WHERE id=?";
      const [rows, fields] = await db.query(query, [listingID]);
      if(!rows.length === 0)
        return false;

      imageString = rows[0].files;
    }
    catch (error) {
      console.error(error);
      return false;
    }

    var imageArray = imageString.length < 1 ? [] : imageString.split(",");
    fileArray.forEach((image) => {
      imageArray.push(image.filename);
    });

    imageString = imageArray.toString();

    try {
      var query = "UPDATE listings SET files=? WHERE id=?";
      const [rows, fields] = await db.query(query, [imageString, listingID]);

      if(rows.affectedRows === 0)
        return false;

      return imageString;
    }
    catch (error) {
      console.error(error);
      return false;
    }

  }

  static deleteListing = async (listingID) => {
    try {
      var query = "DELETE FROM listings WHERE id=?";
      const [rows, fields] = await db.query(query, [listingID]);
      if(rows.affectedRows === 0)
        return false;

      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }

  }

  static getCountOfAdvancedSearch = async (sqlString) => {
    try {
      var query = 
        "SELECT COUNT(*) as lCount " +
        "FROM listings " +
        "INNER JOIN users ON listings.userID = users.id " +
        "WHERE " + sqlString;
      const [rows, fields] = await db.query(query);

      return rows[0].lCount;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static advancedSearch = async (sqlString) => {
    try {
      var query = 
        "SELECT listings.id, listings.name, price, description, mileage, productionYear, files, createdAt, userID, users.address, users.username, users.countyID, county.name AS countyName " +
        "FROM listings " +
          "INNER JOIN users ON listings.userID = users.id " +
          "INNER JOIN county ON users.countyID = county.id " +
        "WHERE " + sqlString;

      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
        return null;
      
      return rows;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  

  }
}


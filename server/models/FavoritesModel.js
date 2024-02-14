const db = require("../config/db");

module.exports = class Favorites{
  constructor(id, userID, listingID){
    this.id = id;
    this.userID = userID;
    this.listingID = listingID;
  }

  static getFavoritesByUserID = async (userID) => {
    try {
      var query = "SELECT listingID FROM favorites WHERE userID=?";
      const [rows, fields] = await db.query(query, [userID]);
      
      if(rows[0] === undefined)
        return null;

      return rows;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static userHaveListingFavorited = async (userID, listingID) => {
    try {
      var query = "SELECT * FROM favorites WHERE listingID=? AND userID=?";
      const [rows, fields] = await db.query(query, [listingID, userID]);
      
      if(rows[0] === undefined)
        return false;

      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  createFavorite = async () => {
    try {
      var query = "INSERT INTO favorites (userID, listingID) VALUES (?, ?)";
      const [rows, fields] = await db.query(query, [this.userID, this.listingID]);
      if(!rows.affectedRows)
        return false;
      
      this.id = rows.insertId;
      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static deleteFavorite = async (userID, listingID) => {
    try {
      var query = "DELETE FROM favorites WHERE userID=? AND listingID=?";
      const [rows, fields] = await db.query(query, [userID, listingID]);
      if(!rows.affectedRows)
        return false;
      
      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

}
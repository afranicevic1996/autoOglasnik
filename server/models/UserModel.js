const db = require("../config/db");

module.exports = class User{
  constructor(id, username, email, password, role, phoneNumber, countyID, address){
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.countyID = countyID;
    this.address = address;
  }

  static exists = async (id) => {
    try {
      var query = 
      "SELECT id FROM users WHERE id=" + id;
      const [rows, fields] = await db.query(query);

      if(rows.length)
          return true;
      
      return false;
    }
    catch (error) {
      console.error(error);
      return error;
    }
  }

  static existsByUsernameOrEmail = async (username, email) => {
    try {
      var query = 
      "SELECT * FROM users WHERE username='" + username + "' OR email='" + email + "'";
      const [rows, fields] = await db.query(query);

      if(rows.length)
          return true;
      
      return false;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  static getUserByID = async (id, returnObj = true) => {
    try {
      var query = 
      "SELECT users.id, username, email, phoneNumber, users.countyID, county.name AS countyName, users.address " +
      "FROM users " +
        "INNER JOIN county ON county.id = users.countyID " +
      "WHERE users.id=" + id;
      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
        return false;

      var data = rows[0];

      if(returnObj)
        return new User(data.id, data.username, data.email, "", "", data.phoneNumber, data.countyID, data.address);

      return data;

    } catch (error) {
      console.error(error);
      return false;
    }

  }

  static getUserByUsername = async (username) => {
    try {
      var query = 
      "SELECT * FROM users WHERE username='" + username + "'";
      const [rows, fields] = await db.query(query);

      if(!rows.length)
        return false;

      var data = rows[0];
      return new User(data.id, data.username, data.email, data.password, data.role, data.phoneNumber, data.address);
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  registerUser = async () => {
    try {
      var query =
      'INSERT INTO users (username, email, password, role, phoneNumber, countyID, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const [rows, fields] = await db.query(query, [this.username, this.email, this.password, this.role, this.phoneNumber, this.countyID, this.address]);
      if(!rows.affectedRows)
        return false;

      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  editProfile = async (data) => {
    try {
      var query = "UPDATE users SET phoneNumber=?, countyID=?, address=? WHERE id=?";
      const [rows, fields] = await db.query(query, [data.phoneNumber, data.countyID, data.address, this.id]);

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
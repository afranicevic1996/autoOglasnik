const db = require("../config/db");

module.exports = class County{
  constructor(id, name){
    this.id = id;
    this.name = name;
  }

  static getCounties = async (req, res) => {
    try {
      var query = 
      "SELECT * FROM county";
      const [rows, fields] = await db.query(query);

      if(rows.length === 0)
          return false;
      
      return rows;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

}
const db = require("../config/db");

module.exports = class CarModelsModel{
  constructor(id, name){
    this.id = id;
    this.name = name;
    this.cardBrandID = cardBrandID
  }

  static getCarModels = async (req, res) => {
    try {
      var query = 
      "SELECT carmodels.id, carmodels.name, carmodels.carBrandID, carbrands.name AS parentName " +
      "FROM carmodels " +
      "INNER JOIN carbrands ON carmodels.carBrandID = carbrands.id";
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
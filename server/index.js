// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const multer = require("multer");
const dotenv = require('dotenv').config();

//multer storage options
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/images")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //srediti extenziju po mimetype
    var mime = file.mimetype.split("/");
    var ext = "safeExt";
    if(mime[0] == "image"){
      ext = mime[1];
    }
    else if(mime[0] == "text"){
      if(mime[1] == "plain"){
        ext = "txt";
      }
    }

    cb(null, file.originalname + "-" + uniqueSuffix + "." + ext)
  }
});

const uploadCarFiles = multer({storage: storage}).array("carFiles[]");

//controllers
var userController = require("./controllers/userController");
var authController = require("./controllers/auth");
var countyController = require("./controllers/countyController");

var carBrandController = require("./controllers/carBrandController");
var carModelController = require("./controllers/carModelController");
var listingController = require("./controllers/listingController");
var favoritesController = require("./controllers/favoritesController");

//middlewares
const { validateAuth } = require("./middlewares/validateAuth")
//routes
var adminRouter = require('./routes/admin.route');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.json()); //allowing json data to be received from client

// here we are setting up cors so that we can make requests from cross-origin resources
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FE_LOCATION],
    credentials: true,
    allowedHeaders: [
      "set-cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
); 

app.get("/", (req, res) => {
  res.json({ Message: "Server is up and running aaaaaaaaaaaaaaaa" });
});
app.get("/getUserByID", validateAuth, userController.getUserByID);
app.get("/getCounties", countyController.getAllCounties);

app.get("/getCarBrands", carBrandController.getAllCarBrands);
app.get("/getCarModels", carModelController.getAllCarModels);

//multer upload
app.post("/createListing", (req, res, next) => {
  uploadCarFiles(req, res, (err) => {
    if(err){
      console.log(err);
      res.locals.multerErrors = {error: true, status: "Upload Error"};
    }

    next();
  });
}, validateAuth, listingController.createListing);
app.post("/getListingsFromAdvancedSearch", listingController.getListingsFromAdvancedSearch);
app.get("/getListing/:id", listingController.getListing);
app.get("/getListingByUserID/:id", listingController.getListingByUserID);
app.post("/deleteListing", validateAuth, listingController.deleteListing);
app.post("/editListing", (req, res, next) => {
  uploadCarFiles(req, res, (err) => {
    if(err){
      console.log(err);
      res.locals.multerErrors = {error: true, status: "Upload Error"};
    }

    next();
  });
}, validateAuth, listingController.editListing);

app.post("/getUsersFavStatus", validateAuth, favoritesController.getUsersFavStatus);
app.post("/getFavoritesByUserID", validateAuth, favoritesController.getFavoritesByUserID);
app.post("/addFavorites", validateAuth, favoritesController.addFavorites);
app.post("/deleteFavorites", validateAuth, favoritesController.deleteFavorites);

app.post("/register", userController.registerUser);
app.post("/login", userController.login);
app.post("/editProfile", validateAuth, userController.editProfile);


app.post("/auth/isLoggedIn", authController.isLoggedIn);
app.post("/auth/logout", authController.logout);

app.use("/admin", adminRouter);

app.listen(8213, () => console.log("Backend Running on Port 8213"));
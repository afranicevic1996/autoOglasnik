import { useState, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { UserContext } from "../App";
import ImagePreviewer from "./ImagePreviewer";
import "../css/ListingShow.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLocationDot, faEnvelope, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

const apiAddress = process.env.REACT_APP_API_ADDRESS;

const ListingShow = () => {
  const { userDataContext } = useContext(UserContext);
  const [userData, setUserData] = userDataContext;

  const [listing, setListing] = useState();
  const [listingFavorited, setListingFavorited] = useState();

  var { id } = useParams();

  const getListing = async () => {
    try{
      const response = await axios({
        method: "GET",
        withCredentials: true,
        url: apiAddress + "/getListing/" + id
      });

      var listing = response.data.data;
      var images = listing.files.length < 1 ? [] : listing.files.split(",");

      var previewerData = [];
      var fullPath;

      for(var i = 0; i < images.length; i++){
        fullPath = "/images/" + images[i];
        previewerData.push({id: i, current: i === 0 ? true : false, src: fullPath});
      };

      listing.files = previewerData;
      listing.price = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(listing.price);
      listing.mileage = new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 3 }).format(listing.mileage);
      var str = listing.userInformation.phoneNumber;
      listing.userInformation.phoneNumber = str.substr(0,3) + "-" + str.substr(3,3) + "-" + str.substr(6);
      setListing(listing);
    }
    catch (error){
      console.log(error);
    }
  }

  const getUsersFavStatus = async () => {
    if(!userData.isLoggedIn)
      return false;

    var data = {listingID: id};
      try{
        const response = await axios({
          method: "POST",
          data: data,
          withCredentials: true,
          url: apiAddress + "/getUsersFavStatus"
        });
        
        if(response.data.favoriteStatus){
          setListingFavorited(true);
          return true;
        }

        setListingFavorited(false);
        return true;
      }
      catch (error){
        console.log(error);
      }
  }

  useEffect(() => {
    getListing();
  }, []);

  useEffect(() => {
    getUsersFavStatus();
  }, [userData.isLoggedIn]);

  const deleteFav = async () => {
    console.log("delete");
    var data = {listingID: id};
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        url: apiAddress + "/deleteFavorites"
      });
      
      if(!response.data.error)
        setListingFavorited(false);

    }
    catch (error){
      console.log(error);
    }
  }

  const addFav = async () => {
    console.log("add");
    var data = {listingID: id};
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        url: apiAddress + "/addFavorites"
      });
      
      console.log(response.data)
      if(!response.data.error)
        setListingFavorited(true);

    }
    catch (error){
      console.log(error);
    }
  }

  return(
    <>
      {listing &&
        <ImagePreviewer data={listing.files} />
      }

      {listing &&
        <div className="basic-info">

          <div className="basic-info-left">
            <span className="basic-info-name">{listing.name}</span>
            <span className="basic-info-price">{listing.price}</span>
          </div>
          
          <div className="basic-info-right">
            {listing.createdAt}
            <span className="basic-info-views">2341 views</span>
            <span className="report">Report listing/user</span>
          </div>

        </div>
      }

      {listing &&
        <div className="data-container">

          <div className="listing-info-container">
            <div className="listing-info-header">
              Vehicle information
            </div>

            <div className="listing-info-body">
              <div className="listing-section">



              <div className="listing-part">
                <div className="left-part">
                  Vehicle state
                </div>
                <div className="right-part">
                  Used
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Brand
                </div>
                <div className="right-part">
                  {listing.brandName}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Model
                </div>
                <div className="right-part">
                  {listing.modelName}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Production year
                </div>
                <div className="right-part">
                  {listing.productionYear}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  VIN
                </div>
                <div className="right-part">
                  {listing.vin === "" ? "-" : listing.vin}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Mileage
                </div>
                <div className="right-part">
                  {listing.mileage} km
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Transmission type
                </div>
                <div className="right-part">
                  {listing.transmissionName}
                </div>
              </div>
              
              <div className="listing-part">
                <div className="left-part">
                  # gears
                </div>
                <div className="right-part">
                  {listing.gearcount}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Power
                </div>
                <div className="right-part">
                  {listing.engineKW} kW
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Displacement
                </div>
                <div className="right-part">
                  {listing.engineName}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Engine type
                </div>
                <div className="right-part">
                  {listing.engineTypeName}
                </div>
              </div>

              <div className="listing-part">
                <div className="left-part">
                  Registered until
                </div>
                <div className="right-part">
                  {listing.registrationUntilMonth} / {listing.registrationUntilYear}
                </div>
              </div>




              </div>
            </div>

            <div className="listing-description">
              <span className="desc-title">Description: </span>
              <span className="desc-text">
                {listing.description}
              </span>
            </div>
          </div>

          <div className="right-section">

            <div className="user-info-container">
              <div className="listing-info-header">
                Seller information
              </div>

              <div className="listing-info-body">
                <div className="user-image">
                  <img src="https://winaero.com/blog/wp-content/uploads/2018/08/Windows-10-user-icon-big.png" /><br />
                  <span className="user-name">{listing.userInformation.username}</span>
                </div>
                
                <div className="user-info">

                  <div className="info-section">
                    <FontAwesomeIcon icon={faLocationDot} className="gas-color" />&nbsp;&nbsp;
                    {listing.userInformation.address &&
                      listing.userInformation.address + ", "
                    }
                    {listing.userInformation.countyName}
                  </div>
                  <div className="info-section">
                    <FontAwesomeIcon icon={faPhone} className="gas-color" />&nbsp;{listing.userInformation.phoneNumber}
                  </div>
                  <div className="info-section">
                    <FontAwesomeIcon icon={faEnvelope} className="gas-color" />&nbsp;{listing.userInformation.email}
                  </div>

                </div>

              </div>
            </div>

            <div className="listing-actions">
              <button title="Add to favorites"><FontAwesomeIcon icon={faHeart} size="lg" /></button>
              <button title="Share on Instagram"><FontAwesomeIcon icon={faInstagram} size="lg" /></button>
              <button title="Share on Facebook"><FontAwesomeIcon icon={faFacebook} size="lg" /></button>
            </div>

          </div>

        </div>


      }
    </>
  )
}

export default ListingShow
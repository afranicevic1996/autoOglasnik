import CustomForm from "./CustomForm";
import StatusBox from "./StatusBox";
import CustomModal from "./CustomModal";
import ListingContainer from "./ListingsContainer";
import * as Yup from "yup";
import { Link } from "react-router-dom";

import { UserContext } from "../App";
import { StatusContext } from "./contexts/StatusContext";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useContext, useEffect, useCallback, useState, useMemo } from "react";
import axios from "axios";
import { isLoggedIn } from "./helpers/authChecker";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLocationDot, faEnvelope, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

import "../css/MyProfile.css";

const apiAddress = process.env.REACT_APP_API_ADDRESS;

const MyProfile = () => {
  const navigate = useNavigate();
  const { userDataContext } = useContext(UserContext);
  const [userData, setUserData] = userDataContext;

  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  const [counties, setCounties] = useState();
  const [listings, setListings] = useState();
  const [favorites, setFavorites] = useState();
  const [initialValues, setInitialValues] = useState();

  console.log(listings)
  //modal context
  const [modal, setModal] = useState({show: false, targetFormID: ""});
  const NUMBER_REGEX = "^[-+\/\s]*([0-9][-+\/\s]*){9,}$";

  const handleSubmit = async (data) => {
    handleModalClose();

    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        url: apiAddress + "/editProfile"
      });
      
      console.log(response.data);
      setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }catch (error){
      console.error(error);
    }
  }

  const checkLogin = async () => {
    if(userData.isLoggedIn)
      return false;

    var user = await isLoggedIn();
    if(user.isLoggedIn && userData.isLoggedIn === false)
      setUserData({isLoggedIn: true, username: user.userData.username, id: user.userData.id});

    if(!user.isLoggedIn){
      setUserData({isLoggedIn: false, username: "", id: null});
      navigate("/");
    }
  };

  const getUserFavorites = async () => {
    if(!userData.isLoggedIn)
      return false;

    try{
      const response = await axios({
        method: "POST",
        data: {},
        withCredentials: true,
        url: apiAddress + "/getFavoritesByUserID"
      });
      
      setFavorites(response.data.data);
    }catch (error){
      console.error(error);
    }
  }

  const getUserListings = async () => {
    if(!userData.isLoggedIn)
      return false;
    
    try{
      const response = await axios({
        method: "GET",
        withCredentials: true,
        url: apiAddress + "/getListingByUserID/" + userData.id
      });

      setListings(response.data.data);
    }catch (error){
      console.error(error);
    }
  }

  const getCounties = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        url: apiAddress + "/getCounties"
      });
      
      setCounties(response.data.data);
    }catch (error){
      console.error(error);
    }
  }

  const createInitialValues = async (user) => {
    var initialValues = {};
    for(const property in user){
      if(property !== "password" && property !== "role")
        initialValues[property] = user[property];
    }

    setInitialValues(initialValues);
  }

  const getUserData = async () => {
    if(!userData.isLoggedIn)
      return false;

    try{
      const response = await axios({
        method: "GET",
        withCredentials: true,
        url: apiAddress + "/getUserByID"
      });
      
      createInitialValues(response.data.data);
    }catch (error){
      console.error(error);
    }
  } 

  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string().matches(NUMBER_REGEX, "Enter valid phone number"),
    address: Yup.string().trim().min(2, "Address must contain at least 2 characters").max(30, "Address can contain at most 30 characters").required("Address is required"),
    countyID: Yup.number().min(1, "Choose valid county").required()
  });

  useEffect(() => {
    getCounties();
    checkLogin();
  }, []);

  useEffect(() => {
    getUserListings();
    getUserFavorites();
    getUserData();
  }, [userData.isLoggedIn])

  const handleModalOpen = (event, text, isForm, func) => {
    if(isForm)
      setModal({show: true, text: text, isForm: isForm, target: event.target});
    else
      setModal({show: true, text: text, isForm: isForm, target: event.target, onConfirm: func});
  }

  const handleModalClose = () => {
    setModal({show: false});
  }

  const handleDelete = async (deleteID) => {
    handleModalClose();
    var listingID = deleteID;
    listingID = listingID.split("-");
    if(isNaN(listingID[1])){
      console.log("nan");
      return false;
    }

    var data = {listingID: listingID[1]};
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        url: apiAddress + "/deleteListing"
      });
      
      console.log(response.data)
      if(response.data.error){
        setStatusMessage({show: true, error: true, message: response.data.message});
        return false;
      }
      
      //if ok
      var newListings = {};
      var newListingsData = [];
      listings.data.forEach((listing) => {
        if(listing.id !== Number(listingID[1]))
          newListingsData.push(listing);
      });

      newListings.data = newListingsData;
      newListings.userInformation = listings.userInformation;

      setListings(newListings);
      setStatusMessage({show: true, error: false, message: response.data.message});
    }catch (error){
      console.error(error);
    }
    
  }

  return(
    <>
      <CustomModal modalData={modal} onModalClose={handleModalClose} />
      <StatusBox />

      {counties && initialValues &&
        <div className="edit-profile">

          <div className="listing-info-header">
            Edit profile
          </div>

          <div className="listing-info-body">
            <div className="user-image">
              <img src="https://winaero.com/blog/wp-content/uploads/2018/08/Windows-10-user-icon-big.png" /><br />

              <span className="user-name">noviuser</span>
            </div>

            <div className="user-info">
              <div className="info-section-form">
                <FontAwesomeIcon icon={faEnvelope} className="gas-color" />&nbsp;
                {initialValues.email} &nbsp;
                <span className="report" title="Change your email"><FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" /></span>
              </div>

              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} >
                <Form id="editProfile">
                  <div className="info-section-form">
                    <FontAwesomeIcon icon={faPhone} className="gas-color" />&nbsp;

                    <div className="form-field-with-error">
                      <Field type="text" name="phoneNumber" placeholder="Phone number" />
                      <ErrorMessage name="phoneNumber" className="error" component="div" />
                    </div>
                  </div>

                  <div className="info-section-form">
                    <FontAwesomeIcon icon={faLocationDot} className="gas-color" />&nbsp;&nbsp;

                    <div className="form-field-with-error">
                      <Field type="text" name="address" placeholder="Address" /><br />
                      <ErrorMessage name="address" className="error" component="div" />
                    </div>

                    <div className="form-field-with-error">
                      <Field as="select" name="countyID">
                        <option value="0">Select county</option>
                        {counties.map((county, key) => {
                          return(
                            <option key={key} value={county.id}>{county.name}</option>
                          )
                        })}
                      </Field><br />
                      <ErrorMessage name="countyID" className="error" component="div" />
                    </div>

                  </div>
                </Form>
              </Formik>
              
            </div>
          </div>

          <div className="listing-info-footer">
            <button type="button" id="editProfile" onClick={(e) => handleModalOpen(e, "Want to edit profile ?", true)} >Edit</button>
          </div>

        </div>
      }

      <div className="data-parent">
        <div className="listing-child">
          {listings !== undefined
          ?
            <ListingContainer listings={listings.data} userInfo={listings.userInformation} handleModalOpen={handleModalOpen} withEdit={{status: true, onEdit: null}} withDelete={{status: true, onDelete: handleDelete}} headerText="My Listings" />
          :
            <span>No user listings!</span>
          }
        </div>


        <div className="favorite-child">
          {favorites !== undefined
          ?
            <ListingContainer listings={favorites.data} userInfo={favorites.userInformation} withEdit={{status: false, onEdit: null}} withDelete={{status: false, onDelete: null}} headerText="My Favorites" />
          :
            <span>No user favorites!</span>
          }
        </div>
      </div>


    </>
  )
}

export default MyProfile
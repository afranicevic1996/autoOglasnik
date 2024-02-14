import CustomModal from "./CustomModal";
import CustomForm from "./CustomForm";
import StatusBox from "./StatusBox";
import * as Yup from "yup";

import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { StatusContext } from "./contexts/StatusContext";

import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { isLoggedIn } from "./helpers/authChecker";
import "../css/Register.css";
const apiAddress = process.env.REACT_APP_API_ADDRESS;

const Register = () => {
  const navigate = useNavigate();
  const NUMBER_REGEX = "^[-+\/\s]*([0-9][-+\/\s]*){9,}$";
  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  const [counties, setCounties] = useState();

  //modal context
  const [modal, setModal] = useState({show: false});

  const checkLogin = async () => {
    var user = await isLoggedIn();
    if(user.isLoggedIn){
      navigate("/");
    }
  }

  const getCounties = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        headers: {"content-type": "application/json"},
        url: apiAddress + "/getCounties"
      });
      
      setCounties(response.data.data);
    }catch (error){
      console.error(error);
    }
  }

  useEffect(() => {
    checkLogin();
    getCounties();
  }, []);

  const handleSubmit = async (data) => {    
    handleModalClose();
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        headers: {"content-type": "application/json"},
        url: apiAddress + "/register",
      });

    setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }
    catch (error){
      console.error(error);
    }
  }

  const initialValues = {
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    countyID: ""
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().trim().min(3, "Username must contain at least 3 characters").max(15, "Username can contain at most 15 characters").required("Username is required"),
    email: Yup.string().trim().email().required("E-mail is required"),
    password: Yup.string().trim().min(5, "Password must contain at least 5 characters").max(15, "Password can contain at most 15 characters").required("Password is required"),
    phoneNumber: Yup.string().matches(NUMBER_REGEX, "Enter valid phone number"),
    address: Yup.string().trim().min(2, "Address must contain at least 2 characters").max(20, "Address can contain at most 20 characters").required("Address is required"),
    countyID: Yup.string().trim().min(1, "min 1")
  });

  const handleModalOpen = (event, text, isForm, func) => {
    if(isForm)
      setModal({show: true, text: text, isForm: isForm, target: event.target});
    else
      setModal({show: true, text: text, isForm: isForm, target: event.target, onConfirm: func});
  }

  const handleModalClose = () => {
    setModal({show: false});
  }

  return(
    <>
      <CustomModal modalData={modal} onModalClose={handleModalClose} />
      <StatusBox />
      {counties &&
        <div className="login-box">
          <div className="login-header">
            <div>Register</div>
          </div>

          <div className="login-body">
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
              <Form id="register">
                <div className="login-input">
                  <label>Username: </label><br />
                  <Field type="text" name="username" placeholder="Username" />
                  <ErrorMessage name="username" className="error" component="div" />
                </div>
                  
                <div className="login-input">
                  <label>Email: </label><br />
                  <Field type="text" name="email" placeholder="Email" />
                  <ErrorMessage name="email" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Password: </label><br />
                  <Field type="password" name="password" placeholder="Password" />
                  <ErrorMessage name="password" className="error" component="div" />
                </div>
                
                <div className="login-input">
                  <label>Phone number: </label><br />
                  <Field type="text" name="phoneNumber" placeholder="Phone number" />
                  <ErrorMessage name="phoneNumber" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Address or town: </label><br />
                  <Field type="text" name="address" placeholder="Address or town" />
                  <ErrorMessage name="address" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Select county: </label><br />
                  <Field as="select" name="countyID">
                    <option value="0">Select county</option>
                    {counties.map((county, key) => {
                      return(
                        <option key={key} value={county.id}>{county.name}</option>
                      )
                    })}
                  </Field>
                  <ErrorMessage name="countyID" className="error" component="div" />
                </div>
              </Form>
            </Formik>
          </div>

          <div className="login-footer">
            <button type="button" id="register" onClick={(e) => {handleModalOpen(e, "Do you really want to register ?", true)}}>Register</button>
          </div>

        </div>
      }
    </>
  );
}

export default Register;
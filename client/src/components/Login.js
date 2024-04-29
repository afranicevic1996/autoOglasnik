import { Formik, Form, Field, ErrorMessage } from "formik";
import StatusBox from "./StatusBox";
import * as Yup from "yup";

import { UserContext } from "../App";
import { StatusContext } from "./contexts/StatusContext";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, createContext } from "react";
import { isLoggedIn } from "./helpers/authChecker";

import "../css/Login.css";
//adresa iz env
const apiAddress = process.env.REACT_APP_API_ADDRESS;

const Login = () => {
  const navigate = useNavigate();
  const { userDataContext } = useContext(UserContext);
  const [userData, setUserData] = userDataContext;  

  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  const abortIfLoggedIn = async () => {
    var user = await isLoggedIn();
    if(user.isLoggedIn){
      navigate("/");
    }
  }

  const handleSubmit = async (data) => {
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        headers: {"content-type": "application/json"},
        url: apiAddress + "/login"
      });

      if(!response.data.error){
        setStatusMessage({show: true, error: false, message: response.data.message});
        navigate("/myProfile");
      }else{
        setStatusMessage({show: true, error: true, message: response.data.message});
      }

    }
    catch (error){
      console.error(error);
    }
  }

  const inputFields = [
    {
      type: "text",
      name: "username",
      labelInfo: "Username: "
    },
    {
      type: "password",
      name: "password",
      labelInfo: "Password: "
    }
  ];

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().trim().min(3, "Username must contain at least 3 characters").max(15, "Username can contain at most 15 characters").required("Username is required"),
    password: Yup.string().trim().min(5, "Password must contain at least 5 characters").max(15, "Password can contain at most 15 characters").required("Password is required"),
  });

  useEffect(() => {
    abortIfLoggedIn();
  }, []);

  return(
    <>
      <StatusBox />
      <div className="login-box">
        <div className="login-header">
          <div>Login</div>
        </div>

        <div className="login-body">
          <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
            <Form id="login">
              <div className="login-input">
                <label>Username: </label><br />
                <Field type="text" name="username" placeholder="Username" />
                <ErrorMessage name="username" className="error" component="div" />
              </div>
              
              <div className="login-input">
                <label>Password: </label><br />
                <Field type="password" name="password" placeholder="Password" />
                <ErrorMessage name="password" className="error" component="div" />
              </div>
            </Form>
          </Formik>
        </div>

        <div className="login-footer">
          <button type="submit" form="login">Login</button>
        </div>
      </div>
    </>
  );
}

export default Login;
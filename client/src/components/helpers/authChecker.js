import axios from "axios";
const apiAddress = process.env.REACT_APP_API_ADDRESS;

const isLoggedIn = async () => {
  try{
    const response = await axios({
      method: "POST",
      data: {},
      withCredentials: true,
      headers: {"content-type": "application/json"},
      url: apiAddress + "/auth/isLoggedIn",
    });

    return response.data;
  }
  catch (error) {
    console.log(error);
    return false;
  }
}

const logoutUser = async () => {
  const response = await axios({
    method: "POST",
    data: {},
    withCredentials: true,
    headers: {"content-type": "application/json"},
    url: apiAddress + "/auth/logout",
  });

  return response.data;  
}

export { isLoggedIn, logoutUser }
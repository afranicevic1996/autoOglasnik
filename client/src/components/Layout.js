import { Outlet, Link } from "react-router-dom";
import { UserContext } from "../App";
import { useContext, useEffect } from "react";
import { isLoggedIn, logoutUser } from "./helpers/authChecker";
import { useNavigate } from "react-router-dom";
import "../css/Navigation.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUserGear, faFileCirclePlus, faArrowRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

function Layout(){
  const navigate = useNavigate();
  const { userDataContext } = useContext(UserContext);
  const [userData, setUserData] = userDataContext;

  useEffect(() => {
    const checkLogin = async () => {
      var user = await isLoggedIn();
      if(!user.isLoggedIn)
        setUserData({isLoggedIn: false, username: "", id: null});

      if(user.isLoggedIn && userData.isLoggedIn === false)
        setUserData({isLoggedIn: true, username: user.userData.username, id: user.userData.id});
    }

    checkLogin();
  }, []);

  const logout = async () => {
    var response = await logoutUser();

    if(!response.error){
      setUserData({isLoggedIn: false, username: "", id: null});
      navigate("/");
    }

  }

  return(
    <>
    <div style={{minHeight:"100vh", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>

      <div>
        <div className="nav-box">
          <div className="nav-box-left" title="Homepage" onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faHouse} size="lg" />
          </div>

          <div className="nav-box-center">
            {userData.isLoggedIn === true 
            ?
              <>
                <div className="center-icon" title="My Profile" onClick={() => navigate("/myProfile")}>
                  My Profile <FontAwesomeIcon icon={faUserGear} size="lg" />
                </div>

                <div className="center-icon" title="Create listing" onClick={() => navigate("/createListing")}>
                  Create listing <FontAwesomeIcon icon={faFileCirclePlus} size="lg" />
                </div>
              </>
            :
              <>
                <div className="center-icon" title="Login" onClick={() => navigate("/login")}>
                  Login <FontAwesomeIcon icon={faArrowRightToBracket} size="lg" />
                </div>

                <div className="center-icon" title="Register" onClick={() => navigate("/register")}>
                  Register <FontAwesomeIcon icon={faUserPlus} size="lg" />
                </div>
              </>
            }
          </div>

        {userData.isLoggedIn &&
          <div className="nav-box-right" onClick={logout}>
            Logout
          </div>
        }
        </div>

        <div style={{marginTop: "10vh"}}>
          <Outlet />
        </div>
        
      </div>



      <footer>
          <p>Footer</p>
      </footer>


    </div>
    </>
  );
}

export default Layout
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import MyProfile from "./components/MyProfile";
import CreateListing from "./components/CreateListing";
import ListingShow from "./components/ListingShow";
import EditListing from "./components/EditListing";
import StatusContextLayout from "./components/contexts/StatusContext";
import ChooseContextLayout from "./components/contexts/ChooseContext";
import { useState, createContext } from "react";
import "./App.css";

export const UserContext = createContext();

//strict mode u index.js radi double render
const App = () => {
  const [userData, setUserData] = useState({isLoggedIn: false, username: "", id: null});

  return (
    <>
    <UserContext.Provider value={{ userDataContext: [userData, setUserData] }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<ChooseContextLayout />}>
              <Route index element={<Home />} />
            </Route>

            <Route element={<StatusContextLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/myProfile" element={<MyProfile />}/>
              <Route path="/createListing" element={<CreateListing />}/>
              <Route path="/listing/:id" element={<ListingShow />}/>
              <Route path="/editListing/:id" element={<EditListing />}/>
            </Route>

            
            
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
    </>
  );
}

export default App;

import { Outlet } from "react-router-dom";
import { useState, createContext } from "react";

export const StatusContext = createContext();

const StatusContextLayout = () => {
  const [statusMessage, setStatusMessage] = useState({show: false, error: false, message: ""});

  return (
    <StatusContext.Provider value={{ statusMessageContext: [statusMessage, setStatusMessage] }}>
      <Outlet />
    </StatusContext.Provider>
  );
}

export default StatusContextLayout;
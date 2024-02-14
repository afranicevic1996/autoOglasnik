import { Outlet } from "react-router-dom";
import { useState, createContext } from "react";

export const ChooseContext = createContext();

const ChooseContextLayout = () => {
  const [dialog, setDialog] = useState({show: false, type: ""});

  return (
    <ChooseContext.Provider value={{ ChooseDialogContext: [dialog, setDialog] }}>
      <Outlet />
    </ChooseContext.Provider>
  )
}

export default ChooseContextLayout
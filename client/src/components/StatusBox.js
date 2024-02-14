import { useContext } from "react";
import { StatusContext } from "./contexts/StatusContext";
import "../css/StatusBox.css";

const StatusBox = () => {

  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  const closeBox = () => {
    setTimeout(() => {
      setStatusMessage({show: false, error: false, message: ""});
    }, 3000);
  }

  return(
    <>
      {statusMessage.show &&
      <>
        {statusMessage.error === false
        ?
          <div className="status-box greenTxt">{statusMessage.message}</div>
        :
          <div className="status-box redTxt">{statusMessage.message}</div>
        }
        {closeBox()}
      </>
      }
    </>
      
      
    
    
  )
}

export default StatusBox;
import "../css/Modal.css";

const CustomModal = (props) => {
  var modal = props.modalData;

  return(
    <>
      {modal.show &&

        <div className="modal-box">

          <div className="modal-content">

            <div className="modal-header">
              Confirmation needed
            </div>
            <div className="modal-body">
              {modal.text}
            </div>
            <div className="modal-footer">
              {modal.isForm === true
              ?
                <button type="submit" className="button-yes" form={modal.target.id}>Yes</button>
              :
                <>
                  {modal.functionData === undefined ?
                    <button type="button" className="button-yes" onClick={(e) => {modal.onConfirm(modal.target.id)}}>Yes</button>
                  :
                    <button type="button" className="button-yes" onClick={(e) => {modal.onConfirm(modal.target.id, modal.functionData)}}>Yes</button>
                  }
                </>
              }
              &nbsp;&nbsp;&nbsp;<button type="button" className="button-no" onClick={props.onModalClose}>No</button>
            </div>

          </div>

        </div>

        }
    </>
  )
}

export default CustomModal;
import React , {useContext} from "react";
import { ModalContext } from "../../services/hooks/modal/modalContext";

const AlertModal = ({children, title, type, onDismiss, onSuccess}) => {
  const { handleModal } = useContext(ModalContext);
  const handleDismiss = () => {
    onDismiss();
    return handleModal();
  }

  const handleSuccess = () => {
    onSuccess();
    return handleModal();
  }

  const returnModalDividerClass = (type) => {
    switch(type){
      case "confirm":{
        return "green";
      }
      case "success":{
        return "green";
      }
      case "warning":{
        return "warning";
      }
      case "error":{
        return "warning";
      }
    }
  }

  const returnModalButtons = (type) => {
    switch(type){
      case "confirm":{
        return (
          <div className="modal-action-area d-flex mt-2">
            <div className={"mr-2 secondary button w-100 d-flex justify-content-center"}
              onClick={()=>{handleDismiss()}} >
              Cancel
            </div>
            <div className={"ml-2 primary button w-100 d-flex justify-content-center"}
              onClick={()=>{handleSuccess()}} >
              OK
            </div>
          </div>
        )
      }
      case "success":{
        break;
      }
      case "warning":{
        return (
          <div className="modal-action-area d-flex mt-2">
            <div className={"mr-2 secondary button w-100 d-flex justify-content-center"}
              onClick={()=>{handleDismiss()}} >
              Cancel
            </div>
            <div className={"ml-2 warning button w-100 d-flex justify-content-center"}
              onClick={()=>{handleSuccess()}} >
              Proceed
            </div>
          </div>
        )
      }
      case "error":{
        break;
      }
    }
  }

  return (
    <div>
      <div className='modal-header d-flex justify-content-center p-2'>
        {title}
        <img alt="" src={require('./../../assets/close-icon.svg')} onClick={()=>{handleDismiss()}} className='close-modal p-2'></img>
      </div>

      <div className={`modal-divider ${returnModalDividerClass(type)}`}></div>

      <div className='modal-content p-2'>
        {children}

        {returnModalButtons(type)}
      </div>

    </div>
  );
}

export default AlertModal;

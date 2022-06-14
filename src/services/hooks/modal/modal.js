import React, {useContext} from "react";
import ReactDOM from "react-dom";
import { ModalContext } from "./modalContext";

const Modal = () => {
  let { modalContent, handleModal, modal } = useContext(ModalContext);
  if (modal) {
    return ReactDOM.createPortal(
      <>
      <div
        className="modal-backdrop"
        onClick={() => handleModal()}></div>
        <div className="modal-container text-white">
          {modalContent}
        </div>
      </>,
      document.querySelector("#modal-root")
    );
  } else return null;
};

export default Modal;

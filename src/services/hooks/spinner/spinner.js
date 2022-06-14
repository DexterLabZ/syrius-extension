import React, {useContext} from "react";
import ReactDOM from "react-dom";
import { SpinnerContext } from "./spinnerContext";

const Spinner = () => {
  let { spinnerContent, spinner } = useContext(SpinnerContext);
  if (spinner) {
    return ReactDOM.createPortal(
      <>
      <div
        className='spinner-backdrop'></div>
        <div className='spinner-container text-white'>
          <img alt="" src={require("./../../../assets/spinner.svg")} className='spinner'/>
          <div>{spinnerContent}</div>          
        </div>
      </>,
      document.querySelector('#spinner-root')
    );
  } else return null;
};

export default Spinner;

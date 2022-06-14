import React, {useContext} from "react";
import ReactDOM from "react-dom";
import { SilentSpinnerContext } from "./silentSpinnerContext";

const SilentSpinner = () => {
  let { silentSpinnerContent, silentSpinner } = useContext(SilentSpinnerContext);
  if (silentSpinner) {
    return ReactDOM.createPortal(
      <>
        <div className='pow-spinner-container text-white tooltip'>
          <img alt="" src={require("./../../../assets/spinner.svg")} className='pow-spinner'/>
          <div className='tooltip-text spinner-tooltip'>{silentSpinnerContent}</div>          
        </div>
      </>,
      document.querySelector('#pow-spinner-root')
    );
  } else return null;
};

export default SilentSpinner;

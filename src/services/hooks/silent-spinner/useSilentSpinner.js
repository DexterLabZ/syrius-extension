import React from "react";

export default () => {
  let [silentSpinner, setSilentSpinner] = React.useState(false);
  let [silentSpinnerContent, setSpinnerPowContent] = React.useState("Loading ...");

  let handleSilentSpinner = (content = false) => {

    // 
    // How to use
    // 
    // const { handleSilentSpinner } = useContext(SpinnerPowContext);
    // const showSilentSpinner = handleSilentSpinner(<div>Whatever message you want here</div>);
    // showSilentSpinner(false);
  
    setSilentSpinner(!silentSpinner);
    if (content) {
      setSpinnerPowContent(content);
    }

    return setSilentSpinner;
  };

  return { silentSpinner, handleSilentSpinner, silentSpinnerContent };
};

import React from "react";

export default () => {
  let [spinner, setSpinner] = React.useState(false);
  let [spinnerContent, setSpinnerContent] = React.useState("Loading ...");

  let handleSpinner = (content = false) => {

    // 
    // How to use
    // 
    // const { handleSpinner } = useContext(SpinnerContext);
    // const showSpinner = handleSpinner(<div>Whatever message you want here</div>);
    // showSpinner(false);
  
    setSpinner(!spinner);
    if (content) {
      setSpinnerContent(content);
    }

    return setSpinner;
  };

  return { spinner, handleSpinner, spinnerContent };
};

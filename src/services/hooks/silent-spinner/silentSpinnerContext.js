import React from "react";
import useSilentSpinner from "./useSilentSpinner";
import SilentSpinner from "./silentSpinner";

let SilentSpinnerContext;
let { Provider } = (SilentSpinnerContext = React.createContext());

let SilentSpinnerProvider = ({ children }) => {
  let { silentSpinner, handleSilentSpinner, silentSpinnerContent } = useSilentSpinner();
  return (
    <Provider value={{ silentSpinner, handleSilentSpinner, silentSpinnerContent }}>
      <SilentSpinner />
      {children}
    </Provider>
  );
};

export { SilentSpinnerContext, SilentSpinnerProvider };

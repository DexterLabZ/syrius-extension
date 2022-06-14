import React from "react";
import useSpinner from "./useSpinner";
import Spinner from "./spinner";

let SpinnerContext;
let { Provider } = (SpinnerContext = React.createContext());

let SpinnerProvider = ({ children }) => {
  let { spinner, handleSpinner, spinnerContent } = useSpinner();
  return (
    <Provider value={{ spinner, handleSpinner, spinnerContent }}>
      <Spinner />
      {children}
    </Provider>
  );
};

export { SpinnerContext, SpinnerProvider };

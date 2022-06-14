import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice"
import integrationFlowReducer from "./integrationSlice"
import connectionParametersReducer from "./connectionParametersSlice";

export const store = configureStore({
  reducer:{
    wallet: walletReducer,
    integrationFlow: integrationFlowReducer,
    connectionParameters: connectionParametersReducer,
  }
})
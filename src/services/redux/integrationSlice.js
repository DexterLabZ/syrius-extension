import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentIntegrationFlow: "",
  currentIntegrationStep: "",

  flows: {
    walletAccess: {
      opening: {},
      accepting: {},
      displayingInfo: {}
    },
    transactionSigning: {
      opening: {},
      accepting: {},
      displayingInfo: {}
    },
    accountBlockSending: {
      opening: {},
      accepting: {},
      displayingInfo: {}
    },
  },

  transactionData: {},
  accountBlockData: {},
}

export const integrationFlowSlice = createSlice({
  name: "integrationFlow",
  initialState,
  reducers:{
    resetIntegrationFlow: (state) =>{
      state = initialState;
    },
    setCurrentIntegrationFlow: (state, action) => {
      state.currentIntegrationFlow = action.payload;
      state.currentIntegrationStep = Object.keys(state.flows[state.currentIntegrationFlow])[0];
    },    
    setCurrentIntegrationStep: (state, action) => {
      state.currentIntegrationStep = action.payload;
    },
    storeTransactionData: (state, action) => {
      state.transactionData = action.payload;
    },
    storeAccountBlockData: (state, action) => {
      state.accountBlockData = action.payload;
    },
    nextIntegrationStep: (state) => {
      if(state.currentIntegrationFlow !== ""){
        const steps = Object.keys(state.flows[state.currentIntegrationFlow]);

        if(!state.currentIntegrationStep) {
          state.currentIntegrationStep = steps[0];
        }

        if(steps.length > steps.indexOf(state.currentIntegrationStep)+1){
          state.currentIntegrationStep = steps[steps.indexOf(state.currentIntegrationStep)+1];
        }
      }
    },
    previousStep: (state, action) => {
      state.currentIntegrationStep = action.payload;
    },
  },
})

export const { resetIntegrationFlow, setCurrentIntegrationFlow, nextIntegrationStep, setCurrentIntegrationStep, storeTransactionData, storeAccountBlockData } = integrationFlowSlice.actions;

export default integrationFlowSlice.reducer
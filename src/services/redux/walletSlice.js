import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  walletName: "",
  walletPassword: "",
  selectedAddressIndex: 0,
  maxAddressIndex: 1
}

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers:{
    resetWalletState: (state) =>{
      state = initialState;
    },
    storeWalletName: (state, action) => {
      state.walletName = action.payload;
    },
    storeWalletPassword: (state, action) => {
      state.walletPassword = action.payload;
    },
    loadAddressInfoForWalletFromStorage: (state, action)=>{
      const addressInfo = JSON.parse(localStorage.getItem("addressInfo"));
      if(addressInfo){
        if(!action.payload || !addressInfo[action.payload]){
            addressInfo[action.payload] = {
              selectedAddressIndex: initialState.selectedAddressIndex,
              maxAddressIndex: initialState.maxAddressIndex
            };
          }

        state.selectedAddressIndex = addressInfo[state.walletName].selectedAddressIndex;
        state.maxAddressIndex = addressInfo[state.walletName].maxAddressIndex;
      }
    },
    storeSelectedAddressIndex: (state, action) => {
      state.selectedAddressIndex = action.payload;
    },
    storeMaxAddressIndex: (state, action) => {
      state.maxAddressIndex = action.payload;
    },
  },
})

export const { resetWalletState, storeWalletName, storeWalletPassword, storeSelectedAddressIndex, storeMaxAddressIndex, loadAddressInfoForWalletFromStorage } = walletSlice.actions;

export default walletSlice.reducer
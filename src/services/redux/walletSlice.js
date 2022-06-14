import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  walletName: "",
  walletPassword: ""
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
  },
})

export const { resetWalletState, storeWalletName, storeWalletPassword } = walletSlice.actions;

export default walletSlice.reducer
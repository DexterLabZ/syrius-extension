import { createSlice } from "@reduxjs/toolkit";
import { Zenon, netId } from 'znn-ts-sdk';

const initialState = {
  nodeUrl: Zenon.getSingleton().defaultServerUrl,
  chainIdentifier: netId
}

export const connectionParametersSlice = createSlice({
  name: "wallet",
  initialState,
  reducers:{
    resetConnectionParametersState: (state) =>{
      state = initialState;
    },
    storeNodeUrl: (state, action) => {
      state.nodeUrl = action.payload;
    },
    storeChainIdentifier: (state, action) => {
      state.chainIdentifier = action.payload;
    },
  },
})

export const { resetConnectionParametersState, storeNodeUrl, storeChainIdentifier } = connectionParametersSlice.actions;

export default connectionParametersSlice.reducer
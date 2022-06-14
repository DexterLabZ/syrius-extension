import { createSlice } from "@reduxjs/toolkit";
import { Zenon } from "znn-ts-sdk";
import { netId } from "znn-ts-sdk/dist/lib/src/global"

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
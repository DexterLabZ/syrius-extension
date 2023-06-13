import { KeyStoreManager, Primitives, Constants } from 'znn-ts-sdk';
const memoryPoolPageSize = 50;

const arrayShuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to arrayShuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const receiveAllBlocks = async (zenon, currentKeyPair) => {
  return new Promise(async (resolve, reject)=>{
    const address = (await currentKeyPair.getAddress()).toString(); 
    const addressObject = Primitives.Address.parse(address);

    const timeout = 900000;
    setTimeout(() => {
      reject(`Timeout after ${timeout/1000} seconds`);
    }, timeout);
  
    let getUnreceivedBlocksByAddress = await zenon.ledger.getUnreceivedBlocksByAddress(addressObject, 0, memoryPoolPageSize);
  
    while (getUnreceivedBlocksByAddress.count > 0) {
      for (let block of getUnreceivedBlocksByAddress.list || []) {
        const accountBlock = Primitives.AccountBlockTemplate.receive(block.hash);
        console.log("receiveAllBlocks - accountBlock", accountBlock)
        console.log("JSON.stringify(accountBlock) - accountBlock", JSON.stringify(accountBlock))
        await zenon.send(accountBlock, currentKeyPair);
      }
      getUnreceivedBlocksByAddress = (await zenon.ledger
          .getUnreceivedBlocksByAddress(addressObject, 0, memoryPoolPageSize));
    } 
    resolve();
  })
}

const loadStorageWalletNames = () => {
  const _keyManager = new KeyStoreManager();
  const addresses = _keyManager.listAllKeyStores();
  let wallets = [];

  if (Object.keys(addresses).length > 0) {
    for (const key in addresses) {
      if (addresses.hasOwnProperty(key)) {
        wallets.push(key);
      }
    }
  }
  return wallets;
}

const defaultSelectedAddressIndex = 0;
const defaultMaxAddressIndex = 1;

const loadStorageAddressInfo = (walletName) => {
  const defaultAddressInfo = {};
  defaultAddressInfo[walletName] = {
    selectedAddressIndex: defaultSelectedAddressIndex,
    maxAddressIndex: defaultMaxAddressIndex
  }
  const addressInfo = JSON.parse(localStorage.getItem("addressInfo"));

  if(addressInfo){
    if(walletName && 
      (!addressInfo[walletName] || 
        (addressInfo[walletName] && 
          (!addressInfo[walletName].maxAddressIndex || !addressInfo[walletName].selectedAddressIndex)))){
      addressInfo[walletName] = defaultAddressInfo[walletName];
    }
    setAddressInfoToStorage(addressInfo)
    return addressInfo[walletName]; 
  }else{
    setAddressInfoToStorage(defaultAddressInfo);
    return defaultAddressInfo[walletName];
  }
}

const setAddressInfoToStorage = (addressInfo) => {
  localStorage.setItem("addressInfo", JSON.stringify(addressInfo));
}
    
export {arrayShuffle, receiveAllBlocks, loadStorageWalletNames, loadStorageAddressInfo, setAddressInfoToStorage, defaultSelectedAddressIndex, defaultMaxAddressIndex};
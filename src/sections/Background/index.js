// console.log('This is the background page.');
let siteTabId;
const walletCredentials = {
  name: "",
  password: "",
  timestamp: 0
}
const credentialsResetIntervalInSeconds = 3600;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // 
  // Outgoing
  // 
  if (request.message === 'znn.requestWalletAccess') {
    // console.log("Got message from content.js", request.data);
    siteTabId = sender.tab.id;
    let extensionWindow = window.open("popup.html", "extension_popup", "width=376,height=650,status=no,scrollbars=yes,resizable=yes");
    extensionWindow.znn = {
      currentIntegrationFlow: "walletAccess"
    }
    sendResponse("Extension opened !");
    return true;
  }

  if (request.message === 'znn.sendTransactionToSigning') {
    // console.log("Got message from content.js", siteTabId, request.params);
    siteTabId = sender.tab.id;
    let extensionWindow = window.open("popup.html", "extension_popup", "width=376,height=650,status=no,scrollbars=yes,resizable=yes");
    extensionWindow.znn = {
      currentIntegrationFlow: "transactionSigning",
      transactionData: request.params
    }
    sendResponse("Extension opened !");
    return true;
  }

  if (request.message === 'znn.sendAccountBlockToSend') {
    // console.log("Got message from content.js", siteTabId, request.params);
    siteTabId = sender.tab.id;
    let extensionWindow = window.open("popup.html", "extension_popup", "width=376,height=650,status=no,scrollbars=yes,resizable=yes");
    extensionWindow.znn = {
      currentIntegrationFlow: "accountBlockSending",
      accountBlockData: request.params
    }
    sendResponse("Extension opened !");
    return true;
  }

  // 
  // Incoming
  // 
  if (request.message === 'znn.grantedWalletRead') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.grantedWalletRead", 
      data: request.data
    }, function(response) {
      // console.log("Response at znn.grantedWalletRead:", response)
    });    
    return true;
  }

  if (request.message === 'znn.deniedWalletRead') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.deniedWalletRead", 
      error: request.error,
      data: request.data
    }, function(response) {
      // console.log("Response at znn.deniedWalletRead:", response)
    });    
    return true;
  }

  if (request.message === 'znn.signedTransaction') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", siteTabId, request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.signedTransaction", 
      data: request.data
    }, function(response) {
      // console.log("Response at znn.signedTransaction: ", response)
    });    
    return true;
  }
  
  if (request.message === 'znn.deniedSignTransaction') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", siteTabId, request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.deniedSignTransaction", 
      error: request.error,
      data: request.data
    }, function(response) {
      // console.log("Response at znn.deniedSignTransaction: ", response)
    });    
    return true;
  }


  if (request.message === 'znn.accountBlockSent') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", siteTabId, request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.accountBlockSent", 
      data: request.data
    }, function(response) {
      // console.log("Response at znn.accountBlockSent: ", response)
    });    
    return true;
  }

  if (request.message === 'znn.deniedSendAccountBlock') {
    // console.log("Got message from popup (siteIntegrationLayout.js)", siteTabId, request.data);
    chrome.tabs.sendMessage(siteTabId, {
      message: "znn.deniedSendAccountBlock", 
      error: request.error,
      data: request.data
    }, function(response) {
      // console.log("Response at znn.deniedSendAccountBlock: ", response)
    });    
    return true;
  }


  // 
  // Used for wallet credentials temporary/"session" storage
  // 
  if (request.message === 'internal.getCredentialsFromBackgroundScript') {
    // console.log("internal.getCredentialsFromBackgroundScript", request, walletCredentials);
    if(walletCredentials.name && walletCredentials.password && walletCredentials.timestamp){
      const now = new Date();
      if((now-walletCredentials.timestamp)/1000 < credentialsResetIntervalInSeconds){
        sendResponse(walletCredentials);
      }else{
        resetCredentials();
        sendResponse(false);
      }
    }else{
      sendResponse(false);
    }
    return true;
  }

  if (request.message === 'internal.storeCredentialsToBackgroundScript') {
    // console.log("internal.storeCredentialsToBackgroundScript", request, walletCredentials);
    if(request.data.name && request.data.password){
      walletCredentials.name = request.data.name;
      walletCredentials.password = request.data.password;
      walletCredentials.timestamp = new Date();
    }
    return true;
  }

  if (request.message === 'internal.clearCredentialsOfBackgroundScript') {
    // console.log("internal.clearCredentialsOfBackgroundScript", request, walletCredentials);
    resetCredentials();
    return true;
  }

  return true;
});

const resetCredentials = () => {
  // console.log("Reseting wallet credentials")
  walletCredentials.name = "";
  walletCredentials.password = "";
  walletCredentials.timestamp = new Date();
}

chrome.runtime.onSuspend.addListener(()=>{
  resetCredentials();
});

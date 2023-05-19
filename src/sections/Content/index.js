
console.log('Content script works!');

var elt = document.createElement("script");
elt.innerHTML = `
  window.zenon = {};
  window.zenon.isSyriusExtension = true;
`;
document.head.appendChild(elt);


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'znn.grantedWalletRead') {
    window.postMessage({
      method: "znn.grantedWalletRead",
      data: request.data
    }, "*");
    return true;
  }

  if (request.message === 'znn.deniedWalletRead') {
    window.postMessage({
      method: "znn.deniedWalletRead",
      error: request.error,
      data: request.data
    }, "*");
    return true;
  }

  if (request.message === 'znn.signedTransaction') {
    window.postMessage({
      method: "znn.signedTransaction",
      data: request.data
    }, "*");
    return true;
  }

  if (request.message === 'znn.deniedSignTransaction') {
    window.postMessage({
      method: "znn.deniedSignTransaction",
      error: request.error,
      data: request.data
    }, "*");
    return true;
  }

  if (request.message === 'znn.accountBlockSent') {
    window.postMessage({
      method: "znn.accountBlockSent",
      data: request.data
    }, "*");
    return true;
  }
  
  if (request.message === 'znn.deniedSendAccountBlock') {
    window.postMessage({
      method: "znn.deniedSendAccountBlock",
      error: request.error,
      data: request.data
    }, "*");
    return true;
  }

  if (request.message === 'znn.addressChanged') {
    window.postMessage({
      method: "znn.addressChanged",
      data: request.data
    }, "*");
    return true;
  }

  return true;
});

window.addEventListener("message", (event) => {
  // console.log("Got message from site ", event);
  try{
    const parsedEvent = event.data;
    // console.log("parsedEvent", parsedEvent)

    if(parsedEvent.method){
      switch(parsedEvent.method){
        case "znn.requestWalletAccess":{
          // console.log("Sending requestWalletAccess to extension(background.js) from content.js");
          chrome.runtime.sendMessage({message: 'znn.requestWalletAccess'}, 
          function(message) { 
            // console.log("Received response at znn.requestWalletAccess", message);
          });
          break;
        }
        case "znn.sendTransactionToSigning": {
          // console.log("znn.sendTransactionToSigning", parsedEvent);
          chrome.runtime.sendMessage({
            message: 'znn.sendTransactionToSigning',
            params: parsedEvent.params
          }, 
          function(message) { 
            // console.log("Received response at znn.sendTransactionToSigning", message);
          });
          break;
        }
        case "znn.sendAccountBlockToSend": {
          // console.log("znn.sendAccountBlockToSend", parsedEvent);
          chrome.runtime.sendMessage({
            message: 'znn.sendAccountBlockToSend',
            params: parsedEvent.params
          }, 
          function(message) { 
            // console.log("Received response at znn.sendAccountBlockToSend", message);
          });
          break;
        }
        default: {}
      }
    }
  
  }
  catch(err){
    console.error("Not the proper JSON format:", err);
  }
}, false);







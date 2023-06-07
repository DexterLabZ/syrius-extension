<img alt="" src="src/assets/img/icon-128.png" width="64"/>

# Syrius Extension

Please open up an issue to nudge me to keep the npm packages up-to-date. FYI, it takes time to make different packages with different versions work together nicely.

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
5. Run `npm install` to install the dependencies.
6. Run `npm run build`
7. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.

## How to integrate site with extension

```
const listenToExtension = function() {
  window.addEventListener("message", (event) => {
    console.log("Message received on site ", event);
    try{
      const parsedData = event.data;
      if(parsedData.method){
        switch(parsedData.method){
          case "znn.grantedWalletRead":{
            const result = parsedData.data;
            break;
          }
          case "znn.signedTransaction": {
            const result = parsedData.data;
            break;
          }
          case "znn.accountBlockSent": {
            const result = parsedData.data;
            break;
          }
          case "znn.addressChanged": {
            const newAddress = parsedData.data?.newAddress;
            break;
          }
        }
      }
    }
    catch(err){
      console.error(err);
    }
  });
}

const connectExtensionWallet = function() {
  window.postMessage({
    method: "znn.requestWalletAccess",
    params: {}
  }, "*");
}

const sendTransactionToSigning = function() {
  window.postMessage({
    method: "znn.sendTransactionToSigning",
    params: {
      from: 'z1qqjnwjjpnue8xmmpanz6csze6tcmtzzdtfsww7', 
      to: 'z1qqjnwjjpnue8xmmpanz6csze6tcmtzzdtfsww7', 
      amount: '330000000', // 1 ZNN = 100000000
      tokenStandard:
        'zts1znnxxxxxxxxxxxxx9z4ulx', 
      chainId: '3',   
    }
  }, "*");
}

const sendAccountBlockToSend = function() {
  window.postMessage({
    method: "znn.sendAccountBlockToSend",
    params: accountBlockTransactionExample.toJson()
  }, "*");
}
```
## Webpack auto-reload and HRM

To make your workflow much more efficient this project uses the [webpack server](https://webpack.github.io/docs/webpack-dev-server.html) to development (started with `npm start`) with auto reload feature that reloads the browser automatically every time that you save some file in your editor.

You can run the dev mode on other port if you want. Just specify the env var `port` like this:

```
$ PORT=6002 npm start
```

## Packing

```
$ NODE_ENV=production npm run build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.
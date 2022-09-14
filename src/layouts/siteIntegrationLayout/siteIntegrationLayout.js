import React, {useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextIntegrationStep } from '../../services/redux/integrationSlice';
import { KeyStoreManager, Zenon, Primitives } from 'znn-ts-sdk';
import TransactionItem from '../../components/transaction-item/transaction-item';
import fallbackValues from '../../services/utils/fallbackValues';
import { toast } from 'react-toastify';

const SiteIntegrationLayout = ()=>{
  const [address, setAddress] = useState(""); 
  const [signedHash, setSignedHash] = useState({}); 
  const dispatch = useDispatch();
  const integrationState = useSelector(state => state.integrationFlow);
  const walletCredentials = useSelector(state => state.wallet);
  const myAddressObject = useRef({}); 
  const connectionParameters = useSelector(state => state.connectionParameters)
  const zenon = Zenon.getSingleton(); 
  const [walletInfo, setWalletInfo] = useState({
    balanceInfoList: fallbackValues.availableTokens
  }); 
  const [isFormValid, setIsFormValid] = useState(true);


  useEffect(async()=>{
    await getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);

    if(integrationState.currentIntegrationStep === "opening"){
      dispatch(nextIntegrationStep());
    }
  }, []);
  
  const getAddress = async()=>{
    await getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);    
    chrome.runtime.sendMessage({
      message: "znn.grantedWalletRead", 
      data: {
        address: myAddressObject.current.toString(),
        chainIdentifier: connectionParameters.chainIdentifier,
        nodeUrl: connectionParameters.nodeUrl
      }
    });
    dispatch(nextIntegrationStep());
  }

  const signTransaction = async()=>{
    if(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].balance
      && parseFloat(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].balance) >= 
      parseFloat(integrationState.transactionData.amount)){
        setIsFormValid(true);
        try{
          const accountBlockTemplateSend = Primitives.AccountBlockTemplate.send(
            Primitives.Address.parse(integrationState.transactionData.to),
            Primitives.TokenStandard.parse(integrationState.transactionData.tokenStandard),
            parseFloat(integrationState.transactionData.amount));    

          const _keyManager = new KeyStoreManager();          
          const decrypted = await _keyManager.readKeyStore(walletCredentials.walletPassword, walletCredentials.walletName);
          if(decrypted){
            const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
            const signedTransaction = await zenon.send(accountBlockTemplateSend, currentKeyPair);
            setSignedHash(signedTransaction.hash.toString());      
            chrome.runtime.sendMessage({
              message: "znn.signedTransaction", 
              data: {
                originalTransaction: integrationState.transactionData,
                accountBlock: accountBlockTemplateSend,
                signedTransaction: signedTransaction
              }
            });
            dispatch(nextIntegrationStep());  
          }      
        }
        catch(err){
          console.error(err);
          let readableError = err;
          if(err.message) {
            readableError = err.message;
          }
          readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];
        
          toast(readableError + "",{    
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            newestOnTop: true,
            type: 'error',
            theme: 'dark'
          });
            }
      }else{
        setIsFormValid(false);
        console.error("Insufficient funds");
      }
  }

  const sendAccountBlock = async()=>{
      setIsFormValid(true);
      try{
        const accountBlockTemplateSend = Primitives.AccountBlockTemplate.fromJson(integrationState.accountBlockData);
        const _keyManager = new KeyStoreManager();        
        const decrypted = await _keyManager.readKeyStore(walletCredentials.walletPassword, walletCredentials.walletName);
        
        if(decrypted){
          const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
          const signedTransaction = await zenon.send(accountBlockTemplateSend, currentKeyPair);
          setSignedHash(signedTransaction.hash.toString());
    
          chrome.runtime.sendMessage({
            message: "znn.accountBlockSent", 
            data: {
              originalTransaction: integrationState.accountBlockData,
              accountBlock: accountBlockTemplateSend,
              signedTransaction: signedTransaction.toJson()
            }
          });
          dispatch(nextIntegrationStep());  
        }      
      }
      catch(err){
        console.error(err);
        let readableError = err;
        if(err.message) {
          readableError = err.message;
        }
        readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];

          toast(readableError + "",{    
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          newestOnTop: true,
          type: 'error',
          theme: 'dark'
        });
      }
  }

  const getWalletInfo = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);
      
      if(decrypted){
        const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
        const addr = (await currentKeyPair.getAddress()).toString();
        myAddressObject.current = Primitives.Address.parse(addr);
        setAddress(addr); 

        const getAccountInfoByAddress = await zenon.ledger.getAccountInfoByAddress(myAddressObject.current);

        if(Object.keys(getAccountInfoByAddress.balanceInfoList).length) {
          getAccountInfoByAddress.balanceInfoList = {...walletInfo.balanceInfoList, ...getAccountInfoByAddress.balanceInfoList}
          setWalletInfo(getAccountInfoByAddress);
        }

      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      console.error(err);
      let readableError = err;
      if(err.message) {
        readableError = err.message;
      }
      readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];


      toast(readableError + "",{    
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        newestOnTop: true,
        type: 'error',
        theme: 'dark'
      });
    }
  }

  return (
    <div className='text-white align-items-center d-flex h-100 justify-content-center' style={{height: '100vh'}}>
        { integrationState.currentIntegrationFlow === 'walletAccess' ? 
            <div className="w-100">
              {
                integrationState.currentIntegrationStep === 'accepting' ?
                  <div className="mr-2 ml-2 max-w-100vw">
                    <div className='tooltip'>
                      <p className="text-xs mb-0">Current Address</p>
                      <span className="text-xs text-gray word-break-all" onClick={() => {try{navigator.clipboard.writeText(address); toast(`Copied to clipboard`, {
                                position: "bottom-center",
                                autoClose: 1000,
                                hideProgressBar: true,
                                closeOnClick: true,
                                pauseOnHover: false,
                                draggable: true,
                                newestOnTop: true,
                                type: 'success',
                                theme: 'dark'
                              })}catch(err){console.error(err)}
                            }}>{address}</span>
                        <span className='tooltip-text mt-4'>Click to copy. Go to settings to change address.</span>
                    </div>

                    <h3 className="mt-4">Do you grant this website permission to read your <b>Address</b>, <b>Chain Identifier</b> and <b>Node URL</b> ?</h3>
                    <div className='d-flex w-100 justify-content-around mt-4'>
                      <div onClick={()=>{window.close()}} className='button secondary pl-5 pr-5'>No</div>
                      <div onClick={()=>{getAddress()}} className={`button primary pl-5 pr-5 ${isFormValid?'':'disabled'}`}>Yes</div>
                    </div>
                    <h5 className='text-gray mt-4 d-flex'>
                      <img alt="" className='mr-1' src={require(`./../../assets/info-icon.svg`)} width='18px'></img>
                      <span>You can change the current wallet and address from the Syrius Extension Settings</span>
                    </h5>
                  </div> 
                :''
              }
            <div>
            </div>
              {
                integrationState.currentIntegrationStep === 'displayingInfo' ?
                  <div className="mr-2 ml-2 max-w-100vw">
                    <h3>Granted <b>read</b> access to</h3>
                    <p className="text-xs mb-0 mt-5">Address</p>
                    <span className="text-xs text-gray word-break-all">{address}</span>

                    <p className="text-xs mb-0 mt-2">Chain identifier (netId)</p>
                    <span className="text-xs text-gray word-break-all">{connectionParameters.chainIdentifier}</span>

                    <p className="text-xs mb-0 mt-2">Current node</p>
                    <span className="text-xs text-gray word-break-all">{connectionParameters.nodeUrl}</span>

                    <div className='d-flex mt-5 w-100 justify-content-center'>
                        <div onClick={()=>{window.close()}} className='button primary pl-5 pr-5'>Done</div>
                      </div>
                  </div>

                :''
              }
            </div>
          :''
        }

        { integrationState.currentIntegrationFlow === 'transactionSigning' ? 
            <div className="w-100">
              {
                integrationState.currentIntegrationStep === 'accepting' ?
                  <div>
                    <div className='ml-2 mr-2 d-flex justify-content-center max-w-100vw'>
                      <div className='wallet-circle circle-green'>
                        <h4 className='m-0 text-gray'>Available</h4>
                        <h2 className='mb-0 mt-1 tooltip'>
                          <span className='m-0 '>{parseFloat(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].balance / Math.pow(10, walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.decimals)).toFixed(0)}</span>
                          <span className='mb-0 text-gray'> {walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.symbol}</span>
                          <span className='tooltip-text'>{parseFloat(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].balance/Math.pow(10, walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.decimals)).toFixed(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.decimals)}</span>
                        </h2>

                        <h4 onClick={() => {try{navigator.clipboard.writeText(address); toast(`Copied to clipboard`, {
                              position: "bottom-center",
                              autoClose: 1000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              pauseOnHover: false,
                              draggable: true,
                              newestOnTop: true,
                              type: 'success',
                              theme: 'dark'
                            })}catch(err){console.error(err)}
                          }} className='mb-0 mt-1 text-gray tooltip'>
                          {address.slice(0, 3) + '...' + address.slice(-3)}
                          <span className='tooltip-text'>{address}</span>
                        </h4>
                      </div>
                    </div>
                    <div className="mt-4 mr-2 ml-2">
                      <h3>Do you want to make this transaction ?</h3>
                      <TransactionItem displayFullAddress={true} type="send" amount={parseFloat(integrationState.transactionData.amount/Math.pow(10, walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.decimals)).toFixed(walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.decimals)}
                      tokenSymbol={walletInfo.balanceInfoList[integrationState.transactionData.tokenStandard].token.symbol} address={integrationState.transactionData.to}></TransactionItem>

                      <div className='d-flex mt-4 w-100 justify-content-around'>
                        <div onClick={()=>{window.close()}} className='button secondary pl-5 pr-5'>No</div>
                        <div onClick={()=>{signTransaction()}} className={`button primary pl-5 pr-5 ${isFormValid?'':'disabled'}`}>Yes</div>
                      </div>

                      <h5 className='text-gray mt-4 d-flex'>
                        <img alt="" className='mr-1' src={require(`./../../assets/info-icon.svg`)} width='18px'></img>
                        <span>You can change the current wallet and address from the Syrius Extension Settings</span>
                      </h5>

                    </div>
                  </div> 
                :''
              }
              <div>
              </div>
              {
                integrationState.currentIntegrationStep === 'displayingInfo' ?
                <div className="mr-2 ml-2 max-w-100vw">
                  <h3>Transaction successfully executed !</h3>
                  <p className="text-xs mt-5">Transaction hash</p>
                  <span className="text-xs text-gray word-break-all">{signedHash}</span>
                  
                  <div className='d-flex mt-4 w-100 justify-content-center'>
                      <div onClick={()=>{window.close()}} className='button primary pl-5 pr-5'>Done</div>
                    </div>
                </div>
                :''
              }
            </div>
          :''
        }

      { integrationState.currentIntegrationFlow === 'accountBlockSending' ? 
            <div className="w-100">
              {
                integrationState.currentIntegrationStep === 'accepting' ?
                  <div>
                    <div className='tooltip'>
                      <p className="text-xs mb-0 mt-5">Current Address</p>
                      <span className="text-xs text-gray word-break-all" onClick={() => {try{navigator.clipboard.writeText(address); toast(`Copied to clipboard`, {
                                position: "bottom-center",
                                autoClose: 1000,
                                hideProgressBar: true,
                                closeOnClick: true,
                                pauseOnHover: false,
                                draggable: true,
                                newestOnTop: true,
                                type: 'success',
                                theme: 'dark'
                              })}catch(err){console.error(err)}
                            }}>{address}</span>
                        <span className='tooltip-text mt-4'>Click to copy. Go to settings to change address.</span>
                    </div>

                    <div className="mt-4 mr-2 ml-2 max-w-100vw">
                      <h3>Do you want to send this account block ?</h3>
                      <pre style={{maxHeight: '220px', overflow: 'scroll', textAlign: 'left'}}>
                        {JSON.stringify(integrationState.accountBlockData, undefined, 2)}
                      </pre>

                      <div className='d-flex mt-4 w-100 justify-content-around max-w-100vw'>
                        <div onClick={()=>{window.close()}} className='button secondary pl-5 pr-5'>No</div>
                        <div onClick={()=>{sendAccountBlock()}} className={`button primary pl-5 pr-5 ${isFormValid?'':'disabled'}`}>Yes</div>
                      </div>

                      <h5 className='text-gray mt-4 d-flex'>
                        <img alt="" className='mr-1' src={require(`./../../assets/info-icon.svg`)} width='18px'></img>
                        <span>You can change the current wallet and address from the Syrius Extension Settings</span>
                      </h5>

                    </div>
                  </div> 
                :''
              }
              <div>
              </div>
              {
                integrationState.currentIntegrationStep === 'displayingInfo' ?
                <div className="mr-2 ml-2">
                  <h3>Account block sent !</h3>
                  <p className="text-xs mt-5">Transaction hash</p>
                  <span className="text-xs text-gray word-break-all">{signedHash}</span>
                  
                  <div className='d-flex mt-4 w-100 justify-content-center'>
                      <div onClick={()=>{window.close()}} className='button primary pl-5 pr-5'>Done</div>
                    </div>
                </div>
                :''
              }
            </div>
          :''
        }
    </div>
  );
};

export default SiteIntegrationLayout;

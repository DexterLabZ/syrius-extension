import React, { useEffect, useState } from 'react';
import { KeyStoreManager } from 'znn-ts-sdk';
import QRCode from "react-qr-code";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Receive = () => {
  const [address, setAddress] = useState(""); 
  const walletCredentials = useSelector(state => state.wallet);

  useEffect(() => {
    getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);
  }, []);

  const getWalletInfo = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);
      
      if(decrypted){
        const currentKeyPair = decrypted.getKeyPair();
        const address = (await currentKeyPair.getAddress()).toString(); 
        setAddress(address);
      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      console.error("Error ", err);
    }
  }

  return (
    <div className='black-bg'>

      <div className='ml-2 mr-2'>
        <div className="mt-3 mb-4" style={{position: "relative"}}>
          <h4 className='wrap-break-word'>{address}</h4>
          <div onClick={() => {try{navigator.clipboard.writeText(address); toast(`Copied to clipboard`, {
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
              }} className='copy-button' style={{position: "absolute", bottom: "-1.5em", right: 0}}>
            <img alt="" src={require('./../../../assets/copy-icon.png')} width='14px'></img>
          </div>
        </div>

        <div style={{ background: '#151515', padding: '1em' }}>
          <QRCode bgColor="#151515" fgColor="#00E721" value={address} level="M" />
        </div>

        <p className='mt-2'>This address can only be used to receive ZNN or QSR</p>
      </div>
  </div>
  );
};

export default Receive;

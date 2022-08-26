import React, { useEffect, useState, useContext, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyStoreManager, Zenon, Primitives } from 'znn-ts-sdk';
import fallbackValues from '../../../services/utils/fallbackValues';
import { useSelector } from 'react-redux';
import { ModalContext } from '../../../services/hooks/modal/modalContext';
import AlertModal from '../../../components/modals/alert-modal';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import ControlledDropdown from '../../../components/custom-dropdown/controlled-dropdown';
import { SilentSpinnerContext } from '../../../services/hooks/silent-spinner/silentSpinnerContext';

const Send = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const availableTokens = Object.keys(fallbackValues.availableTokens);
  const [address, setAddress] = useState(""); 
  const [recipientAddress , setRecipientAddress] = useState(""); 
  const [sendAmount , setSendAmount] = useState(""); 
  const [sendStatus , setSendStatus] = useState(""); 
  const [selectedToken, setSelectedToken] = useState(location.state?.currentSelectedToken || availableTokens[0]); 
  const [walletInfo, setWalletInfo] = useState({
    balanceInfoList: fallbackValues.availableTokens
  }); 
  const zenon = Zenon.getSingleton();
  const myAddressObject = useRef({});
  const walletCredentials = useSelector(state => state.wallet);
  const { handleModal } = useContext(ModalContext);
  const { field, register, control, handleSubmit, formState: { errors }, reset, setValue } = useForm({mode: "onChange"});
  const { handleSilentSpinner } = useContext(SilentSpinnerContext);

  useEffect(() => {
    getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);
  }, []);

  const getWalletInfo = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);
      
      if(decrypted){
        const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
        const addr = (await currentKeyPair.getAddress()).toString(); 
        setAddress(addr);
        myAddressObject.current = Primitives.Address.parse(addr);
              
        const getAccountInfoByAddress = await zenon.ledger.getAccountInfoByAddress(myAddressObject.current);
        if(Object.keys(getAccountInfoByAddress.balanceInfoList).length) {
          setWalletInfo(getAccountInfoByAddress);
        }
      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      console.error("Error ", err);
    }
  }

  const openConfirmModal = (recipientAddress, sendAmount) => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onModalDismiss()}
        onSuccess={()=>onModalSuccess(recipientAddress, sendAmount)}>
        <div>
          <div>Are you sure you want to send</div>
          <div>
            <b>{sendAmount} {walletInfo.balanceInfoList[selectedToken]?.token?.symbol}</b> 
            {" to"}
          </div>         
          <div className='word-break-all'>{recipientAddress} ?</div>
        </div>
      </AlertModal>)
  }

  const onModalDismiss = ()=>{
  }

  const onModalSuccess = (recipientAddress, sendAmount)=>{
    onFormSubmit(recipientAddress, sendAmount);
  }

  const onFormSubmit = (recipientAddress, sendAmount) => {
    sendTransaction(recipientAddress, sendAmount);
  };

  const sendTransaction = async (address, amount)=>{
    const _keyManager = new KeyStoreManager();
    const actualAmount = parseInt(amount*Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals));
    const currentKeyPair = await (await _keyManager.readKeyStore(walletCredentials.walletPassword, walletCredentials.walletName)).getKeyPair(walletCredentials.selectedAddressIndex).generateKeyPair();
    const showSilentSpinner = handleSilentSpinner(
      <>
        <div className='text-bold'>
          Sending ...
        </div>
      </>
    );
    showSilentSpinner(true);

    try{
      const zenon = Zenon.getSingleton();
      setSendStatus("Sending...");
      const AccountBlockTemplateSend = Primitives.AccountBlockTemplate.send(Primitives.Address.parse(address), Primitives.TokenStandard.parse(walletInfo.balanceInfoList[selectedToken].token.tokenStandard), actualAmount);
      await zenon.send(AccountBlockTemplateSend, currentKeyPair);
      setSendAmount(0);
      setRecipientAddress("");
      setSendStatus("Sent !");
      reset();
      showSilentSpinner(false);
      
      toast(`Successfully sent ${amount} ${walletInfo.balanceInfoList[selectedToken]?.token?.symbol}`, {
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        newestOnTop: true,
        type: 'success',
        theme: 'dark'
      });

      setTimeout(()=>{
        setSendStatus("");
      }, 2500);
    }
    catch(err){
      showSilentSpinner(false);
      let readableError = err;
      if(err.message) {
        readableError = err.message;
      }
      readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];

      console.error("Error ", readableError);
      toast(readableError + "",{
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        newestOnTop: true,
        type: 'error',
        theme: 'dark'
      });
  
      setSendStatus("Error");
      setTimeout(()=>{
        setSendStatus("");
      }, 2500);
    }
  } 

  const onSelectToken = (index, value) => {
    setSelectedToken(value.token.tokenStandard);
  }

  return (
    <div className='black-bg'>
      <h1 className='mt-1'>Send</h1>
      
      <div className='mt-2 ml-2 mr-2'>
        <form onSubmit={handleSubmit(()=>openConfirmModal(recipientAddress, sendAmount))}>
          <div className='custom-control'>  
            <ControlledDropdown dropdownComponent = 'TokenDropdown'
              {...register("selectedTokenField", { required: true })} control={control} 
              name="selectedTokenField" 
              options={Object.keys(walletInfo.balanceInfoList).map((value)=>{return walletInfo.balanceInfoList[value]})}
              onChange={onSelectToken} 
              value={selectedToken} 
              placeholder="Select token"
              tokenSymbolPath={`token.symbol`} 
              tokenStandardPath={`token.tokenStandard`} 
              className={`${errors.selectedTokenField?'custom-label-error':''}`} />

            <div className={`input-error ${errors.selectedTokenField?'':'invisible'}`}>
              {errors.selectedTokenField?.message || 'Token is required'}
            </div> 
          </div>  

          <div className='custom-control'> 
            <div className={`input-with-button w-100`}>
              <input name="sendAmountField" {...register("sendAmountField", 
                { required: true, 
                  min: {
                    value: 1,
                    message: 'Minimum of 1'
                  },
                  max: {
                    value: parseFloat(walletInfo.balanceInfoList[selectedToken]?.balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals)),
                    message: 'Maximum of ' + parseFloat(walletInfo.balanceInfoList[selectedToken]?.balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals))
                  }
                })} 
                control={control}
                className={`w-100 custom-label pr-3 ${errors.sendAmountField?'custom-label-error':''}`}
                placeholder={walletInfo.balanceInfoList[selectedToken]?.token?.symbol + " amount"} 
                value={sendAmount} onChange={(e) => {setSendAmount(e.target.value); setValue('sendAmountField', e.target.value, {shouldValidate: true})}} type='number'></input>
              <div className={(walletInfo.balanceInfoList[selectedToken]?.token?.symbol==='ZNN'?'primary':'blue') + " input-chip-button"} 
                onClick={()=>{setSendAmount(walletInfo.balanceInfoList[selectedToken]?.balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals)); setValue('sendAmountField', walletInfo.balanceInfoList[selectedToken]?.balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals), { shouldValidate: true })}}>
                <span>{"MAX: " + parseFloat(walletInfo.balanceInfoList[selectedToken]?.balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken]?.token?.decimals)).toFixed(0)}</span>
              </div>
            </div>

            <div className={`input-error ${errors.sendAmountField?'':'invisible'}`}>
              { errors.sendAmountField?.message || 'Amount is required'}
            </div> 
          </div>

          <div className='custom-control'> 
            <input name="recipientAddressField" {...register("recipientAddressField", { required: true })} 
              className={`w-100 custom-label ${errors.recipientAddressField?'custom-label-error':''}`} 
              placeholder="Recipient address" value={recipientAddress} onChange={(e) => {setRecipientAddress(e.target.value); setValue('recipientAddressField', e.target.value, {shouldValidate: true})}} type='text'></input>

            <div className={`input-error ${errors.recipientAddressField?'':'invisible'}`}>
              { errors.recipientAddressField?.message || 'Address is required'}
            </div> 
          </div>

          <div className='d-flex'>
            <div onClick={() => navigate(-1)} className='button secondary w-100 mr-2 d-flex justify-content-center'>
              Back
            </div>
            <input className={(walletInfo.balanceInfoList[selectedToken]?.token?.symbol==='ZNN'?'primary':'blue') + " button w-100 d-flex justify-content-center text-white"} 
              value={sendStatus || "Send"} type="submit" name="submitButton"></input>
          </div>
        </form>
      </div>
  </div>
  );
};

export default Send;

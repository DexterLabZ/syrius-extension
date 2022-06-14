import React,  { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { KeyStoreManager } from 'znn-ts-sdk';
import MnemonicWord from '../../../components/mnemonic-word/mnemonic-word';
import './export-mnemonic.scss'

const ExportMnemonic = () => {
  const [inputPassword, setInputPassword] = useState();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);
  const [unlockStatusLabel, setUnlockStatusLabel] = useState("Unlock");
  const [mnemonicWords, setMnemonicWords] = useState([]);
  const walletCredentials = useSelector(state => state.wallet);

  const handlePassword = async (password) => {
    try{
      const words = await getMnemonic(password, walletCredentials.walletName);
      if(words){
        setMnemonicWords(words);
        setIsMnemonicVisible(true);
      }else{
        return 'Error decrypting'
      }
    }
    catch(err){
      console.error(err+"");
    }    
  }


  const getMnemonic = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    setUnlockStatusLabel("Unlocking in progress ...");
  
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);  
      if(decrypted.mnemonic){
        return decrypted.mnemonic.split(" ");
      }
      else{
        setUnlockStatusLabel("Wrong password");
        setTimeout(()=>{
          setUnlockStatusLabel("Unlock");
        },2500);
  
        console.error("Error decrypting");
      }
    }
    catch(err){
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
  
      setUnlockStatusLabel("Error unlocking");
  
      setTimeout(()=>{
        setUnlockStatusLabel("Unlock");
      },2500);
    }
  }
  

  return (
    <div className='black-bg'>
      <h1 className='mt-1'>View mnemonic</h1>
      
      <div className='mt-2 ml-2 mr-2'>
        { isMnemonicVisible ?
          <div className='mnemonic-words'>
            {
              mnemonicWords.map((item, index)=>{
                return <MnemonicWord key={"mnemonic-word-"+index} word={item} index={index+1}></MnemonicWord>
              })
            }
          </div>
          :
          <form className='mt-2' id="showMnemonic" onSubmit={handleSubmit(()=>handlePassword(inputPassword))}>
            <div className='custom-control'> 
              <div className={`w-100`}>
                <input name="inputPasswordField" {...register("inputPasswordField", 
                  { required: true})} 
                  className={`w-100 custom-label pr-3 ${errors.inputPasswordField?'custom-label-error':''}`}
                  placeholder="Wallet password"
                  value={inputPassword} onChange={(e) => {setInputPassword(e.target.value); setValue('inputPasswordField', inputPassword, { shouldValidate: true })}} type='password'></input>

              </div>

              <div className={`input-error ${errors.inputPasswordField?'':'invisible'}`}>
                { errors.inputPasswordField?.message || 'Please input password'}
              </div> 
            </div>
            <div className='mt-2 stick-bottom d-flex'>
              <input className='button primary w-100 d-flex justify-content-center text-white' 
                  value={unlockStatusLabel} type="submit" form="showMnemonic" name="submitButton"></input>
            </div>
          </form>
        }
      </div>
  </div>
  );
};

export default ExportMnemonic;

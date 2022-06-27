import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyStoreManager, Primitives, Zenon } from 'znn-ts-sdk';
import ChangeAddressItem from '../../../components/change-address-item/change-address-item';
import { SpinnerContext } from '../../../services/hooks/spinner/spinnerContext';
import { storeMaxAddressIndex, storeSelectedAddressIndex } from '../../../services/redux/walletSlice';

const ChangeAddress = () => {
  const [currentAddress, setCurrentAddress] = useState();
  const { handleSpinner } = useContext(SpinnerContext);
  const walletCredentials = useSelector(state => state.wallet);
  const dispatch = useDispatch();
  let [addresses, setAddresses] = useState([]); 
  const addressInfo = useRef({});

  useEffect(() => {
     const fetchAddresses = async() => {
      await getAddresses(walletCredentials.walletPassword, walletCredentials.walletName, walletCredentials.maxAddressIndex);
  
      addressInfo.current = JSON.parse(localStorage.getItem("addressInfo"));
      addressInfo.current[walletCredentials.walletName] = {
        selectedAddressIndex: walletCredentials.selectedAddressIndex,
        maxAddressIndex: walletCredentials.maxAddressIndex
      }
      localStorage.setItem("addressInfo", JSON.stringify(addressInfo.current));
      
      setCurrentAddress(walletCredentials.selectedAddressIndex);
    }
    fetchAddresses();
  }, []);

  // const updateAddressInfoInLocalStorage = async ()=>{

  // }

  const getAddresses = async (pass, name, maxIndex)=>{
    const _keyManager = new KeyStoreManager();
    const showSpinner = handleSpinner(
      <>
        <div className='text-bold'>
          Loading addresses ...
        </div>
      </>
    );
    
    try{
      showSpinner(true);
      setAddresses([]);
      const decrypted = await _keyManager.readKeyStore(pass, name);
      let newAddresses = [];
      if(decrypted){
        for(let i = 0 ; i<maxIndex; i++){
          const currentKeyPair = decrypted.getKeyPair(i);
          const addr = (await currentKeyPair.getAddress()).toString();
          newAddresses.push(addr);
        }

        setAddresses(prevAddresses => {
          addresses = [...prevAddresses, ...newAddresses];
          return addresses
        });

      }
      else{
        console.error("Error decrypting");
      }
      showSpinner(false);
    }
    catch(err){
      showSpinner(false);
      console.error("Error ", err);
    }
  }

  const onSelectAddress = async (address) => {
    setCurrentAddress(address);
    dispatch(storeSelectedAddressIndex(address));
    
    addressInfo.current[walletCredentials.walletName] = {
      selectedAddressIndex: address,
      maxAddressIndex: walletCredentials.maxAddressIndex
    }
    localStorage.setItem("addressInfo", JSON.stringify(addressInfo.current));
  }
   
  const addAddress = () => {    
    addressInfo.current[walletCredentials.walletName] = {
      selectedAddressIndex: walletCredentials.selectedAddressIndex,
      maxAddressIndex: walletCredentials.maxAddressIndex+1
    }
    localStorage.setItem("addressInfo", JSON.stringify(addressInfo.current));

    dispatch(storeMaxAddressIndex(walletCredentials.maxAddressIndex+1));

    getAddresses(walletCredentials.walletPassword, walletCredentials.walletName, walletCredentials.maxAddressIndex+1);
  }


  return (
    <div className='black-bg'>
      <h1 className='mt-1'>Change address</h1>

      <div className='mt-2 ml-2 mr-2'>
        {
          addresses.map((item, index) => {
            return <ChangeAddressItem isSelected={currentAddress === index} key={"change-address-item-" + index} index={index} onSelect={onSelectAddress} address={item}></ChangeAddressItem>
          })
        }

        <div className='mt-2 stick-bottom d-flex'>
          <div className='button primary w-100 d-flex justify-content-center text-white'
            onClick={addAddress} name="submitButton">Add address</div>
        </div>

      </div>
    </div>
  );
};

export default ChangeAddress;

import React, { useEffect, useState, useRef } from 'react';
import MenuHeader from '../../menu/menu-header/menu-header';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import {
  KeyStoreManager,
  Zenon
} from 'znn-ts-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { loadAddressInfoForWalletFromStorage, resetWalletState, storeWalletName, storeWalletPassword } from '../../../services/redux/walletSlice';
import { useForm } from "react-hook-form";
import ControlledDropdown from '../../../components/custom-dropdown/controlled-dropdown';
import { toast } from 'react-toastify';
import { storeNodeUrl } from '../../../services/redux/connectionParametersSlice';
import { loadStorageWalletNames } from '../../../services/utils/utils';
import { storeChainIdentifier } from '../../../services/redux/connectionParametersSlice';
import { loadStorageAddressInfo } from './../../../services/utils/utils';

const DashboardPassword = () => { 
  const [walletPassword, setWalletPassword] = useState("");
  const navigate = useNavigate();

  const [walletNames, setWalletNames] = useState([]);
  const [unlockStatusLabel, setUnlockStatusLabel] = useState("Unlock");
  const [selectedWallet, setSelectedWallet] = useState(walletNames[0] || ""); 
  const connectionParameters = useSelector(state => state.connectionParameters);
  const final3Dobject = useRef({});
  const integrationFlowState = useSelector(state => state.integrationFlow);
  const dispatch = useDispatch();
  const { register, control, handleSubmit, formState: { errors }, setValue } = useForm();

  const onFormSubmit = (data) => {
    unlockWallet(walletPassword, selectedWallet);
  };

useEffect(() => {
  dispatch(resetWalletState());

  if(!localStorage.getItem("currentNodeUrl")){
    navigate("/initial-node-selection");
    return;
  }

  const fetchData = async() => {
    const loadedWallets = loadStorageWalletNames();
    if(loadedWallets){
      setWalletNames(loadedWallets);

      try{
        const credentials = await getCredentialsFromBackgroundScript();
        setSelectedWallet(credentials.name);
        unlockWallet(credentials.password, credentials.name)
      }
      catch(err){
        if(loadedWallets.length === 1){
          setSelectedWallet(loadedWallets[0] || "");
        }
      }
    }
  }
  fetchData();
  
  setTimeout(() => {
    if(document.getElementById('moving-scene')){
      renderMovingBall()
    }  
  }, 10);
}, []);

const getCredentialsFromBackgroundScript = () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      message: "internal.getCredentialsFromBackgroundScript", 
    },(credentials)=>{
      if(credentials !== false){
        resolve(credentials);
      }else{
        reject(false);
      }
    });
  })

}

const storeCredentialsToBackgroundScript = (pass, name) => {
  chrome.runtime.sendMessage({
    message: "internal.storeCredentialsToBackgroundScript", 
    data: {
      name: name,
      password: pass,
    }
  });
}

const onSelectWallet = (index, value) => {
  setSelectedWallet(value);
}

const getAddressFromDecrypted = async(decrypted, addressIndex) => {
  const currentKeyPair = decrypted.getKeyPair(addressIndex);
  const addr = (await currentKeyPair.getAddress()).toString();
  return addr;
}

const sendChangeAddressEvent = async (newAddress) => {
  chrome.runtime.sendMessage({
    message: "znn.addressChanged", 
    data: {newAddress: newAddress}
  });
} 

const unlockWallet = async (pass, name)=>{
  const _keyManager = new KeyStoreManager();
  setUnlockStatusLabel("Unlocking in progress ...");

  try{
    const decrypted = await _keyManager.readKeyStore(pass, name);

    if(decrypted){
      dispatch(storeWalletName(name));
      dispatch(storeWalletPassword(pass));
      
      const zenon = Zenon.getSingleton();

      const currentNodeUrl = localStorage.getItem("currentNodeUrl") || connectionParameters.nodeUrl;
      localStorage.setItem("currentNodeUrl", currentNodeUrl);

      await zenon.initialize(currentNodeUrl);
      dispatch(storeNodeUrl(currentNodeUrl));
      dispatch(storeChainIdentifier(Zenon.getChainIdentifier()));
      dispatch(loadAddressInfoForWalletFromStorage(name));

      setUnlockStatusLabel("Unlocked !");
      storeCredentialsToBackgroundScript(pass, name);
    
      if(integrationFlowState.currentIntegrationFlow !== ""){
        navigate("/site-integration");
      }
      else{
        const addressInfo = loadStorageAddressInfo(name);
        console.log("addressInfo", addressInfo);
  
        sendChangeAddressEvent(await getAddressFromDecrypted(decrypted, addressInfo.selectedAddressIndex));
  
        navigate("/tabs");
      }
  
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

const renderMovingBall = function(){
  const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / 100, 0.1, 2000 );
  camera.position.z = 1;
  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(0.45, 32, 16);
  const lgt = new THREE.PointLight()
  lgt.position.set(0, 0, 0);
  lgt.intensity = 0.8;
  scene.add(lgt)

  const color = 0xFFFFFF;
  const intensity = 0.4;
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.position.set(0, 1.5, 0);
  light.target.position.set(-4, 0, -4);
  scene.add(light);
  scene.add(light.target);

  let textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load(require('./../../../assets/cyber-eye-equirectangular.png'));
  const mat = new THREE.MeshToonMaterial({map: map});
  geometry.rotateY(4.71);
  const mesh = new THREE.Mesh(geometry, mat);

  final3Dobject.current = mesh;
  scene.add( mesh );

  const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setSize( window.innerWidth, '100' );
  renderer.setAnimationLoop( animation );

  document.getElementById('moving-scene').appendChild( renderer.domElement );
  
  function animation( time ) {
    // mesh.rotation.x = time / 2000;
    // mesh.rotation.y = time / 1000;
    renderer.render( scene, camera );
  }

  window.addEventListener('mousemove', function(e){
    const mouse3D = new THREE.Vector3(
        ( e.clientX / window.innerWidth ) * 1.5 - 0.75, // subtract for looking more to left
        - ( e.clientY / window.innerHeight ) * 1.5 + 0.33, // subtract for looking more down
        1.2 );

      final3Dobject.current.lookAt(mouse3D);
  })  
}

  return (
    <div className='black-bg'>
      <MenuHeader changeNodeButton={true} />
        <div className="d-flex w-100 justify-content-center">
          <div className="mt-2" id="moving-scene" style={{height: '100px'}}>
          </div>
        </div>
        <div className='ml-2 mr-2'>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <h2 className='mt-2'>Enter your password</h2>
            <div className='mt-5'>
              <div className='custom-control'>  
                <ControlledDropdown dropdownComponent = 'CustomDropdown'
                  {...register("selectedWalletField", { required: true })} control={control} 
                  name="selectedWalletField" 
                  options={walletNames} 
                  onChange={onSelectWallet} 
                  value={selectedWallet} 
                  placeholder="Select wallet"
                  className={`${errors.selectedWalletField?'custom-label-error':''}`} />

                <div className={`input-error ${errors.selectedWalletField?.type === 'required'?'':'invisible'}`}>
                  Wallet is required
                </div> 
              </div>  

              <div className='custom-control'> 
                <input name="passwordField" {...register("passwordField", { required: true })} 
                  className={`w-100 custom-label ${errors.passwordField?'custom-label-error':''}`} 
                  placeholder="Type your password"  value={walletPassword} onChange={(e) => {setWalletPassword(e.target.value); setValue('passwordField', e.target.value, {shouldValidate: true})}} type='password'></input>
                
                <div className={`input-error ${errors.passwordField?.type === 'required'?'':'invisible'}`}>
                  Password is required
                </div> 
              </div>
            </div>
            

            <input value={unlockStatusLabel} type="submit" name="submitButton" className='button primary w-100 text-white'></input>
          </form>
          {
            <div className='mt-5 mb-5 text-center text-gray'>
              <b>Or <span onClick={()=>navigate('/auth')} className="text-primary cursor-pointer">create new wallet</span></b>
            </div>
          }
        </div>
    </div>
  );
};

export default DashboardPassword;

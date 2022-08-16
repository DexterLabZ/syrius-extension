import React, { useState, useEffect } from 'react';
import DashboardPassword from '../../pages/dashboard/dashboard-password/dashboard-password';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  KeyStoreManager,
} from 'znn-ts-sdk';
import TabsLayout from '../tabsLayout/tabsLayout';
import AuthLayout from '../authLayout/authLayout';
import { useDispatch } from 'react-redux';
import { resetIntegrationFlow, setCurrentIntegrationFlow, storeAccountBlockData, storeTransactionData } from '../../services/redux/integrationSlice';
import SiteIntegrationLayout from '../siteIntegrationLayout/siteIntegrationLayout';
import Lottie from 'react-lottie-player';
import * as splashAnimation from './../../assets/lottie/intro-mobile.json'
import { ModalProvider } from '../../services/hooks/modal/modalContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpinnerProvider } from '../../services/hooks/spinner/spinnerContext';
import { SilentSpinnerProvider } from '../../services/hooks/silent-spinner/silentSpinnerContext';
import InitialNodeSelection from '../../pages/settings/change-node/initial-node-selection';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();  
  const dispatch = useDispatch();
  const [animationSettings, setAnimationSettings] = useState({
    loop: false,
    autoPlay: true, 
    animationData: splashAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });
  const [isAnimationStopped, setIsAnimationStopped] = useState(false);
  
  useEffect(() => {
    if(isAnimationStopped){
      const _keyManager = new KeyStoreManager();
      const addresses = _keyManager.listAllKeyStores();
  
      dispatch(resetIntegrationFlow());
      if(window.znn && window.znn.currentIntegrationFlow ){
        dispatch(setCurrentIntegrationFlow(window.znn.currentIntegrationFlow));
        if(window.znn.currentIntegrationFlow === "transactionSigning"){
          dispatch(storeTransactionData(window.znn.transactionData));
        }
        if(window.znn.currentIntegrationFlow === "accountBlockSending"){
          dispatch(storeAccountBlockData(window.znn.accountBlockData));
        }
      }
      
      if (Object.keys(addresses).length > 0) {
        for (const key in addresses) {
          if (addresses.hasOwnProperty(key)) {
          }
        }
        if(location !== "/tabs"){
          navigate("/password");
        }
      }
      else{
        if(location !== "/auth"){
          navigate("/auth");
        }
      }
    }
  }, [isAnimationStopped]);


  return (
    <div className="main-layout">
      { !isAnimationStopped && 
        <Lottie 
          {...animationSettings}
          play={!isAnimationStopped}
          onComplete={() => setIsAnimationStopped(true)}
        />
    }
      {
        isAnimationStopped && 
        <>
          <ModalProvider>
            <SpinnerProvider>
              <SilentSpinnerProvider>
                <Routes>
                  <Route path="auth/*" element={<AuthLayout/>} />
                  <Route path="password" element={<DashboardPassword/>}/>
                  <Route path="initial-node-selection" element={<InitialNodeSelection/>}/>
                  <Route path="tabs/*" element={<TabsLayout/>}/>
                  <Route path="site-integration" element={<SiteIntegrationLayout/>}/>
                </Routes>
              </SilentSpinnerProvider>
            </SpinnerProvider>
          </ModalProvider>
          <ToastContainer />
          <div id="modal-root"></div>
          <div id="spinner-root"></div>
        </>
      }

    </div>
  );
};

export default MainLayout;

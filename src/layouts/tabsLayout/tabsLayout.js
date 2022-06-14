import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Dashboard from '../../pages/dashboard/dashboard/dashboard';
import MenuTabs from '../../pages/menu/menu-tabs/menu-tabs';
import Delegate from '../../pages/delegate/delegate';
import Plasma from '../../pages/plasma/plasma';
import Stake from '../../pages/staking/stake/stake';
import Send from '../../pages/send-receive/send/send';
import Receive from '../../pages/send-receive/receive/receive';

import {AnimatePresence} from 'framer-motion';
import MenuHeader from '../../pages/menu/menu-header/menu-header';
import Settings from '../../pages/settings/settings/settings';
import ChangeNode from '../../pages/settings/change-node/change-node';
import ExportMnemonic from '../../pages/settings/export-mnemonic/export-mnemonic';

const TabsLayout = () => {
  const location = useLocation();
  const pagesWithBackButton = [
    "send",
    "receive",
    "settings"
  ]
  
  return (
    <div>
      <MenuHeader backButton={pagesWithBackButton.some(page=>location.pathname.includes(page))} />
      <div className='menu-layout'>
        <AnimatePresence>
          <Routes location={location} key={location.pathname}>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="dashboard/send" element={<Send/>}/>
            <Route path="dashboard/receive" element={<Receive/>}/>
            
            <Route path="delegate" element={<Delegate/>}/>
            <Route path="plasma" element={<Plasma/>}/>
            <Route path="stake" element={<Stake/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="settings/change-password" element={<ChangeNode/>}/>
            <Route path="settings/export-mnemonic" element={<ExportMnemonic/>}/>
            <Route path="settings/change-node" element={<ChangeNode/>}/>
          </Routes>
        </AnimatePresence>
        <MenuTabs />
      </div>
    </div>
  );
};

export default TabsLayout;

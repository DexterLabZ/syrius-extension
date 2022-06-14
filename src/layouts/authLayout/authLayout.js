import React from 'react';

import {  Navigate, Route, Routes } from 'react-router-dom';
import GetStarted from '../../pages/get-started/get-started';
import Recovery from '../../pages/import-recovery/recovery';
import Onboarding from '../../pages/onboarding/onboarding';

const AuthLayout = () => {

  return (
    <div>
      <Routes>
        <Route path="" element={<Navigate to="onboarding" replace />} />
        <Route path="onboarding" element={<Onboarding/>}/>
        <Route path="get-started" element={<GetStarted/>}/>
        <Route path="recovery" element={<Recovery/>}/>
      </Routes>
    </div>
  );
};

export default AuthLayout;

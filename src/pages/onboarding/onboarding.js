import React from 'react';
import { Link, useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className='black-bg onboarding-layout'>
      <img alt="" className='mt-4' src={require('./../../assets/logo_sm.png')} width='60px'></img>
      <p className='mt-4'>Network of Momentum</p>
      <p>The self-evolving network empowering anyone through true decentralization</p>
      <div className='mt-5 pr-4 pl-4'>
        <Link to="/auth/get-started" className='button primary'>Create account</Link>
        <p></p>
        <Link to="/auth/recovery" className='button secondary'>Import recovery phrase</Link>
      </div>
      <div className='mt-5 mb-3 text-center text-gray'>
        <b>Or <span onClick={()=>navigate('/password')} className="text-primary cursor-pointer">already have wallet</span></b>
      </div>
  </div>
  );
};

export default Onboarding;

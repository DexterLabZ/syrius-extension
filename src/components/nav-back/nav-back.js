import React from 'react';
import {
  useNavigate,
} from "react-router-dom";

const NavBack = () => {
  const navigate = useNavigate();

  return (
    <img alt="" onClick={() => navigate(-1)} className='header-button' src={require('./../../assets/simple-back.svg')} width='20px'></img>
  );
};

export default NavBack;

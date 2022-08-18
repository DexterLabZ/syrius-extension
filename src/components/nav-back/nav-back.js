import React from 'react';
import {
  useNavigate,
} from "react-router-dom";

const NavBack = ({beforeLeave = ()=>{}}) => {
  const navigate = useNavigate();

  const goBack = async () => {
    await beforeLeave();
    navigate(-1);
  }

  return (
    <img alt="" onClick={() => goBack()} className='header-button' src={require('./../../assets/simple-back.svg')} width='20px'></img>
  );
};

export default NavBack;

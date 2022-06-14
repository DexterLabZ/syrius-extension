import React, { useState } from 'react';
import { useLocation  } from 'react-router-dom';
import BurgerIcon from '../../../animated-icons/burger-icon/burger-icon';
import BurgerPopover from '../../../components/burger-popover/burger-popover';
import NavBack from '../../../components/nav-back/nav-back';

const MenuHeader = ({backButton = false}) => {
  const [burgerIsOpen, setBurgerIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setBurgerIsOpen((isClicked)=>!isClicked);
  }

  return (
    <div className='menu-header text-white'>
      {backButton && 
        <div className='back-button-container mt-1 ml-1'>
          <NavBack/>
        </div>    
      }
      <div id="pow-spinner-root" className='tooltip'></div>
      <h2 className=''>ZNN</h2>
      {
        (location.pathname !== "/password") && 
        <div onClick={()=>{toggleMenu()}} className={`menu-button-container animate-on-hover ${burgerIsOpen?'burger-opened':''}`}>
          <div className='menu-button'>
            <BurgerIcon></BurgerIcon>
            {
              <BurgerPopover></BurgerPopover>
            }
          </div>
        </div>
      }
    </div>
  );
};

export default MenuHeader;

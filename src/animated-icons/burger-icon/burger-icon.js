import React from 'react';
import './burger-icon.scss';

const BurgerIcon = () => {
  return (
    <div className="burger-icon-container" style={{padding: 0 + 'px'}}>
        <div className="menu-icon-dash" id="top" style={{top: 2 + 'px', left: -1 + 'px'}}></div>
        <div className="menu-icon-dash" id="middle" style={{top: 9 + 'px', left: -1 + 'px'}}></div>
        <div className="menu-icon-dash" id="bottom" style={{top: 16 + 'px', left: -1 + 'px'}}></div>
    </div>
  );
};

export default BurgerIcon;

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const MenuTabs =  () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [indicatorPercentage, setIndicatorPercentage] = useState(0);
  const navigate = useNavigate();

  const moveIndicator = (newTab, percentage) => {
    setIndicatorPercentage(percentage);
    setCurrentTab(newTab);
    
    setTimeout(()=>{
      navigate(newTab);
    }, 300);
  }

  return (
    <div className='tab-menu'>
      <div className='active-tab-container'>
        <div style={{left: indicatorPercentage+"%"}} className='active-tab-indicator'></div>
      </div>
      <div className='d-flex justify-content-around w-100'>
        <div className={`tab-item ${currentTab === 'dashboard'? 'active' : ''}`} 
         onClick={() => moveIndicator('dashboard', 0)}>
          <img alt="" className="tab-item-icon" src={require('./../../../assets/logo.svg')} width='20px'></img>
          <span className="tab-item-text">Dashboard</span>
        </div>
        <div className={`tab-item ${currentTab === 'delegate'? 'active' : ''}`} 
         onClick={() => moveIndicator('delegate', 25)}>
          <img alt="" className="tab-item-icon" src={require('./../../../assets/pillar.svg')} width='20px'></img>
          <span className="tab-item-text">Delegate</span>
        </div>
        <div className={`tab-item ${currentTab === 'plasma'? 'active' : ''}`} 
         onClick={() => moveIndicator('plasma', 50)}>
          <img alt="" className="tab-item-icon" src={require('./../../../assets/lightning.svg')} width='20px'></img>
          <span className="tab-item-text">Plasma</span>
        </div>
        <div className={`tab-item ${currentTab === 'stake'? 'active' : ''}`} 
         onClick={() => moveIndicator('stake', 75)}>
          <img alt="" className="tab-item-icon" src={require('./../../../assets/blocks.svg')} width='20px'></img>
          <span className="tab-item-text">Stake</span>
        </div>
      </div>
    </div>
  );
};

export default MenuTabs;

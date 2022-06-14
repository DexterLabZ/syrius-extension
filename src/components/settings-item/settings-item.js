import React from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsItem = ({icon, title, description, url}) => {
  const navigate = useNavigate();

  const goToUrl = (url) => {
    navigate(url);
  }
  
  return (
    <div onClick={() => goToUrl(url)} className='settings-item mt-2'>
      <div className="settings-item-icon mr-2">
        <img alt="" className='' src={require(`./../../assets/${icon || "default-icon-green"}.svg`)}></img>

      </div>
      <div className='settings-item-data mr-2'>
        <div className="text-white text-left text-bold">{title}</div>
        <div className='text-gray text-left text-xs'>
          {description}
        </div>
      </div>
    </div>
  );
};

export default SettingsItem;

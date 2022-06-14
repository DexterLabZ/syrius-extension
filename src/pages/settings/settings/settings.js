import React,  { useEffect } from 'react';
import SettingsItem from '../../../components/settings-item/settings-item';

const Settings = () => {
  const settingsItems = [
    // ToDo: Add change password functionality (TS SDK + Extension)
    // {
    //   icon: "change-password",
    //   title: "Change password",
    //   description: "You can change your wallet password here",
    //   url: "change-password",
    // },
    {
      icon: "view-mnemonic",
      title: "View backup phrase",
      description: "You can see your backup phrase (mnemonic) here",
      url: "export-mnemonic",
    },
    {
      icon: "change-network",
      title: "Node management",
      description: "You can change your current node url here",
      url: "change-node",
    }
  ]
  useEffect(() => {
  }, []);

  return (
    <div className='black-bg'>
      <h1 className='mt-1'>Settings</h1>
      
      <div className='mt-2 ml-2 mr-2'>
        {
          settingsItems.map((item, index)=>{
            return <SettingsItem key={"settings-item-"+index} icon={item.icon} title={item.title} description={item.description} url={item.url}></SettingsItem>
          })
        }

      </div>
  </div>
  );
};

export default Settings;

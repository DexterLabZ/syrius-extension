import React from 'react';

const ChangeChainIdItem = ({isSelected, onSelect, onRemove, chainId}) => {

  const changeTo = (chainId) => {
    onSelect(chainId);
  }
  
  const removeChainId = (chainId) => {
    onRemove(chainId);
  }

  return (
    <div onClick={() => changeTo(chainId)} className='change-chainId mt-2'>
      <div className="change-chainId-icon mr-2">
        {
          isSelected===true 
          ? <img alt="" className='' src={require(`./../../assets/radio-checked.svg`)}></img>
          : <img alt="" className='' src={require(`./../../assets/radio-unchecked.svg`)}></img>
        }
      </div>
      <div className='change-chainId-data mr-2'>
        <div className="text-white text-left text-bold text-sm">
          {chainId}
        </div>
      </div>
      <img alt="" className='close-icon' onClick={(e) => {removeChainId(chainId); e.stopPropagation()}} src={require(`./../../assets/close-icon.svg`)}></img>
    </div>
  );
};

export default ChangeChainIdItem;

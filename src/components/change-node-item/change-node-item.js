import React from 'react';

const ChangeNodeItem = ({isSelected, onSelect, onRemove, url}) => {

  const changeTo = (url) => {
    onSelect(url);
  }
  
  const removeNode = (url) => {
    onRemove(url);
  }

  return (
    <div onClick={() => changeTo(url)} className='change-node mt-2 tooltip'>
      <div className="change-node-icon mr-2">
        {
          isSelected===true 
          ? <img alt="" className='' src={require(`./../../assets/radio-checked.svg`)}></img>
          : <img alt="" className='' src={require(`./../../assets/radio-unchecked.svg`)}></img>
        }
      </div>
      <div className='change-node-data mr-2'>
        <div className="text-white text-left text-bold text-sm">
          {url}
        </div>
        <span className='tooltip-text mt-3'>{url}</span>
      </div>
      <img alt="" className='close-icon' onClick={(e) => {removeNode(url); e.stopPropagation()}} src={require(`./../../assets/close-icon.svg`)}></img>
    </div>
  );
};

export default ChangeNodeItem;

import React from 'react';

const ChangeAddressItem = ({isSelected, onSelect, address, index}) => {

  const changeTo = (index) => {
    onSelect(index);
  }
  

  return (
    <div onClick={() => changeTo(index)} className='change-node mt-2 tooltip'>
      <div className="change-node-icon mr-2">
        {
          isSelected===true 
          ? <img alt="" className='' src={require(`./../../assets/radio-checked.svg`)}></img>
          : <img alt="" className='' src={require(`./../../assets/radio-unchecked.svg`)}></img>
        }
      </div>
      <div className='change-node-data mr-2'>
        <div className="text-white text-left text-bold text-sm">
          <span className='text-overflow-ellipsis'>{address}</span>
          <span className="tooltip-text text-sm mt-2">{address}</span>
        </div>
      </div>
    </div>
  );
};

export default ChangeAddressItem;

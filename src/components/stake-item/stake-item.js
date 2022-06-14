import React from 'react';

const StakeItem = ({id, amount, period, expiration, cancelStake}) => {
  return (
    <div className='transaction mt-2 d-flex justify-content-between'>
      <div className='mr-2 align-items-start text-left'>        
        {"Staked " + amount + " ZNN"}
        <div className='text-gray text-xs'>For: {period} Month{period>1?'s':''}</div>

      </div>

      {
        expiration > 0 && 
      <div className='text-right align-items-end'>
        Expiring in 
        <div className='text-gray text-xs'>{expiration.toFixed(2)} h</div>
      </div>
      }

      {
        expiration <= 0 && 
        <img alt="" onClick={()=>cancelStake(id)} src={require('./../../assets/close.svg')} className='close-icon'/>
      }

    </div>
  );
};

export default StakeItem;

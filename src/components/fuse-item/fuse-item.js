import React from 'react';

const FuseItem = ({id, amount, beneficiary, expiration, cancelFuse}) => {
  return (
    <div className='transaction mt-2 d-flex justify-content-between'>
      <div className='mr-2 align-items-start text-left w-100'>
        {"Fused " + amount + " QSR"}
        <div className='text-gray text-xs tooltip w-100'>
          For: {beneficiary.slice(0, 3) + '...' + beneficiary.slice(-3)}
          <span className="tooltip-text text-md">{beneficiary}</span>
        </div>
      </div>

      {
        expiration > 0 && 
      <div className='text-right align-items-end'>
        <div className='white-space-nowrap'>Expiring in</div>
        <div className='text-gray text-xs'>{expiration.toFixed(2)} h</div>
      </div>
      }

      {
        expiration <= 0 && 
        <img alt="" onClick={()=>cancelFuse(id)} src={require('./../../assets/close.svg')} className='close-icon'/>
      }

    </div>
  );
};

export default FuseItem;

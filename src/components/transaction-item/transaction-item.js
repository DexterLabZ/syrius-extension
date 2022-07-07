import React from 'react';

const TransactionItem = ({type, amount, tokenSymbol, address, displayFullAddress=false}) => {
  return (
    <div className='transaction mt-2'>
      <div className="transaction-icon mr-2">
        {
          tokenSymbol==='ZNN' ?
            <>
              {type==="received" && 
                <img alt="" className='' src={require('./../../assets/send-left-green.svg')} width='20px'></img>
              }
              {(type==="sent" || type==="send") && 
                <img alt="" className='' src={require('./../../assets/send-right-green.svg')} width='20px'></img>
              }
              {(type==="staked") && 
                <img alt="" className='' src={require('./../../assets/blocks.svg')} width='18px'></img>
              }
              {(type==="delegated") && 
                <img alt="" className='' src={require('./../../assets/pillar.svg')} width='18px'></img>
              }
              {(type==="fused") && 
                <img alt="" className='' src={require('./../../assets/lightning.svg')} width='18px'></img>
              }
            </>
          :
            <>
              {type==="received" && 
                <img alt="" className='' src={require('./../../assets/send-left-blue.svg')} width='20px'></img>
              }
              {(type==="sent" || type==="send") && 
                <img alt="" className='' src={require('./../../assets/send-right-blue.svg')} width='20px'></img>
              }
              {(type==="staked") && 
                <img alt="" className='' src={require('./../../assets/blocks.svg')} width='18px'></img>
              }
              {(type==="delegated") && 
                <img alt="" className='' src={require('./../../assets/pillar.svg')} width='18px'></img>
              }
              {(type==="fused") && 
                <img alt="" className='' src={require('./../../assets/lightning.svg')} width='18px'></img>
              }
            </>
        }

      </div>
      <div className='transaction-data mr-2'>
        {
          type[0]?.toUpperCase()+type.slice(1, type.length)+" "
        }

        {amount} {tokenSymbol}
        <div className='text-gray text-left text-xs tooltip'>
          {
            type==="received" ?
              <>
                {"From "}
              </>
            :
            <>
              {"To "}
            </>
          }
          {
            displayFullAddress?
            <div className='text-xs'>{address}</div>:
            <>
              {address.slice(0, 3) + '...' + address.slice(-3)}
              <span className="tooltip-text text-md ml-5">{address}</span>
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;

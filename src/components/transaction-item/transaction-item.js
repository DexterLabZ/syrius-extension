import React from 'react';
import { toast } from 'react-toastify';
import ExternalLinkIcon from '../../animated-icons/external-link/external-link';

const TransactionItem = ({type, amount, tokenSymbol, address, hash, displayFullAddress=false}) => {
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
      <div className='transaction-data'>
        <div className='d-flex justify-content-between mr-2 transaction-data text-left'>
          <div className='d-flex' style={{gap: '0.3rem'}}>
            <span className=''>
              {
                type[0]?.toUpperCase()+type.slice(1, type.length)+" "
              }
            </span>
            <span className='tooltip'>
              {amount?.toFixed(0)}
              <span className="tooltip-text text-xs mt-5">{amount}</span>
            </span> 
            <span>
              {tokenSymbol}
            </span>
          </div>
          <div className='text-gray text-left text-xs tooltip cursor-pointer' onClick={() => {try{navigator.clipboard.writeText(address); toast(`Address copied`, {
            position: "bottom-center",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            newestOnTop: true,
            type: 'success',
            theme: 'dark'
          })}catch(err){console.error(err)} }}>
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
                <span className="tooltip-text text-md ml-5 mt-5">{address}</span>
              </>
            }
            <img alt="" className='ml-1' src={require('./../../assets/copy-icon.png')} width='8px'></img>
          </div>
        </div>

      </div>
        <a href={'https://explorer.zenon.network/transaction/' + hash} target="_blank" rel="noreferrer">
          <div className='tooltip'>
            <div className='squared-button animate-on-hover'>
              <ExternalLinkIcon></ExternalLinkIcon>
              <span className='tooltip-text transaction-explorer-button-tooltip'>Open transaction in explorer</span>
            </div>
          </div>
        </a>
    </div>
  );
};

export default TransactionItem;

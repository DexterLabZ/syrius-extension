import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyStoreManager, Zenon, Primitives, Constants } from 'znn-ts-sdk';
import TokenDropdown from '../../../components/token-dropdown/token-dropdown';
import TransactionItem from '../../../components/transaction-item/transaction-item';
import fallbackValues from '../../../services/utils/fallbackValues';
import { receiveAllBlocks } from '../../../services/utils/utils';
import { motion } from 'framer-motion';
import animationVariants from '../../../layouts/tabsLayout/animationVariants';
import { useSelector } from 'react-redux';
import { SilentSpinnerContext } from '../../../services/hooks/silent-spinner/silentSpinnerContext'
import { toast } from 'react-toastify';

const Dashboard = () => {
  const availableTokens = Object.keys(fallbackValues.availableTokens);
  const navigate = useNavigate();
  const [address, setAddress] = useState(""); 
  const [tokenColor, setTokenColor] = useState("green"); 
  let [transactions, setTransactions] = useState([]); 
  const [selectedToken, setSelectedToken] = useState(availableTokens[0]); 
  const [walletInfo, setWalletInfo] = useState({
    balanceInfoList: fallbackValues.availableTokens
  }); 
  const transactionsCount = useRef(0); 
  const currentTransactionsPage = useRef(0); 
  const myAddressObject = useRef({}); 
  const [shouldLoadMore, setShouldLoadMore] = useState(true); 
  const [noTransactionsLabel, setNoTransactionsLabel] = useState(false); 
  const transactionsObserver = useRef({}); 
  const zenon = Zenon.getSingleton(); 
  const pageSize = 200;
  const walletCredentials = useSelector(state => state.wallet);
  const { handleSilentSpinner } = useContext(SilentSpinnerContext);

  useEffect(() => {
  const loadMoreTransactionsTrigger = document.getElementById("loadMoreTransactionsTrigger");
    const fetchData = async() => {
      await getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);
      transactionsObserver.current = (new IntersectionObserver(loadTransactions, {
        root: null,
        rootMargin: `0px 0px 0px 0px`,
        threshold: 1.0
      }));
      transactionsObserver.current.observe(loadMoreTransactionsTrigger);
    }
    fetchData();
  
    return ()=>{
      transactionsObserver.current.unobserve(loadMoreTransactionsTrigger);
    }
  }, []);

  const getWalletInfo = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    const showSilentSpinner = handleSilentSpinner(
      <>
        <div className='text-bold'>
          Receiving transactions ...
        </div>
      </>
    );
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);

      if(decrypted){
        const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
        const addr = (await currentKeyPair.getAddress()).toString();
        myAddressObject.current = Primitives.Address.parse(addr);
        setAddress(addr); 
        let getAccountInfoByAddress = await zenon.ledger.getAccountInfoByAddress(myAddressObject.current);

        if(Object.keys(getAccountInfoByAddress.balanceInfoList).length) {
          getAccountInfoByAddress.balanceInfoList = {...walletInfo.balanceInfoList, ...getAccountInfoByAddress.balanceInfoList}
          setWalletInfo(getAccountInfoByAddress);
        }

        showSilentSpinner(true);
        await receiveAllBlocks(zenon, currentKeyPair).then(()=>{
          showSilentSpinner(false);
        });
      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      showSilentSpinner(false);
      console.error("Error ", err);
    }
  }

  const loadTransactions = async() =>{
    try{
      if(shouldLoadMore){
        const getBlocksByPage = await zenon.ledger.getBlocksByPage(myAddressObject.current, currentTransactionsPage.current, pageSize);         
          if(getBlocksByPage.list.length > 0){
            transactionsCount.current += getBlocksByPage.list.length;
            let newTransactions = getBlocksByPage.list;
            newTransactions = await Promise.all(newTransactions.map(async (transaction) => {
              return await transformTransactionItem(transaction);
            }));          

            setTransactions(prevTransactions => {
              transactions = [...prevTransactions, ...newTransactions];
              return transactions
            });
            currentTransactionsPage.current = currentTransactionsPage.current + 1;
          if(getBlocksByPage.count >= transactionsCount){
            setShouldLoadMore(true);
          }else{
            setShouldLoadMore(false);
          }
        }
        else{
          setShouldLoadMore(false);
          if(transactionsCount === 0){
            setNoTransactionsLabel(true);
          }
        }
      }
    }
    catch(err){
      console.error(err);
      let readableError = err;
      if(err.message) {
        readableError = err.message;
      }
      readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];

      toast(readableError + "",{    
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        newestOnTop: true,
        type: 'error',
        theme: 'dark'
      });
    }
  }

  const transformTransactionItem = async (transactionItem) =>{
    if(transactionItem.blockType===3){
      transactionItem = await getReferencedTransaction(transactionItem)
    }
    
    const transformedTransaction = {
      type: identifyTransactionType(transactionItem),
      amount: transactionItem.amount / Math.pow(10, transactionItem.token?.decimals || fallbackValues.availableTokens[transactionItem.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals),
      tokenSymbol: transactionItem.token?.symbol || fallbackValues.availableTokens[transactionItem.tokenStandard?.toString()]?.token.symbol || "?",
      address: transactionItem.toAddress.toString(),
      hash: transactionItem.hash.toString()
    }

    switch(transformedTransaction.type){
      case 'delegated':{
          transformedTransaction.amount = null;
          transformedTransaction.tokenSymbol = null;
        break;
      }
      default:{}
    }

    return transformedTransaction;
  }

  const identifyTransactionType = (transactionItem) =>{
    if(transactionItem.toAddress.toString() === myAddressObject.current.toString()){
      return 'received';
    }else if(transactionItem.toAddress.toString() === Constants.plasmaAddress.toString()){
      return 'fused';
    }else if(transactionItem.toAddress.toString() === Constants.pillarAddress.toString()){
      return 'delegated';
    }else if(transactionItem.toAddress.toString() === Constants.stakeAddress.toString()){
      return 'staked';
    }
    else{
      return 'sent';
    }
  }

  const getReferencedTransaction = async (transactionItem)=>{
    return zenon.ledger.getBlockByHash(transactionItem.fromBlockHash);
  }

  const goToSend = () => {
    navigate('send', {
      state: {
        currentSelectedToken: selectedToken,
      }
    });
  }

  const switchToken = () =>{
    setSelectedToken(availableTokens[(availableTokens.indexOf(selectedToken)+1)%(availableTokens.length)]);
    if(tokenColor === 'green'){
      setTokenColor('blue');
    }else{
      setTokenColor('green');
    }
  }
  
  const selectToken = (index, value) => {
    setSelectedToken(value.token.tokenStandard);
    if(value.token.symbol === 'ZNN'){
      setTokenColor('green');
    }else{
      setTokenColor('blue');
    }
  }
  
  return (
    <motion.div 
      className='black-bg transition-animated'
      initial={"pageTransitionInitial"}
      animate={"pageTransitionAnimate"}
      exit={"pageTransitionExit"}
      variants={animationVariants}>

      <div className='mt-2 ml-2 mr-2 d-flex justify-content-center'>
        <div className={`wallet-circle circle-${tokenColor}`}>
          <h2 className='mb-0 tooltip'>
            {parseFloat(walletInfo.balanceInfoList[selectedToken].balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken].token.decimals)).toFixed(0)}
            <span className='tooltip-text mt-2'>{parseFloat(walletInfo.balanceInfoList[selectedToken].balance/Math.pow(10, walletInfo.balanceInfoList[selectedToken].token.decimals)).toFixed(3)}</span>
          </h2>
          <h4 className='mb-0 mt-1 text-gray'>{walletInfo.balanceInfoList[selectedToken].token.symbol}</h4>
          <h4 className='m-0 text-gray tooltip'>
            {address.slice(0, 3) + '...' + address.slice(-3)}
            <span className='tooltip-text'>{address}</span>
          </h4>
          <img alt="" onClick={()=>{switchToken()}} className='mt-1 p-2 button' src={require(`./../../../assets/switch-${tokenColor}.svg`)} width='16px'></img>
        </div>  
      </div>
      
      <div className='mt-2 ml-2 mr-2 d-flex justify-content-center'>
        <TokenDropdown options={Object.keys(walletInfo.balanceInfoList).map((value)=>{return walletInfo.balanceInfoList[value]})} tokenSymbolPath={`token.symbol`} onChange={selectToken} value={selectedToken} placeholder="Select token" />
      </div>

      <div className='mt-2 ml-2 mr-2 d-flex'>
        <div onClick={goToSend} className='button secondary w-100 mr-2 d-flex justify-content-center'>
          Send
          <img alt="" className='ml-1' src={require('./../../../assets/send-right-green.svg')} width='20px'></img>
        </div>
        <Link to="receive" className='button secondary w-100 d-flex justify-content-center'>
          Receive
          <img alt="" className='ml-1' src={require('./../../../assets/send-left-green.svg')} width='20px'></img>
        </Link>
      </div>
      <div className='transactions mt-2 ml-2 mr-2'>
        {
          transactions.map((transaction, i) => {
            return <TransactionItem  key={"transaction-"+i} type={transaction.type} amount={transaction.amount} tokenSymbol={transaction.tokenSymbol} address={transaction.address} hash={transaction.hash}></TransactionItem>
          })
        }
      </div>

      {(shouldLoadMore || noTransactionsLabel) && 
        <div className='mt-2 center-items'>
          <span className='text-gray ml-1'>{
            noTransactionsLabel?'No transactions':<span id="loadMoreTransactionsTrigger">Loading...</span>
          }</span>
        </div>
      }
  </motion.div>
  );
};

export default Dashboard
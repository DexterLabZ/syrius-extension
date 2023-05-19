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
import { ethers } from 'ethers';

const Dashboard = () => {
  const availableTokens = Object.keys(fallbackValues.availableTokens);
  const navigate = useNavigate();
  const [address, setAddress] = useState(""); 
  const [tokenColor, setTokenColor] = useState("green"); 
  let [transactions, setTransactions] = useState([]); 
  const [selectedToken, setSelectedToken] = useState(availableTokens[0]); 
  const [walletInfo, setWalletInfo] = useState({
    balanceInfoMap: fallbackValues.availableTokens
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
    showSilentSpinner(true);
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);

      if(decrypted){
        const currentKeyPair = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
        const addr = (await currentKeyPair.getAddress()).toString();
        myAddressObject.current = Primitives.Address.parse(addr);
        setAddress(addr); 

        const updateAccountInfo = async() => {
          let getAccountInfoByAddress = await zenon.ledger.getAccountInfoByAddress(myAddressObject.current);
          console.log("getAccountInfoByAddress", getAccountInfoByAddress);
          if(Object.keys(getAccountInfoByAddress.balanceInfoMap).length) {
            getAccountInfoByAddress.balanceInfoMap = {...walletInfo.balanceInfoMap, ...getAccountInfoByAddress.balanceInfoMap}
            setWalletInfo(getAccountInfoByAddress);
          }
        }
        await updateAccountInfo();

        await receiveAllBlocks(zenon, currentKeyPair);
        // console.log("receiveAllBlocks", )
        await updateAccountInfo();
        showSilentSpinner(false);
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
          console.log("getBlocksByPage - page", currentTransactionsPage.current, getBlocksByPage)
          if(getBlocksByPage.list.length > 0){
            transactionsCount.current += getBlocksByPage.list.length;
            console.log("getBlocksByPage", getBlocksByPage);
            let newTransactions = getBlocksByPage.list;
            newTransactions = await Promise.all(newTransactions.map(async (transaction) => {
              return await transformTransactionItem(transaction.toJson());
            }));          
            console.log("newTransactions", newTransactions);
            setTransactions(prevTransactions => {
              // console.log("prevTransactions", prevTransactions);
              transactions = [...prevTransactions, ...newTransactions];
              // console.log("transactions", transactions);
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
    console.log("transactionItem", transactionItem);
    let transaction;
    if(transactionItem.blockType === 3 || transactionItem.blockType === '3'){
      transaction = await getReferencedTransaction(transactionItem);
      console.log("transaction", transaction);
    }else{
      transaction = transactionItem;
    }
    
    console.log("ethers.utils.formatUnits(ethers.BigNumber.from(transaction.amount.toString() || 0), ethers.BigNumber.from(((transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals).toString() || 8)+''))", ethers.utils.formatUnits(ethers.BigNumber.from(transaction.amount.toString() || 0), ethers.BigNumber.from(((transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals).toString() || 8)+'')));
    console.log("parseFloat(ethers.utils.formatUnits(ethers.BigNumber.from(transaction.amount.toString() || 0), ethers.BigNumber.from(((transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals).toString() || 8)+'')))", parseFloat(ethers.utils.formatUnits(ethers.BigNumber.from(transaction.amount.toString() || 0), ethers.BigNumber.from(((transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals).toString() || 8)+''))));
    const transformedTransaction = {
      type: identifyTransactionType(transaction),
      amount: parseFloat(ethers.utils.formatUnits(ethers.BigNumber.from(transaction.amount.toString() || 0), ethers.BigNumber.from(((transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals).toString() || 8)+''))),
      // amount: transaction.amount / Math.pow(10, transaction.token?.decimals || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.decimals || fallbackValues.decimals),
      tokenSymbol: transaction.token?.symbol || fallbackValues.availableTokens[transaction.tokenStandard?.toString()]?.token.symbol || "?",
      address: transaction.toAddress.toString(),
      hash: transaction.hash.toString()
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
    return (await zenon.ledger.getBlockByHash(transactionItem.fromBlockHash)).toJson();
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
            {/* {parseFloat(walletInfo.balanceInfoMap[selectedToken].balance/Math.pow(10, walletInfo.balanceInfoMap[selectedToken].token.decimals)).toFixed(0)}
            <span className='tooltip-text mt-2'>{parseFloat(walletInfo.balanceInfoMap[selectedToken].balance/Math.pow(10, walletInfo.balanceInfoMap[selectedToken].token.decimals))}</span> */}
          {
            parseFloat(ethers.utils.formatUnits(ethers.BigNumber.from(walletInfo.balanceInfoMap[selectedToken].balance.toString() || 0), ethers.BigNumber.from(((walletInfo.balanceInfoMap[selectedToken].token.decimals || fallbackValues.availableTokens[selectedToken]?.token.decimals || fallbackValues.decimals).toString() || 8)+''))).toFixed(0)
          }
          <span className='tooltip-text mt-2'>{parseFloat(ethers.utils.formatUnits(ethers.BigNumber.from(walletInfo.balanceInfoMap[selectedToken].balance.toString() || 0), ethers.BigNumber.from(((walletInfo.balanceInfoMap[selectedToken].token.decimals || fallbackValues.availableTokens[selectedToken]?.token.decimals || fallbackValues.decimals).toString() || 8)+'')))}</span>

          </h2>
          <h4 className='mb-0 mt-1 text-gray'>{walletInfo.balanceInfoMap[selectedToken].token.symbol}</h4>
          <h4 className='m-0 text-gray tooltip cursor-pointer' onClick={() => {try{navigator.clipboard.writeText(address); toast(`Address copied`, {
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
            {address.slice(0, 3) + '...' + address.slice(-3)}
            <span className='tooltip-text'>{address}</span>
          </h4>
          <img alt="" onClick={()=>{switchToken()}} className='mt-1 p-2 button' src={require(`./../../../assets/switch-${tokenColor}.svg`)} width='16px'></img>
        </div>  
      </div>
      
      <div className='mt-2 ml-2 mr-2 d-flex justify-content-center'>
        <TokenDropdown options={Object.keys(walletInfo.balanceInfoMap).map((value)=>{return walletInfo.balanceInfoMap[value]})} tokenSymbolPath={`token.symbol`} onChange={selectToken} value={selectedToken} placeholder="Select token" />
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
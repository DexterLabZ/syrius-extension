import React, { useEffect, useState, useRef, useContext } from 'react';
import { KeyStoreManager, Zenon, Primitives } from 'znn-ts-sdk';
import fallbackValues from '../../../services/utils/fallbackValues';
import StakeItem from '../../../components/stake-item/stake-item';
import { motion } from 'framer-motion';
import animationVariants from '../../../layouts/tabsLayout/animationVariants';
import { useSelector } from 'react-redux';
import { ModalContext } from '../../../services/hooks/modal/modalContext';
import AlertModal from '../../../components/modals/alert-modal'
import { useForm } from 'react-hook-form';
import ControlledDropdown from '../../../components/custom-dropdown/controlled-dropdown';
import { toast } from 'react-toastify';

const Stake = () => {
  const [address, setAddress] = useState(""); 
  const [znnAmount, setZnnAmount] = useState(0); 
  const [stakeDuration, setStakeDuration] = useState(""); 
  const [stakedZnnAmount, setStakedZnnAmount] = useState(0); 
  const [uncollectedZnnReward, setUncollectedZnnReward] = useState(""); 
  const [toStakeAmount, setToStakeAmount] = useState(""); 
  const [noStakeItemsLabel, setNoStakeItemsLabel] = useState(false); 
  const [shouldLoadMore, setShouldLoadMore] = useState(true); 
  const [stakeLabel, setStakeLabel] = useState("Stake ZNN"); 
  let [stakedItems, setStakedItems] = useState([]); 
  const myAddressObject = useRef({}); 
  const stakeListObserver = useRef({}); 
  const currentKeyPair = useRef({});
  const zenon = Zenon.getSingleton();
  const currentStakePage = useRef(0);
  const availableStakeDurations = fallbackValues.stakingDurations;
  const pageSize = 5;
  const walletCredentials = useSelector(state => state.wallet);
  const { handleModal } = useContext(ModalContext);
  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    const loadMoreStakeItemsTrigger = document.getElementById("loadMoreStakeItemsTrigger");
      const fetchData = async() => {
        await getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);
        stakeListObserver.current = (new IntersectionObserver(loadStakeItems, {
          root: null,
          rootMargin: `0px 0px 0px 0px`,
          threshold: 1.0
        }));
        stakeListObserver.current.observe(loadMoreStakeItemsTrigger);
      }
      fetchData();
    
      return ()=>{
        stakeListObserver.current.unobserve(loadMoreStakeItemsTrigger);
      }
    }, []);


  const getWalletInfo = async (pass, name)=>{
    const _keyManager = new KeyStoreManager();
    
    try{
      const decrypted = await _keyManager.readKeyStore(pass, name);
      
      if(decrypted){
        currentKeyPair.current = decrypted.getKeyPair(walletCredentials.selectedAddressIndex);
        const addr = (await currentKeyPair.current.getAddress()).toString();
        myAddressObject.current = Primitives.Address.parse(addr);
        setAddress(addr); 

        const getUncollectedReward = await zenon.embedded.stake.getUncollectedReward(myAddressObject.current);
        setUncollectedZnnReward(getUncollectedReward.qsrAmount/Math.pow(10, fallbackValues.availableTokens["zts1znnxxxxxxxxxxxxx9z4ulx"]?.token.decimals || fallbackValues.decimals))

        const getAccountInfoByAddress = await zenon.ledger.getAccountInfoByAddress(myAddressObject.current);
        if(Object.keys(getAccountInfoByAddress.balanceInfoList).length) {         
          if(getAccountInfoByAddress.balanceInfoList['zts1znnxxxxxxxxxxxxx9z4ulx']){
            setZnnAmount(getAccountInfoByAddress.balanceInfoList['zts1znnxxxxxxxxxxxxx9z4ulx'].balance/Math.pow(10, fallbackValues.availableTokens["zts1znnxxxxxxxxxxxxx9z4ulx"]?.token.decimals || fallbackValues.decimals));
          }
        }
      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      console.error("Error ", err);
    }
  }

  const transformStakeItem = (stakeItem) =>{
    return{
      amount: stakeItem.amount/Math.pow(10, fallbackValues.availableTokens["zts1znnxxxxxxxxxxxxx9z4ulx"]?.token.decimals || fallbackValues.decimals),
      address: stakeItem.address.toString(),
      expiration: (stakeItem.expirationTimestamp - Date.now()/1000)/3600,
      period: (stakeItem.expirationTimestamp - stakeItem.startTimestamp)/3600/24/30,
      id: stakeItem.id
    }
  }

  const onFormSubmit = (stakeDuration, toStakeAmount) => {
    openStakeModal(stakeDuration, toStakeAmount);
  };

  const openStakeModal = (stakeDuration, toStakeAmount) => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onStakeDismiss()}
        onSuccess={()=>onStakeSuccess(stakeDuration, toStakeAmount)}>
        <div>
          <div>Are you sure you want to stake</div>
          <div>
            <b>{toStakeAmount} ZNN</b> 
            {" for "}
          </div>         
          <b>{parseFloat(parseFloat(stakeDuration)/3600/24/30).toFixed(0)} month{parseFloat(parseFloat(stakeDuration)/3600/24/30).toFixed(0)>1?'s':''} ?</b>
        </div>
      </AlertModal>)
  }

  const onStakeDismiss = ()=>{
  }

  const onStakeSuccess = (stakeDuration, toStakeAmount)=>{
    stakeZnn(stakeDuration, toStakeAmount);
  }

  const stakeZnn = async (stakeDuration, toStakeAmount) => {
    try{
      const amountWithDecimals = parseInt(toStakeAmount) * Math.pow(10, fallbackValues.availableTokens["zts1znnxxxxxxxxxxxxx9z4ulx"]?.token.decimals || fallbackValues.decimals)
      setStakeLabel("Staking...");
      const stake = zenon.embedded.stake.stake(stakeDuration, amountWithDecimals);
      await zenon.send(stake, currentKeyPair.current);
      
      setToStakeAmount("");
      setStakeDuration("");
      setStakeLabel("Staked !");
      reset();

      toast(`Successfully staked ${toStakeAmount} ZNN`, {
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        newestOnTop: true,
        type: 'success',
        theme: 'dark'
      });

      setTimeout(()=>{
        setStakeLabel("Stake ZNN");
      }, 2500);

    }
    catch(err){
      console.error("err ", err);
      let readableError = err;
      if(err.message) {
        readableError = err.message;
      }
      readableError = (readableError+"").split("Error: ")[(readableError+"").split("Error: ").length-1];

      toast(readableError + "",{
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        newestOnTop: true,
        type: 'error',
        theme: 'dark'
      });
      setStakeLabel("Error staking");

      setTimeout(()=>{
        setStakeLabel("Stake ZNN");
      }, 2500);

      console.error("Error ", readableError);
    }
  }

  const openCollectRewardModal = () => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onCollectRewardDismiss()}
        onSuccess={()=>onCollectRewardSuccess()}>
        <div>
          <div>Are you sure you want to collect</div>
          <div>
            <b>{uncollectedZnnReward} QSR</b> ?
          </div>         
        </div>
      </AlertModal>)
  }

  const onCollectRewardDismiss = ()=>{
  }

  const onCollectRewardSuccess = ()=>{
    collectStakeReward();
  }

  const collectStakeReward = async () => {
    try{
      const stake = zenon.embedded.stake.collectReward();
      await zenon.send(stake, currentKeyPair.current);
      
      setToStakeAmount("");
      setStakeLabel("Staked !");

      setTimeout(()=>{
        setStakeLabel("Stake ZNN");
      }, 2500);

      toast(`Succesfully collected`, {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        newestOnTop: true,
        type: 'success',
        theme: 'dark'
      });
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

  // ToDo: properly test cancelStake
  const cancelStake = async (fuseId) => {
    try{
      setStakeLabel("Canceling...");
      const cancelStake = zenon.embedded.stake.cancel(fuseId);
      await zenon.send(cancelStake, currentKeyPair.current);
      
      setToStakeAmount("");
      setStakeLabel("Canceled !");

      setTimeout(()=>{
        setStakeLabel("Fuse stake");
      }, 2500);

      toast(`Succesfully canceled`, {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        newestOnTop: true,
        type: 'success',
        theme: 'dark'
      });
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

  const handleSetDuration = (i, value)=>{
    setStakeDuration(value.value);
  }

  
  const loadStakeItems = async() =>{
    if(shouldLoadMore){
                     
      const getEntriesByAddress = await zenon.embedded.stake.getEntriesByAddress(myAddressObject.current, currentStakePage.current, pageSize);

      if(getEntriesByAddress.list.length > 0){
        const newStakeItem = getEntriesByAddress.list.map((fuseItem)=>{
          return transformStakeItem(fuseItem);
        });
        setStakedItems(stakes => {
          stakedItems = [...stakes, ...newStakeItem];
          return stakedItems;
        });
        currentStakePage.current = currentStakePage.current + 1;
        // ToDo: Replace this count thing 
        if(getEntriesByAddress.count >= stakedItems.length){
          setShouldLoadMore(true);
        }else{
          setShouldLoadMore(false);
        }
      }
      else{
        setShouldLoadMore(false);
        if(stakedItems.length === 0){
          setNoStakeItemsLabel(true);
        }
      }
    }
  }

  return (
    <motion.div 
      className='black-bg transition-animated'
      initial={"pageTransitionInitial"}
      animate={"pageTransitionAnimate"}
      exit={"pageTransitionExit"}
      variants={animationVariants}>
      
      <h1 className='mt-1'>Staking</h1>
      <div className='mt-2 ml-2 mr-2'>
        <form id="stakeForm" onSubmit={handleSubmit(()=>onFormSubmit(stakeDuration, toStakeAmount))}>
          <div className='custom-control'> 
            <div className={`input-with-button w-100`}>
              <input name="stakeAmountField" {...register("stakeAmountField", 
                { required: true, 
                  min: {
                    value: 1,
                    message: 'Minimum of 1'
                  },
                  max: {
                    value: parseFloat(znnAmount),
                    message: 'Maximum of ' + parseFloat(znnAmount)
                  }
                })} 
                control={control}
                className={`w-100 custom-label pr-3 ${errors.stakeAmountField?'custom-label-error':''}`}
                placeholder='Stake ZNN'
                value={toStakeAmount} onChange={(e) => {setToStakeAmount(e.target.value); setValue('stakeAmountField', e.target.value, {shouldValidate: true})}} type='number'></input>
              <div className='primary input-chip-button'
                onClick={()=>{setToStakeAmount(znnAmount); setValue('stakeAmountField', znnAmount, { shouldValidate: true })}}>
                <span>{"MAX: " + parseFloat(znnAmount).toFixed(0)}</span>
              </div>
            </div>

            <div className={`input-error ${errors.stakeAmountField?'':'invisible'}`}>
              { errors.stakeAmountField?.message || 'Amount is required'}
            </div> 
          </div>

          <div className='custom-control'>  
            <ControlledDropdown dropdownComponent = 'CustomDropdown'
              {...register("stakeDurationField", { required: true })} control={control} 
              name="stakeDurationField" 
              options={availableStakeDurations}
              onChange={handleSetDuration} 
              value={stakeDuration} 
              placeholder={"Staking duration"}
              displayKey={"label"}
              className={`${errors.stakeDurationField?'custom-label-error':''}`} />

            <div className={`input-error ${errors.stakeDurationField?'':'invisible'}`}>
              {errors.stakeDurationField?.message || 'Staking period is required'}
            </div> 
          </div>  
        </form>

        <input className='button primary w-100 d-flex justify-content-center text-white' 
              value={stakeLabel} type="submit" form="stakeForm" name="submitButton"></input>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-left">Staked {stakedZnnAmount} ZNN</div>
          <div onClick={()=>{openCollectRewardModal()}} 
            className={`thin-button blue d-flex justify-content-center tooltip ${(uncollectedZnnReward>0)?'':'disabled'}`}>
            Collect {parseFloat(uncollectedZnnReward).toFixed(0)} QSR
            <span className='tooltip-text'>{parseFloat(uncollectedZnnReward).toFixed(3)} QSR</span>
          </div>
        </div>
          
        <div className='transactions mt-3'>
          {
            stakedItems.map((transaction, i) => {
              return <StakeItem key={"stake-item-" + transaction.id.toString() + "-" + i} cancelStake={cancelStake} period={transaction.period} id={transaction.id} amount={transaction.amount} expiration={transaction.expiration}></StakeItem>
            })
          }
        </div>

        {(shouldLoadMore || noStakeItemsLabel) && 
          <div className='mt-2 center-items'>
            <span className='text-gray ml-1'>{
              noStakeItemsLabel?'No staking history':<span id="loadMoreStakeItemsTrigger">Loading...</span>
            }</span>
          </div>
        }

        {/* <div className='mt-2 stick-bottom d-flex'>
            <input className='button primary w-100 d-flex justify-content-center text-white' 
              value={stakeLabel} type="submit" form="stakeForm" name="submitButton"></input>
        </div> */}
      </div>
    </motion.div>
  );
};

export default Stake;

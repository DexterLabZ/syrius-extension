import React, {useRef, useState, useEffect, useContext} from 'react';
import { KeyStoreManager, Zenon, Primitives } from 'znn-ts-sdk';
import PillarItem from '../../components/pillar-item/pillar-item';
import { motion } from 'framer-motion';
import animationVariants from '../../layouts/tabsLayout/animationVariants';
import { useSelector } from 'react-redux';
import AlertModal from '../../components/modals/alert-modal';
import { ModalContext } from '../../services/hooks/modal/modalContext';
import { toast } from 'react-toastify';
import fallbackValues from '../../services/utils/fallbackValues';

const Delegate = () => {
  const [address, setAddress] = useState(""); 
  let [pillarItems, setPillarItems] = useState([]); 
  const [delegatedPillar, setDelegatedPillar] = useState({name:"", weightWithDecimals: ""}); 
  const delegatedPillarName = useRef(); 
  const myAddressObject = useRef({}); 
  const currentKeyPair = useRef({});
  const zenon = Zenon.getSingleton(); 
  const currentPillarsPage = useRef(0); 
  const [shouldLoadMore, setShouldLoadMore] = useState(true); 
  const pageSize = 5;
  const pillarListObserver = useRef({}); 
  const [noPillarItemsLabel, setNoPillarItemsLabel] = useState(false); 
  const walletCredentials = useSelector(state => state.wallet);
  const { handleModal } = useContext(ModalContext);

  const [uncollectedZnnReward, setUncollectedZnnReward] = useState(0); 
  const [uncollectedQsrReward, setUncollectedQsrReward] = useState(0); 

  useEffect(() => {
    const loadMorePillarsTrigger = document.getElementById("loadMorePillarsTrigger");
      const fetchData = async() => {
        await getWalletInfo(walletCredentials.walletPassword, walletCredentials.walletName);
        pillarListObserver.current = (new IntersectionObserver(loadPillars, {
          root: null,
          rootMargin: `0px 0px 0px 0px`,
          threshold: 1.0
        }));
        pillarListObserver.current.observe(loadMorePillarsTrigger);
      }
      fetchData();
    
      return ()=>{
        pillarListObserver.current.unobserve(loadMorePillarsTrigger);
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
            
        const getDelegatedPillar = await zenon.embedded.pillar.getDelegatedPillar(myAddressObject.current);
        if(getDelegatedPillar){
          setDelegatedPillar(getDelegatedPillar);
          delegatedPillarName.current = getDelegatedPillar.name
        }

        const getUncollectedReward = await zenon.embedded.pillar.getUncollectedReward(myAddressObject.current);
        setUncollectedZnnReward(getUncollectedReward.znnAmount/ Math.pow(10, fallbackValues.availableTokens['zts1qsrxxxxxxxxxxxxxmrhjll']?.token.decimals || fallbackValues.decimals));
        setUncollectedQsrReward(getUncollectedReward.qsrAmount/ Math.pow(10, fallbackValues.availableTokens['zts1znnxxxxxxxxxxxxx9z4ulx']?.token.decimals || fallbackValues.decimals));
      }
      else{
        console.error("Error decrypting");
      }
    }
    catch(err){
      console.error("Error ", err);
    }
  }

  const transformPillarItem = (pillarItem) =>{
    return{
      name: pillarItem.name,
      giveDelegateRewardPercentage: pillarItem.giveDelegateRewardPercentage,
      giveMomentumRewardPercentage: pillarItem.giveMomentumRewardPercentage,
      weight: pillarItem.weight,
      producedMomentums: pillarItem.currentStats.producedMomentums,
      expectedMomentums: pillarItem.currentStats.expectedMomentums,
      producerAddress: pillarItem.producerAddress.toString(),
      // ToDo: Where to find the uptime?
      uptime: "100",
      isDelegatedPillar: pillarItem.name === delegatedPillarName.current
    }
  }
  
  const loadPillars = async() =>{
    if(shouldLoadMore){           
      const getAll = await zenon.embedded.pillar.getAll(currentPillarsPage.current, pageSize);

      if(getAll.list.length > 0){
        const newPillarItems = getAll.list.map((pillarItem)=>{
          return transformPillarItem(pillarItem);
        });
        setPillarItems(pillars => {
          pillarItems = [...pillars, ...newPillarItems];
          return pillarItems;
        });

        currentPillarsPage.current = currentPillarsPage.current + 1;

        if(getAll.count >= pillarItems.length){
          setShouldLoadMore(true);
        }else{
          setShouldLoadMore(false);
        }
      }
      else{
        setShouldLoadMore(false);
        if(pillarItems.length === 0){
          setNoPillarItemsLabel(true);
        }
      }
    }
  }

  const openDelegateModal = (pillarName) => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onDelegateDismiss()}
        onSuccess={()=>onDelegateSuccess(pillarName)}>
        <div>
          <div>Are you sure you want to delegate to</div>
          <div>
            <b>{pillarName}</b> ?
          </div>         
        </div>
      </AlertModal>)
  }

  const onDelegateDismiss = ()=>{
  }

  const onDelegateSuccess = (pillarName)=>{
    delegatePillar(pillarName);
  }

  const delegatePillar = async (name) =>{
    try{
      const delegate = zenon.embedded.pillar.delegate(name);
      await zenon.send(delegate, currentKeyPair.current);

      toast(`Succesfully delegated`, {
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


  const openUndelegateModal = () => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onUndelegateDismiss()}
        onSuccess={()=>onUndelegateSuccess()}>
        <div>
          <div>Are you sure you want to undelegate ?</div>
        </div>
      </AlertModal>)
  }

  const onUndelegateDismiss = ()=>{
  }

  const onUndelegateSuccess = ()=>{
    undelegatePillar();
  }

  const undelegatePillar = async () =>{
    try{
      const delegate = zenon.embedded.pillar.undelegate();
      await zenon.send(delegate, currentKeyPair.current);
      toast(`Succesfully undelegated`, {
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

  const openCollectRewardModal = (uncollectedZnnReward, uncollectedQsrReward) => {
    handleModal(<AlertModal
        type="confirm"
        title="Are you sure ?"
        onDismiss={()=>onCollectRewardDismiss()}
        onSuccess={()=>onCollectRewardSuccess()}>
        <div>
          <div>Are you sure you want to collect ?</div>
          <div><b>{uncollectedZnnReward} ZNN </b>and</div> 
          <div><b>{uncollectedQsrReward} QSR </b>?</div> 
        </div>
      </AlertModal>)
  }

  const onCollectRewardDismiss = ()=>{
  }

  const onCollectRewardSuccess = ()=>{
    collectReward();
  }

  const collectReward = async () =>{
    try{
      const collectReward = zenon.embedded.pillar.collectReward();
      await zenon.send(collectReward, currentKeyPair.current);
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

  return (
    <motion.div 
      className='black-bg transition-animated'
      initial={"pageTransitionInitial"}
      animate={"pageTransitionAnimate"}
      exit={"pageTransitionExit"}
      variants={animationVariants}>

      <h1 className='mt-1'>Delegate</h1>

      <div className='ml-2 mr-2'>
        {
          delegatedPillar.name!=="" && 
          <>
            <div className='d-flex align-items-center justify-content-between w-100 text-left'>
              <div>
                <div><b className='text-gray'>Delegated:</b> {delegatedPillar?.name}</div>
                <div><b className='text-gray'>Weight:</b> {parseFloat(delegatedPillar?.weightWithDecimals).toFixed(0)}</div>
              </div>
              <div onClick={()=>openUndelegateModal()} className='thin-button secondary d-flex justify-content-center'>
                  Undelegate
              </div>
            </div>
            {
              (uncollectedQsrReward>-1 || uncollectedZnnReward>-1) &&
              <div className='mt-2 d-flex align-items-center justify-content-between w-100 text-left'>
                <div>
                  <div><b className='text-gray'>Rewarded ZNN:</b> {parseFloat(uncollectedZnnReward).toFixed(0)}</div>
                  <div><b className='text-gray'>Rewarded QSR:</b> {parseFloat(uncollectedQsrReward).toFixed(0)}</div>
                </div>
                <div onClick={()=>openCollectRewardModal(uncollectedZnnReward, uncollectedQsrReward)} 
                  className={`thin-button primary d-flex justify-content-center ${(uncollectedQsrReward>0 || uncollectedZnnReward>0)?'':'disabled'}`}>
                    Collect
                </div>
              </div>
            }
          </>
        }

        <div className='transactions mt-2'>
          {
            pillarItems.map((pillar, i) => {
              return <PillarItem key={"pillar-"+i} delegatePillar={openDelegateModal} undelegatePillar={openUndelegateModal} isDelegatedPillar={pillar.isDelegatedPillar} name={pillar.name} giveDelegateRewardPercentage={pillar.giveDelegateRewardPercentage} giveMomentumRewardPercentage={pillar.giveMomentumRewardPercentage} weight={pillar.weight} producedMomentums={pillar.producedMomentums} expectedMomentums={pillar.expectedMomentums} producerAddress={pillar.producerAddress} uptime={pillar.uptime} ></PillarItem>
            })
          }
        </div>
        
        {(shouldLoadMore || noPillarItemsLabel) && 
          <div className='mt-2 center-items'>
            <span className='text-gray ml-1'>{
              noPillarItemsLabel?'No pillars':<span id="loadMorePillarsTrigger">Loading...</span>
            }</span>
          </div>
        }
      </div>

  </motion.div>
  );
};

export default Delegate;

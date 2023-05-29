import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Zenon, Constants } from 'znn-ts-sdk';
import ChangeChainIdItem from '../../../components/change-chainId-item/change-chainId-item';
import { SpinnerContext } from '../../../services/hooks/spinner/spinnerContext';
import { storeChainIdentifier } from '../../../services/redux/connectionParametersSlice';

const ChangeChainId = () => {
  const [currentChainId, setCurrentChainId] = useState('');
  const [chainIdToBeAdded, setChainIdToBeAdded] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const zenon = Zenon.getSingleton();
  const { handleSpinner } = useContext(SpinnerContext);
  const connectionParameters = useSelector(state => state.connectionParameters);
  const dispatch = useDispatch();
  const defaultChainIds = [
    1,
    3,
  ]

  const [chainIdItems, setChainIdItems] = useState(JSON.parse(localStorage.getItem("chainIdList")) || []);

  useEffect(() => {
    const connectedChainId = Zenon.getChainIdentifier();
    dispatch(storeChainIdentifier(connectedChainId));
    
    localStorage.setItem(Constants.DEFAULT_CHAINID_PATH, localStorage.getItem(Constants.DEFAULT_CHAINID_PATH) || connectedChainId);

    if (chainIdItems.length === 0) {
      if (!defaultChainIds.includes(connectedChainId)) {
        defaultChainIds.push(connectedChainId);
      }
      setChainIdItems(defaultChainIds);
      localStorage.setItem("chainIdList", JSON.stringify(chainIdItems));
    }
    console.log("defaultChainIds", defaultChainIds);
    console.log("chainIdItems", chainIdItems);

    setCurrentChainId(connectedChainId);
  }, []);

  const sendChangeChainIdEvent = async (newChainId) => {
    chrome.runtime.sendMessage({
      message: "znn.chainIdChanged", 
      data: {newChainId: newChainId}
    });
  } 

  const onSelectChainId = async (chainId) => {
    const showSpinner = handleSpinner(
      <div>
        Connecting to {chainId}
        <div className='button secondary mt-2' onClick={() => showSpinner(false)}>Cancel</div>
      </div>
    );

    try {
      showSpinner(true);

      Zenon.setChainIdentifier(chainId);
      // await zenon.initialize(chainId, false, 2500)
      setCurrentChainId(chainId);
      // localStorage.setItem(Constants.DEFAULT_CHAINID_PATH, chainId);
      dispatch(storeChainIdentifier(chainId));
      sendChangeChainIdEvent(chainId);

      toast("Updated chainId", {
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
      showSpinner(false);
    }
    catch (err) {
      // Connect back to default chainId
      try {
        Zenon.setChainIdentifier(connectionParameters.chainId);
        setCurrentChainId(connectionParameters.chainId);

        let readableError = err;
        if (err.message) {
          readableError = err.message;
        }
        readableError = (readableError + "").split("Error: ")[(readableError + "").split("Error: ").length - 1];
  
        console.error("Error ", readableError);
        toast(readableError + "", {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          newestOnTop: true,
          type: 'error',
          theme: 'dark'
        });
        showSpinner(false);  
      }
      catch (err) {
        showSpinner(false);
        let readableError = err;
        if (err.message) {
          readableError = err.message;
        }
        readableError = (readableError + "").split("Error: ")[(readableError + "").split("Error: ").length - 1];
  
        console.error("Error ", readableError);
        toast(readableError + "", {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          newestOnTop: true,
          type: 'error',
          theme: 'dark'
        });
        showSpinner(false);
      }
    }
  }

  const addChainIdItem = (chainId) => {
    let updatedChainIds = [];
    setChainIdItems(prevChainIds => {
      updatedChainIds = [...prevChainIds, chainId];
      return updatedChainIds;
    })
    setChainIdToBeAdded("");

    localStorage.setItem("chainIdList", JSON.stringify(updatedChainIds));
  }

  const removeChainIdItem = (chainId) => {
    let updatedChainIds = [];
    setChainIdItems(prevChainIds => {
      updatedChainIds = prevChainIds.filter((v) => v !== chainId)
      return updatedChainIds;
    })

    localStorage.setItem("chainIdList", JSON.stringify(updatedChainIds));
  }

  const isInChainIdList = (chainIdList, chainId) => {
    return chainIdList.some(chainIdInList => chainId === chainIdInList)
  }

  const validateAddChainId = (input) => {
    if (typeof parseFloat(input) == "number") {
      if (isInChainIdList(chainIdItems, input)) {
        return "ChainId already in list"
      } else return true;
    } else return "Invalid chainId"
  }

  return (
    <div className='black-bg'>
      <h1 className='mt-1'>Change chainId</h1>

      <div className='mt-2 ml-2 mr-2'>
        {
          chainIdItems.map((item, index) => {
            return <ChangeChainIdItem isSelected={currentChainId === item} key={"change-chainId-item-" + index} onSelect={onSelectChainId} onRemove={removeChainIdItem} chainId={item}></ChangeChainIdItem>
          })
        }

        <form className='mt-2' id="addChainIdForm" onSubmit={handleSubmit(() => addChainIdItem(chainIdToBeAdded))}>
          <div className='custom-control'>
            <div className={`w-100`}>
              <input name="chainIdToBeAddedField" {...register("chainIdToBeAddedField",
                {
                  required: true,
                  validate: (input) => validateAddChainId(input)
                })}
                className={`w-100 custom-label pr-3 ${errors.chainIdToBeAddedField ? 'custom-label-error' : ''}`}
                placeholder="Add a chainId (Ex. ws://192.168.0.0:35998)"
                value={chainIdToBeAdded} 
                onChange={(e) => { setChainIdToBeAdded(e.target.value); setValue('chainIdToBeAddedField', e.target.value, { shouldValidate: true }) }} 
                type='text'></input>

            </div>

            <div className={`input-error ${errors.chainIdToBeAddedField ? '' : 'invisible'}`}>
              {errors.chainIdToBeAddedField?.message || 'Type a chainId'}
            </div>
          </div>
        </form>

        <div className='mt-2 d-flex'>
          <input className='button primary w-100 d-flex justify-content-center text-white'
            value={"Add chainId"} type="submit" form="addChainIdForm" name="submitButton"></input>
        </div>

      </div>
    </div>
  );
};

export default ChangeChainId;

import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Zenon } from 'znn-ts-sdk';
import ChangeNodeItem from '../../../components/change-node-item/change-node-item';
import { SpinnerContext } from '../../../services/hooks/spinner/spinnerContext';
import { storeNodeUrl } from '../../../services/redux/connectionParametersSlice';

const InitialNodeSelection = () => {
  const [currentNode, setCurrentNode] = useState();
  const [nodeToBeAdded, setNodeToBeAdded] = useState();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const zenon = Zenon.getSingleton();
  const { handleSpinner } = useContext(SpinnerContext);
  const connectionParameters = useSelector(state => state.connectionParameters);
  const dispatch = useDispatch();
  let defaultNodes = [
    "ws://chadasscapital.com:35998",
    "ws://127.0.0.1:35998",
  ]
  const [nodeItems, setNodeItems] = useState(JSON.parse(localStorage.getItem("nodeList")) || []);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("currentNodeUrl", localStorage.getItem("currentNodeUrl") || connectionParameters.nodeUrl);

    if (nodeItems.length === 0) {
      if (!defaultNodes.includes(connectionParameters.nodeUrl)) {
        defaultNodes.push(connectionParameters.nodeUrl);
      }
      setNodeItems(defaultNodes);
      localStorage.setItem("nodeList", JSON.stringify(nodeItems));
    }
    setCurrentNode(connectionParameters.nodeUrl);
  }, []);

  const onSelectNode = async (node) => {
    const showSpinner = handleSpinner(
      <div>
        Connecting to {node}
        <div className='button secondary mt-2' onClick={() => showSpinner(false)}>Cancel</div>
      </div>
    );

    try {
      showSpinner(true);

      zenon.clearSocketConnection();
      await zenon.initialize(node, false, 2500)
      setCurrentNode(node);
      localStorage.setItem("currentNodeUrl", node);
      dispatch(storeNodeUrl(node));

      toast("Updated node url", {
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
      // Connect back to default node
      await zenon.initialize(connectionParameters.nodeUrl, false, 2500);

      let readableError = err;
      if (err.message) {
        readableError = err.message;
      }
      readableError = (readableError + "").split("Error: ")[(readableError + "").split("Error: ").length - 1];

      console.error("Error ", readableError);
      toast(readableError + "", {
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
      showSpinner(false);
    }
  }

  const addNodeItem = (node) => {
    let updatedNodes = [];
    setNodeItems(prevNodes => {
      updatedNodes = [...prevNodes, node];
      return updatedNodes;
    })
    setNodeToBeAdded("");

    localStorage.setItem("nodeList", JSON.stringify(updatedNodes));
  }

  const saveNode = (node) => {
    navigate("/password");
  }


  const removeNodeItem = (node) => {
    let updatedNodes = [];
    setNodeItems(prevNodes => {
      updatedNodes = prevNodes.filter((v) => v !== node)
      return updatedNodes;
    })

    localStorage.setItem("nodeList", JSON.stringify(updatedNodes));
  }

  const isInNodeList = (nodeList, node) => {
    return nodeList.some(nodeInList => node === nodeInList)
  }

  const validateAddNode = (input) => {
    if (input.startsWith("ws://")) {
      if (isInNodeList(nodeItems, input)) {
        return "Node already in list"
      } else return true;
    } else return "Invalid address"
  }

  return (
    <div className='black-bg mt-5 mb-5 pl-2 pr-2'>
      <h1 className='mt-1'>Select your node</h1>
      <h5 className='mt-1 text-gray'>This is the url of your trusted Zenon Node</h5>

      <div className='mt-2'>
        {
          nodeItems.map((item, index) => {
            return <ChangeNodeItem isSelected={currentNode === item} key={"change-node-item-" + index} onSelect={onSelectNode} onRemove={removeNodeItem} url={item}></ChangeNodeItem>
          })
        }

        <form className='mt-2' id="addNodeForm" onSubmit={handleSubmit(() => addNodeItem(nodeToBeAdded))}>
          <div className='custom-control'>
            <div className={`w-100`}>
              <input name="nodeToBeAddedField" {...register("nodeToBeAddedField",
                {
                  required: true,
                  validate: (input) => validateAddNode(input)
                })}
                className={`w-100 custom-label pr-3 ${errors.nodeToBeAddedField ? 'custom-label-error' : ''}`}
                placeholder="Add a node (Ex. ws://192.168.0.0:35998)"
                value={nodeToBeAdded} onChange={(e) => { setNodeToBeAdded(e.target.value); setValue('nodeToBeAddedField', nodeToBeAdded, { shouldValidate: true }) }} type='text'></input>

            </div>

            <div className={`input-error ${errors.nodeToBeAddedField ? '' : 'invisible'}`}>
              {errors.nodeToBeAddedField?.message || 'Type an url'}
            </div>
          </div>
        </form>

        <div className='mt-2 d-flex'>
          <input className='button secondary w-100 d-flex justify-content-center text-white'
            value={"Add node"} type="submit" form="addNodeForm" name="submitButton"></input>
        </div>

        <div className='button primary mt-2' onClick={() => saveNode(false)}>Save</div>

      </div>
    </div>
  );
};

export default InitialNodeSelection;

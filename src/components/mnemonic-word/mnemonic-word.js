import React, { useState } from 'react';
import './mnemonic-word.scss';

const MnemonicWord = ({isSelected=false, onSelect=()=>{}, onDeselect=()=>{}, word="", index}) => {
  const [isVisible, setIsVisible] = useState(isSelected);
  const hashedWord = (word+"").replaceAll(/./g,'*');

  const wordClickHandler = (_word) => {
    if(isVisible){
      setIsVisible(false);
      onDeselect(_word);
    }else{
      setIsVisible(true);
      onSelect(_word);
    }
  }

  return (
    <div onClick={() => wordClickHandler(word)} className={`mnemonic-word ${isVisible===true?'is-visible':'is-hidden'}`}>
      <div className="mnemonic-word-index mr-2">
        {index}
      </div>
      <div className={`mnemonic-word-text`}>
        <div className="mnemonic-hashed-word text-white text-left text-sm">
          { hashedWord }      
        </div>
        <div className="mnemonic-original-word text-white text-left text-sm">
          { word }      
        </div>
      </div>
    </div>
  );
};

export default MnemonicWord;

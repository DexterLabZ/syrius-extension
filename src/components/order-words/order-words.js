import React, { useState } from 'react';

const OrderWords = ({ordered, setOrder, shuffled}) => {
  const [shuffledMnemonic, setShuffledMnemonic] = useState(shuffled);

  const selectWord = (value, index) => {
    const auxMnemonic = [
      ...shuffledMnemonic.slice(0, index),
      ...shuffledMnemonic.slice(index + 1)
    ];
    setShuffledMnemonic(auxMnemonic);
    setOrder([...ordered, value]);
  }

  const removeWord = (value, index) => {
    const auxMnemonic = [
      ...ordered.slice(0, index),
      ...ordered.slice(index + 1)
    ];
    setOrder(auxMnemonic);
    setShuffledMnemonic([...shuffledMnemonic, value]);
  }
  return (
      <div className=''>
     
        <div className='mt-4 secret-phrase-input'>
          {ordered.map(function(value, i){
            return <span className='secret-word mr-1 mb-1' key={i} onClick={() => removeWord(value, i)}>{value}</span>;
        })}

        </div>

        <div className='mt-4 secret-words'>

        {shuffledMnemonic.map(function(value, i){
            return <span className='secret-word mr-1 mb-1' key={i} onClick={() => selectWord(value, i)}>{value}</span>;
        })}

        </div>
    </div>
  );
};

export default OrderWords;

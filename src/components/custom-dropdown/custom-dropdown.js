import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = React.forwardRef(({name, className, options, onChange, onBlur, value, placeholder, displayKey = false, validationOptions}, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const selectRef = useRef(ref);
  const [selectedIndex, setSelectedIndex] = useState();

  const clickControl = () => {
    setIsOpened(!isOpened);
  }

  const clickOption = (i, value) => {
    setSelectedIndex(i);
    onChange(i, value);
    setIsOpened(!isOpened);
  }

  useEffect(() => {
    function onSelectBlur() {
      onBlur();
    }
    if (selectRef && selectRef.current) {
        selectRef.current.addEventListener("onmouseout", onSelectBlur, false);
        return () => {
          if (selectRef && selectRef.current) {
                selectRef.current.removeEventListener("onmouseout", onSelectBlur, false);
          }
      };
    }
  }, []);

  return (
      <div className={`Dropdown-root ${isOpened?'is-open':''}`}>
        <div className={`${className} w-100 Dropdown-control`} tabIndex="0"
          onClick={clickControl} ref={selectRef}>
            <span>
              {(displayKey ? displayKey.split('.').reduce((p,c)=>p&&p[c]||"", options[selectedIndex])
                  :options[selectedIndex])
              || placeholder} 
              </span>
            <span className='Dropdown-arrow'></span>
        </div>
     
        <div className='mt-0 Dropdown-menu'>
          {options.map(function(currentValue, i){
            if(options.length === 1 || currentValue !== value){
              return <div className='Dropdown-option' key={i} onClick={() => clickOption(i, currentValue)}>{
                displayKey ? displayKey.split('.').reduce((p,c)=>p&&p[c]||"", currentValue)
                :currentValue
              }</div>;
            }
          })}
        </div>
    </div>
  );
});

export default CustomDropdown;

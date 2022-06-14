import React, { useEffect, useRef, useState } from 'react';

const TokenDropdown = React.forwardRef(({name, className, options, onChange, onBlur, value, placeholder, tokenStandardPath = false, tokenSymbolPath = false, tokenIconPath = false}, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState();
  const selectRef = useRef(ref);

  const clickControl = () => {
    setIsOpened(!isOpened);
  }

  const clickOption = (i, value) => {
    onChange(i, value);
    setIsOpened(!isOpened);
    setSelectedIndex(i);
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

  useEffect(()=>{
    options.filter((currentValue, i)=>{
      if(currentValue.token.tokenStandard === value)
        setSelectedIndex(i);
    })
  }, [value]);

  return (
    <div className={`Dropdown-root ${isOpened?'is-open':''}`}>
        <div className={`${className} w-100 Dropdown-control`} tabIndex="0"
          onClick={clickControl} ref={selectRef}>
            {
              (
                (tokenSymbolPath.split('.').reduce((p,c)=>p&&p[c]||"", options[selectedIndex]))
                +" "+
                ((tokenStandardPath && (
                  ((tokenStandardPath.split('.').reduce((p,c)=>p&&p[c]||"", options[selectedIndex]))+"").slice(0, 3) 
                  + '...' + 
                  ((tokenStandardPath.split('.').reduce((p,c)=>p&&p[c]||"", options[selectedIndex]))+"").slice(-3)
                )) || "")
              )
              || value || placeholder
            } 
            <span className='Dropdown-arrow'></span>
        </div>
     
        <div className='mt-0 Dropdown-menu'>
          {options.map(function(currentValue, i){
            if(options.length === 1 || currentValue !== value){
              return <div className='Dropdown-option d-flex' key={i} onClick={() => clickOption(i, currentValue)}>
                {
                  (
                    (tokenSymbolPath.split('.').reduce((p,c)=>p&&p[c]||"", currentValue))
                    +" "+
                    ((tokenStandardPath && (
                      ((tokenStandardPath.split('.').reduce((p,c)=>p&&p[c]||"", currentValue))+"").slice(0, 3) 
                      + '...' + 
                      ((tokenStandardPath.split('.').reduce((p,c)=>p&&p[c]||"", currentValue))+"").slice(-3)
                    )) || "")
                  )
                }
              </div>
            }
          })}
        </div>
    </div>
  );
});

export default TokenDropdown;

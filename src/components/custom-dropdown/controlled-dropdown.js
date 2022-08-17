import React from 'react';
import { useController } from "react-hook-form";
import TokenDropdown from '../token-dropdown/token-dropdown';
import CustomDropdown from './custom-dropdown';

const ControlledDropdown = React.forwardRef((props, ref) => {
  const {
    field
  } = useController(props);

  switch(props.dropdownComponent || 'CustomDropdown'){
    default:
    case ('CustomDropdown'): {
      return (
        <CustomDropdown 
          name={props.name}
          className={props.className}
          options={props.options} 
          onChange={(...args)=>{props.onChange(...args); field.onChange(...args)}} 
          onBlur={(...args)=>{props.onBlur(...args); field.onBlur(...args)}} 
          value={field.value} 
          placeholder={props.placeholder || ""}
          label={props.label || ""}
          displayKey={props.displayKey || false} 
          ref={ref} 
        />
      );    
    }
    case ('TokenDropdown'): {
      return (
        <TokenDropdown 
          name={props.name}
          className={props.className}
          options={props.options} 
          onChange={(...args)=>{props.onChange(...args); field.onChange(...args)}} 
          onBlur={(...args)=>{props.onBlur(...args); field.onBlur(...args)}} 
          value={field.value} 
          placeholder={props.placeholder || ""}
          label={props.label || ""}
          tokenSymbolPath={props.tokenSymbolPath || false} 
          tokenStandardPath={props.tokenStandardPath || false} 
          ref={ref} 
        />
      );    
    }
  }

});

export default ControlledDropdown;

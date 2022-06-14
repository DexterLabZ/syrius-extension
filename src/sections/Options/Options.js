import React from 'react';
import './Options.scss';
const Options = ({ title }) => {
    return React.createElement("div", { className: "OptionsContainer" },
        title,
        " Page");
};
export default Options;

import React from 'react';
import './external-link.scss';

const ExternalLinkIcon = () => {
  return (
    <div className="icon-container">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.44444 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V15.5556"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id="exit-left"
          d="M9.29289 13.2929C8.90237 13.6834 8.90237 14.3166 9.29289 14.7071C9.68342 15.0976 10.3166 15.0976 10.7071 14.7071L9.29289 13.2929ZM21 3H22C22 2.44772 21.5523 2 21 2V3ZM20 11C20 11.5523 20.4477 12 21 12C21.5523 12 22 11.5523 22 11H20ZM13 2C12.4477 2 12 2.44772 12 3C12 3.55228 12.4477 4 13 4V2ZM10.7071 14.7071L21.7071 3.70711L20.2929 2.29289L9.29289 13.2929L10.7071 14.7071ZM20 3V11H22V3H20ZM21 2H13V4H21V2Z"
          fill="white" />
      </svg>
    </div>
  );
};

export default ExternalLinkIcon;

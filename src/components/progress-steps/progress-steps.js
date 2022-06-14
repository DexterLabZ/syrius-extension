import React from 'react';

const ProgressSteps = ({ currentStep, maxSteps }) => {
  let steps = new Array(maxSteps).fill(0);
  for(const step in steps) {
    if(step <= currentStep) steps[step] = true;
  }

  return (
    <div className='mt-4 onboarding-progress-container'>
      {
        steps.map((isCompleted, index) => {
          return (
            <div className={`current-progress ${isCompleted? 'filled' : ''}`} key={index}></div>
          );
        })
      }
    </div>
  );
};

export default ProgressSteps;

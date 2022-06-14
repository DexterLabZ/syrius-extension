import React, { useState } from 'react';
import Lottie from 'react-lottie-player';
import * as splashAnimation from './../../assets/lottie/ic_anim_pillar.json'

const PillarItem = ({ delegatePillar, undelegatePillar, isDelegatedPillar, name, giveDelegateRewardPercentage, giveMomentumRewardPercentage, weight, producedMomentums, expectedMomentums, producerAddress, uptime}) => {
  const [animationSettings, setAnimationSettings] = useState({
    loop: false,
    autoPlay: true, 
    animationData: splashAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });
  const [isAnimationStopped, setIsAnimationStopped] = useState(false);

  return (
    <div className='pillar mt-2 d-flex justify-content-between'>
      <div>
        <div className='text-xs align-items-start text-left'>
          <b className="text-gray">Name: </b>{name}
        </div>
        <div className='text-xs mt-1 align-items-start text-left tooltip'>
          <b className="text-gray">Producer: </b>{producerAddress.slice(0, 3) + '...' + producerAddress.slice(-3)}
          <div className='tooltip-text text-md ml-5'>{producerAddress}</div>
        </div>
        <div className='text-xs mt-1 align-items-start text-left tooltip'>
          <b className="text-gray">Weight: </b>{(parseFloat(weight)/1000000).toFixed(0)} M
          <div className='tooltip-text text-md ml-5'>{weight}</div>
        </div>
        <div className='text-xs mt-1 align-items-start text-left'>
          <b className="text-gray">Expected/produced momentums: </b>{expectedMomentums+"/"+producedMomentums}
        </div>
        <div className='text-xs mt-1 align-items-start text-left'>
          <b className="text-gray">Momentum reward: </b>{giveMomentumRewardPercentage + "%"}
        </div>
        <div className='text-xs mt-1 align-items-start text-left'>
          <b className="text-gray">Delegation reward: </b>{giveDelegateRewardPercentage + "%"}
        </div>
        <div className='text-xs mt-1 align-items-start text-left'>
          <b className="text-gray">Uptime: </b>{uptime + "%"}
        </div>
      </div>

      <div className="pillar-right-side ml-2" style={{width: "70%"}}>
        
        <div className='pillar-graphic'>
          <img alt="" className={`animated pillar-image ${isAnimationStopped?'':'invisible'}`} src={require(`./../../assets/pillar-stop-frame.svg`)} height='100%'></img>
          <div className={`animated ${isAnimationStopped?'disappear-out':''}`}>
            <Lottie
              {...animationSettings}
              play={!isAnimationStopped}
              onComplete={() => setIsAnimationStopped(true)}
            />
          </div>


        </div>

        {
          isDelegatedPillar &&
          <div onClick={()=>undelegatePillar()} className='thin-button secondary d-flex justify-content-center'>
              Undelegate
          </div>
        }
        {
          !isDelegatedPillar &&
          <div onClick={()=>delegatePillar(name)} className='thin-button primary d-flex justify-content-center'>
              Delegate
          </div>
        }

      </div>


    </div>
  );
};

export default PillarItem;

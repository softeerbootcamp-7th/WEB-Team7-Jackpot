import { useState } from 'react';

import LandingInformation from '@/features/landing/components/LandingInformation';
import LandingIntro from '@/features/landing/components/LandingIntro';

const LandingPage = () => {
  const [isEntered, setIsEntered] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleIntroClick = () => {
    setIsAnimating(true);

    setTimeout(() => {
      setIsEntered(true);
    }, 800);
  };

  return (
    <>
      {!isEntered && (
        <div className='fixed inset-0 z-50'>
          <LandingIntro onEnter={handleIntroClick} />
        </div>
      )}

      <LandingInformation isAnimating={isAnimating} />
    </>
  );
};

export default LandingPage;

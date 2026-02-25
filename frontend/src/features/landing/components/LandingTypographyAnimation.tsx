import { useEffect, useState } from 'react';

import { LANDING_CONTENT } from '@/features/landing/constants';
import * as LAI from '@/features/landing/icons';

const LandingTypographyAnimation = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const line1Text = LANDING_CONTENT.TYPOGRAPHY.LINES.ONE;
  const line2Text = LANDING_CONTENT.TYPOGRAPHY.LINES.TWO;

  const maskStyle = {
    WebkitMaskImage:
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.1) 100%)',
    maskImage:
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.1) 100%)',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, LANDING_CONTENT.TYPOGRAPHY.DELAY.LOAD);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='font-helvetica pointer-events-none absolute bottom-16 left-10 z-400 flex flex-col gap-6 select-none md:bottom-24 md:left-24'>
      <h1 className='relative flex w-fit text-6xl font-bold tracking-tighter md:text-[140px] lg:text-[180px]'>
        <div
          className={`overflow-hidden transition-[width] duration-500 ease-out ${
            isLoaded ? 'w-full' : 'w-0'
          }`}
        >
          <div
            style={maskStyle}
            className='pr-4 leading-none whitespace-nowrap text-white'
          >
            {line1Text}
          </div>
        </div>
        <div
          className={`absolute -right-4 transition-opacity delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <LAI.TypographyCursor />
        </div>
      </h1>
      <div className='relative -mt-2 w-fit text-6xl font-bold tracking-tighter md:-mt-6 md:text-[140px] lg:text-[180px]'>
        <div
          className={`overflow-hidden transition-[width] delay-400 duration-1500 ease-out ${
            isLoaded ? 'w-full' : 'w-0'
          }`}
        >
          <div
            style={maskStyle}
            className='pr-4 pb-4 leading-none whitespace-nowrap text-white'
          >
            {line2Text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingTypographyAnimation;

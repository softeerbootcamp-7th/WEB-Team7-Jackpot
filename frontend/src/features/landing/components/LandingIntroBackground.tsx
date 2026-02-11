import landingVideo from '/videos/landing.mp4';

const LandingIntroBackground = () => {
  return (
    <div className='relative h-screen w-screen overflow-hidden'>
      {/* 배경 비디오 */}
      <video
        className='absolute inset-0 z-0 h-full w-full object-cover'
        style={{ objectPosition: 'center center' }}
        src={landingVideo}
        autoPlay
        loop
        muted
        playsInline
        preload='auto'
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background: '#E3E8FC66',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(30.94% 55% at 30.9% 45%, #4B6BFF 0%, rgba(75,107,255,0.5) 50%, rgba(75,107,255,0) 100%)',
          mixBlendMode: 'color',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(19.9% 35.37% at 37.89% 59.72%, #4B6BFF 0%, rgba(75,107,255,0.5) 50%, rgba(75,107,255,0) 100%)',
          mixBlendMode: 'color',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(45.91% 81.62% at 13.33% 76.71%, rgba(178,111,255,0.2) 0%, rgba(178,111,255,0.1) 50%, rgba(178,111,255,0) 100%)',
          mixBlendMode: 'color-burn',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(37.19% 66.11% at 66.2% 100%, #4B6BFF 0%, rgba(75,107,255,0.5) 50%, rgba(75,107,255,0) 100%)',
          mixBlendMode: 'color',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(48.2% 85.69% at 5.68% -3.98%, #6FDDFF 0%, rgba(111,221,255,0.5) 50%, rgba(111,221,255,0) 100%)',
          mixBlendMode: 'color-dodge',
        }}
      />

      <div
        className='absolute inset-0 z-10'
        style={{
          background:
            'radial-gradient(32.42% 57.64% at 9.79% -10.65%, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      <svg
        className='absolute inset-0 z-20 h-full w-full'
        viewBox='0 0 1920 1080'
        preserveAspectRatio='xMidYMid slice'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='960' cy='540' r='539.75' stroke='white' strokeWidth='0.5' />
        <circle
          cx='960'
          cy='1080'
          r='539.75'
          stroke='white'
          strokeWidth='0.5'
        />
        <circle cx='960' r='539.75' stroke='white' strokeWidth='0.5' />
        <line
          y1='539.75'
          x2='1920'
          y2='539.75'
          stroke='white'
          strokeWidth='0.5'
        />
        <circle
          cx='1499.5'
          cy='539.5'
          r='11.25'
          stroke='white'
          strokeWidth='0.5'
        />
        <circle cx='1524.5' cy='539.5' r='3.5' fill='white' />
        <circle cx='1453.5' cy='320.5' r='3.5' fill='white' />
        <circle
          cx='11.5'
          cy='11.5'
          r='11.25'
          transform='matrix(-1 0 0 1 432 528)'
          stroke='white'
          strokeWidth='0.5'
        />
        <circle
          cx='3.5'
          cy='3.5'
          r='3.5'
          transform='matrix(-1 0 0 1 399 536)'
          fill='white'
        />
        <circle cx='960.5' cy='539.5' r='3.5' fill='white' />
      </svg>
    </div>
  );
};

export default LandingIntroBackground;

const UploadCompleteBackground = () => {
  return (
    <svg
      className='overflow-visible'
      width='600'
      height='600'
      viewBox='0 0 600 600'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        className='animate-spread'
        style={{ animationDelay: '1s', animationFillMode: 'both' }}
        opacity='0.7'
        cx='300'
        cy='300'
        r='300'
        transform='rotate(90 300 300)'
        fill='url(#paint0_linear_12674_6812)'
        fillOpacity='0.9'
      />
      <circle
        className='animate-spread'
        style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        opacity='0.7'
        cx='300.001'
        cy='300'
        r='211.786'
        transform='rotate(90 300.001 300)'
        fill='url(#paint1_linear_12674_6812)'
        fillOpacity='0.9'
      />
      <circle
        className='animate-spread'
        style={{ animationDelay: '0s', animationFillMode: 'both' }}
        opacity='0.7'
        cx='300'
        cy='300'
        r='138.682'
        transform='rotate(90 300 300)'
        fill='url(#paint2_linear_12674_6812)'
        fillOpacity='0.9'
      />
      <defs>
        <linearGradient
          id='paint0_linear_12674_6812'
          x1='300'
          y1='0'
          x2='300'
          y2='600'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#CCD3F9' />
          <stop offset='0.234014' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='1' stopColor='#CCD3F9' />
        </linearGradient>
        <linearGradient
          id='paint1_linear_12674_6812'
          x1='300.001'
          y1='88.2139'
          x2='300.001'
          y2='511.787'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#CCD3F9' />
          <stop offset='0.234014' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='1' stopColor='#CCD3F9' />
        </linearGradient>
        <linearGradient
          id='paint2_linear_12674_6812'
          x1='300'
          y1='161.318'
          x2='300'
          y2='438.681'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#CCD3F9' />
          <stop offset='0.234014' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#E3E8FC' stopOpacity='0' />
          <stop offset='1' stopColor='#CCD3F9' />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default UploadCompleteBackground;

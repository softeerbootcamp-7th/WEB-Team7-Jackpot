import { type SVGProps } from 'react';

export const LibraryIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='36'
      height='36'
      fill='none'
      viewBox='0 0 36 36'
      {...props}
    >
      <path
        fill='url(#a)'
        d='M30.679.817c.677 0 1.226.55 1.226 1.228v22.09a1.227 1.227 0 0 1-2.026.932l-1.266-1.085a1.23 1.23 0 0 0-1.597 0l-1.266 1.085a1.23 1.23 0 0 1-1.598 0l-1.265-1.085a1.23 1.23 0 0 0-1.599 0l-1.265 1.085a1.23 1.23 0 0 1-1.598 0l-1.266-1.085a1.23 1.23 0 0 0-1.597 0l-1.266 1.085a1.229 1.229 0 0 1-2.026-.931V2.045c0-.678.549-1.227 1.226-1.228z'
      />
      <path
        fill='url(#b)'
        d='M26.043 5.454a1.5 1.5 0 0 1 1.5 1.5v27a1.501 1.501 0 0 1-2.476 1.139l-1.547-1.327a1.5 1.5 0 0 0-1.954 0l-1.546 1.327a1.5 1.5 0 0 1-1.954 0l-1.546-1.327a1.5 1.5 0 0 0-1.953 0l-1.547 1.327a1.5 1.5 0 0 1-1.954 0L9.52 33.766a1.5 1.5 0 0 0-1.953 0L6.02 35.093a1.501 1.501 0 0 1-2.477-1.139v-27a1.5 1.5 0 0 1 1.5-1.5z'
      />
      <path
        stroke='#fff'
        d='M21.679 12.136H9.406m12.273 6H9.406m12.273 6h-9.273'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.291'
      />
      <defs>
        <linearGradient
          id='a'
          x1='22.087'
          x2='22.087'
          y1='.817'
          y2='25.363'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#7371E3' />
          <stop offset='1' stopColor='#AEB7F3' />
        </linearGradient>
        <linearGradient
          id='b'
          x1='15.543'
          x2='15.543'
          y1='5.454'
          y2='35.454'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' />
          <stop offset='1' stopColor='#E3E8FC' />
        </linearGradient>
      </defs>
    </svg>
  );
};

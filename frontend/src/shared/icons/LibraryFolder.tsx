import { type SVGProps } from 'react';

export const LibraryFolder = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='79'
      height='56'
      fill='none'
      viewBox='0 0 79 56'
      {...props}
    >
      <path
        fill='url(#a)'
        d='M1.035 8a8 8 0 0 1 8-8h10.286a8 8 0 0 1 5.657 2.343L26.235 3.6h36.8c5.523 0 10 4.477 10 10V44c0 5.523-4.477 10-10 10h-58a4 4 0 0 1-4-4z'
      />
      <g filter='url(#b)'>
        <path
          fill='#D9D9D9'
          d='M4.579 13.52a8 8 0 0 1 7.977-7.4h49.64c4.725 0 8.42 4.075 7.961 8.778l-3.116 31.88A8 8 0 0 1 59.079 54h-48.92c-4.654 0-8.326-3.958-7.977-8.6z'
        />
        <path
          fill='url(#c)'
          d='M4.579 13.52a8 8 0 0 1 7.977-7.4h49.64c4.725 0 8.42 4.075 7.961 8.778l-3.116 31.88A8 8 0 0 1 59.079 54h-48.92c-4.654 0-8.326-3.958-7.977-8.6z'
        />
      </g>
      <path
        fill='url(#d)'
        d='M5.7 16.68a10 10 0 0 1 9.923-8.76h51.844c6.015 0 10.67 5.272 9.923 11.24l-3.698 29.584A6 6 0 0 1 67.74 54H5.566a4 4 0 0 1-3.969-4.496z'
      />
      <path
        fill='url(#e)'
        d='M5.7 16.68a10 10 0 0 1 9.923-8.76h51.844c6.015 0 10.67 5.272 9.923 11.24l-3.698 29.584A6 6 0 0 1 67.74 54H5.566a4 4 0 0 1-3.969-4.496z'
      />
      <defs>
        <linearGradient
          id='a'
          x1='37.035'
          x2='37.035'
          y1='0'
          y2='54'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#7371E3' />
          <stop offset='1' stopColor='#AEB7F3' />
        </linearGradient>
        <linearGradient
          id='c'
          x1='35.375'
          x2='35.375'
          y1='6.48'
          y2='54'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#fff' />
          <stop offset='1' stopColor='#DCDCDC' />
        </linearGradient>
        <linearGradient
          id='d'
          x1='39.915'
          x2='39.915'
          y1='7.92'
          y2='54'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' />
          <stop offset='1' stopColor='#E3E8FC' />
        </linearGradient>
        <linearGradient
          id='e'
          x1='39.915'
          x2='39.915'
          y1='52.56'
          y2='54'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' stopOpacity='0' />
          <stop offset='1' stopColor='#AEB7F3' />
        </linearGradient>
        <filter
          id='b'
          width='71.635'
          height='51.48'
          x='0'
          y='3.96'
          colorInterpolationFilters='sRGB'
          filterUnits='userSpaceOnUse'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            result='hardAlpha'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          />
          <feOffset dx='-.36' dy='-.36' />
          <feGaussianBlur stdDeviation='.9' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix values='0 0 0 0 0.160784 0 0 0 0 0.160784 0 0 0 0 0.160784 0 0 0 0.1 0' />
          <feBlend
            in2='BackgroundImageFix'
            result='effect1_dropShadow_12380_9544'
          />
          <feBlend
            in='SourceGraphic'
            in2='effect1_dropShadow_12380_9544'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

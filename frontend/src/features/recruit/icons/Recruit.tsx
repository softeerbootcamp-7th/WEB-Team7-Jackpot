import { type SVGProps } from 'react';

export const RecruitIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden='true'
      xmlns='http://www.w3.org/2000/svg'
      width='36'
      height='36'
      fill='none'
      viewBox='0 0 36 36'
      {...props}
    >
      <g clipPath='url(#clipPathA)'>
        <path
          fill='#FFD983'
          d='M32 0H10a4 4 0 0 0-4 4v24H4a4 4 0 0 0 0 8h24a4 4 0 0 0 4-4V8a4 4 0 0 0 0-8'
        />
        <path
          fill='url(#gradientA)'
          d='M32 0H10a4 4 0 0 0-4 4v24H4a4 4 0 0 0 0 8h24a4 4 0 0 0 4-4V8a4 4 0 0 0 0-8'
        />
        <path fill='#8D91EC' d='M8 10h24V8H10L8 7z' />
        <path
          fill='#FFE8B6'
          d='M10 0a4 4 0 0 0-4 4v24.555A3.96 3.96 0 0 0 4 28a4 4 0 1 0 4 4V7.445C8.59 7.789 9.268 8 10 8a4 4 0 0 0 0-8'
        />
        <path
          fill='url(#b)'
          d='M10 0a4 4 0 0 0-4 4v24.555A3.96 3.96 0 0 0 4 28a4 4 0 1 0 4 4V7.445C8.59 7.789 9.268 8 10 8a4 4 0 0 0 0-8'
        />
        <path
          fill='#5B4DD3'
          d='M12 4a2 2 0 1 1-4.001-.001A2 2 0 0 1 12 4M6 32a2 2 0 1 1-4.001-.001A2 2 0 0 1 6 32m24-17a1 1 0 0 1-1 1H11a1 1 0 0 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1'
        />
        <path
          fill='#fff'
          d='M30 15a1 1 0 0 1-1 1H11a1 1 0 0 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1m0 4a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1'
        />
      </g>
      <defs>
        <linearGradient
          id='gradientA'
          x1='18'
          x2='18'
          y1='0'
          y2='36'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AEB7F3' />
          <stop offset='1' stopColor='#E3E8FC' />
        </linearGradient>
        <linearGradient
          id='b'
          x1='7'
          x2='7'
          y1='0'
          y2='36'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#7371E3' />
          <stop offset='1' stopColor='#AEB7F3' />
        </linearGradient>
      </defs>
    </svg>
  );
};

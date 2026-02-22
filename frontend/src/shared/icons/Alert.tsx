import { type SVGProps, useId } from 'react';

export const AlertIcon = (props: SVGProps<SVGSVGElement>) => {
  const clipId = useId();
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='36'
      height='36'
      fill='none'
      viewBox='0 0 36 36'
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width='36' height='36' />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill='#ED2015'
          d='M34.163 28.812 31.247 2.678A3.01 3.01 0 0 0 28.254 0H7.667A3.01 3.01 0 0 0 4.67 2.704L2 28.812z'
        />
        <path
          fill='#A5170F'
          d='M18.07 23.366a9.366 9.366 0 1 0 0-18.732 9.366 9.366 0 0 0 0 18.732'
        />
        <path
          fill='#BDBDBD'
          d='M34 28c.75 0 1.38.442 1.522 1.18l.073.732h-.001L36 34c0 2-2 2-2 2H2s-2 0-2-2l.479-4.82C.621 28.442 1.25 28 2 28z'
        />
        <path
          fill='#FFE1DF'
          d='m29.65 13.63-7.667-1.248 4.539-6.308a.375.375 0 0 0-.523-.523l-6.31 4.538-1.246-7.667a.375.375 0 0 0-.74 0l-1.248 7.667-6.308-4.538a.375.375 0 0 0-.523.523l4.538 6.308-7.668 1.248a.374.374 0 0 0 0 .74l7.668 1.248-4.538 6.308a.375.375 0 0 0 .523.523l6.308-4.538 1.248 7.667a.374.374 0 0 0 .74 0l1.247-7.667 6.308 4.538a.375.375 0 0 0 .523-.523l-4.538-6.308 7.668-1.248a.374.374 0 0 0 0-.74'
        />
      </g>
    </svg>
  );
};

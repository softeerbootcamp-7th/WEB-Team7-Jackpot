import { type SVGProps } from 'react';

export const ScrapIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        fill='#5B4DD3'
        d='M3 2a1 1 0 0 0 0 2zm2 1 .997-.077A1 1 0 0 0 5 2zm16 3 .994.11A1 1 0 0 0 21 5zM5.23 6l-.996.077zm13.109 9.119.07.997zm-10.355.74-.071-.998zM3 3v1h2V2H3zm4.984 12.858.071.998 10.355-.74-.071-.997-.072-.998-10.354.74zm12.2-2.513.994.11.816-7.345L21 6l-.994-.11-.816 7.344zM5 3l-.997.077.23 3L5.232 6l.997-.077-.23-3zm.23 3-.996.077.616 8.017.997-.077.997-.077-.616-8.017zM21 6V5H5.23v2H21zm-2.661 9.119.07.997a3 3 0 0 0 2.769-2.661l-.994-.11-.994-.11a1 1 0 0 1-.923.886zm-10.355.74-.071-.998a1 1 0 0 1-1.069-.92l-.997.076-.997.077a3 3 0 0 0 3.205 2.762z'
      />
      <path
        stroke='#5B4DD3'
        d='M8.5 20.5h.01v.01H8.5zm9 0h.01v.01h-.01z'
        strokeLinejoin='round'
        strokeWidth='3'
      />
    </svg>
  );
};

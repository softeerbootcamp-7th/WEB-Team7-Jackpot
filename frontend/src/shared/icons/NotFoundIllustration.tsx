import { type SVGProps, useId } from 'react';

const NotFoundIllustration = (props: SVGProps<SVGSVGElement>) => {
  const id = useId();

  return (
    <svg
      viewBox='0 0 810 424'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <circle
        opacity='0.7'
        cx='405'
        cy='212'
        r='195'
        transform='rotate(90 405 212)'
        fill={`url(#${id}-paint0)`}
        fillOpacity='0.9'
      />
      <circle
        opacity='0.7'
        cx='404.999'
        cy='211.999'
        r='137.661'
        transform='rotate(90 404.999 211.999)'
        fill={`url(#${id}-paint1)`}
        fillOpacity='0.9'
      />
      <circle
        opacity='0.7'
        cx='405.002'
        cy='212'
        r='90.143'
        transform='rotate(90 405.002 212)'
        fill={`url(#${id}-paint2)`}
        fillOpacity='0.9'
      />
      <path
        d='M407.493 232.995C412.882 226.372 423.509 228.672 425.679 236.93L462.109 375.628C464.142 383.367 457.066 390.42 449.334 388.363L326.605 355.708C319.287 353.76 316.415 344.911 321.195 339.037L407.493 232.995Z'
        fill='#D9D9D9'
      />
      <path
        d='M407.493 232.995C412.882 226.372 423.509 228.672 425.679 236.93L462.109 375.628C464.142 383.367 457.066 390.42 449.334 388.363L326.605 355.708C319.287 353.76 316.415 344.911 321.195 339.037L407.493 232.995Z'
        fill={`url(#${id}-paint3)`}
      />
      <path
        d='M400.835 274.388C401.524 271.067 404.375 268.634 407.763 268.475C412.9 268.234 416.724 273.157 415.219 278.075L402.36 320.08C401.65 322.399 399.483 323.961 397.059 323.901C393.688 323.818 391.215 320.701 391.901 317.399L400.835 274.388Z'
        fill='#BDBDBD'
      />
      <ellipse
        cx='392.886'
        cy='337.865'
        rx='6.19565'
        ry='6.84783'
        transform='rotate(8.22641 392.886 337.865)'
        fill='#BDBDBD'
      />
      <defs>
        <linearGradient
          id={`${id}-paint0`}
          x1='405'
          y1='17'
          x2='405'
          y2='407'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#EAECED' />
          <stop offset='0.234014' stopColor='#F6F7F7' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#F8F8F8' stopOpacity='0' />
          <stop offset='1' stopColor='#EAECED' />
        </linearGradient>
        <linearGradient
          id={`${id}-paint1`}
          x1='404.999'
          y1='74.3379'
          x2='404.999'
          y2='349.66'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#EAECED' />
          <stop offset='0.234014' stopColor='#F6F7F7' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#F8F8F8' stopOpacity='0' />
          <stop offset='1' stopColor='#EAECED' />
        </linearGradient>
        <linearGradient
          id={`${id}-paint2`}
          x1='405.002'
          y1='121.857'
          x2='405.002'
          y2='302.143'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#EAECED' />
          <stop offset='0.234014' stopColor='#F6F7F7' stopOpacity='0' />
          <stop offset='0.771712' stopColor='#F8F8F8' stopOpacity='0' />
          <stop offset='1' stopColor='#EAECED' />
        </linearGradient>
        <linearGradient
          id={`${id}-paint3`}
          x1='373.242'
          y1='223.828'
          x2='394.104'
          y2='407.768'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#DCDCDC' />
          <stop offset='1' stopColor='white' />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default NotFoundIllustration;

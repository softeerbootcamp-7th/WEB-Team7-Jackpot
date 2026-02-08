import { type SVGProps } from 'react';

const LinkAngled = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      focusable='false'
      {...props}
    >
      <path
        d='M6.14949 8.49225L4.28828 10.3535C3.59317 11.0486 3.19343 11.9944 3.20074 12.9884C3.20804 13.9824 3.59903 14.934 4.32712 15.6396C5.0327 16.3677 5.98447 16.7587 6.97832 16.766C7.99484 16.7734 8.91826 16.3962 9.61341 15.7011L11.4746 13.8399M13.852 11.508L15.7132 9.6468C16.4083 8.95169 16.808 8.00589 16.8007 7.01188C16.7934 6.01786 16.4024 5.06629 15.6743 4.36068C14.9689 3.65528 14.0173 3.26427 13.0233 3.25696C12.0293 3.24966 11.0834 3.6267 10.3882 4.32183L8.527 6.18305M7.17832 12.7728L12.762 7.18913'
        stroke='#3D3D3D'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default LinkAngled;

import { type SVGProps } from "react";

interface IProps extends SVGProps<SVGSVGElement> {}

export const NewRecruitIcon = (props: IProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
      {...props}
    >
      <g
        clipPath="url(#a)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.667"
      >
        <path
          fill="#8D91EC"
          stroke="#8D91EC"
          d="M27.997 10.667V24a2.667 2.667 0 1 1-5.333 0V10.667z"
        />
        <path
          fill="#E3E8FC"
          stroke="#E3E8FC"
          d="M4 24V5.334h18.667V24a2.667 2.667 0 0 0 2.666 2.667H6.667A2.667 2.667 0 0 1 4 24"
        />
        <path stroke="#7371E3" d="M17.336 10.667h-8M17.333 16H12" />
      </g>
    </svg>
  );
};

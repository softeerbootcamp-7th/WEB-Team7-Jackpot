import { type SVGProps } from "react";

interface IProps extends SVGProps<SVGSVGElement> {}

export const EditIcon = (props: IProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        stroke="#BDBDBD"
        d="m4 13 3.5 3m-4-3 9.86-10.204a2.718 2.718 0 1 1 3.844 3.845L7 16.5l-3.221.966a1 1 0 0 1-1.245-1.245z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

interface FailIconProps {
  width: string;
  height: string;
}

const FailIcon = ({ width, height }: FailIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width={width} height={height} fill='url(#pattern0_1_16)' />
      <defs>
        <pattern
          id='pattern0_1_16'
          patternContentUnits='objectBoundingBox'
          width='1'
          height='1'
        >
          <use xlinkHref='#image0_1_16' transform='scale(0.015625)' />
        </pattern>
        <image
          id='image0_1_16'
          width={width}
          height={height}
          preserveAspectRatio='none'
          xlinkHref='data:image/png;base64,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'
        />
      </defs>
    </svg>
  );
};

export default FailIcon;

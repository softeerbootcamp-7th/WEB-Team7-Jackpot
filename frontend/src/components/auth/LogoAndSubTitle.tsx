interface LogoAndSubTitleProps {
  TitleLogoComponent: React.ElementType;
  subTitle: string;
  subTitleColor: string;
}

const LogoAndSubTitle = ({
  TitleLogoComponent,
  subTitle,
  subTitleColor,
}: LogoAndSubTitleProps) => {
  return (
    <div className='flex flex-col items-center gap-3'>
      <TitleLogoComponent width='259' height='51' />
      <div
        className={`text-center justify-start ${subTitleColor} text-lg font-bold line-clamp-1 select-none`}
      >
        {subTitle}
      </div>
    </div>
  );
};

export default LogoAndSubTitle;

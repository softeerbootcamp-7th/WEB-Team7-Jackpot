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
        className={`justify-start text-center ${subTitleColor} text-title-s line-clamp-1 font-bold select-none`}
      >
        {subTitle}
      </div>
    </div>
  );
};

export default LogoAndSubTitle;

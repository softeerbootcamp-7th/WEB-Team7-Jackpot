interface AvatarProps {
  size?: 'sm' | 'md';
}

const sizeConfig = {
  sm: {
    container: 'h-9 w-9 rounded-[69.23px]',
    body: 'top-[22.85px] left-[2.08px] h-8 w-8',
    head: 'top-[8.31px] left-[11.77px] h-3 w-3',
    bg: 'bg-purple-50',
    circle: 'bg-purple-200',
  },
  md: {
    container: 'h-12 w-12 rounded-[100px]',
    body: 'top-[33px] left-[3px] h-11 w-11',
    head: 'top-[12px] left-[17px] h-4 w-4',
    bg: 'bg-purple-100',
    circle: 'bg-purple-300',
  },
};

const Avatar = ({ size = 'md' }: AvatarProps) => {
  const config = sizeConfig[size];

  return (
    <div
      className={`relative overflow-hidden ${config.container} ${config.bg}`}
    >
      <div
        className={`absolute rounded-full ${config.body} ${config.circle}`}
      />
      <div
        className={`absolute rounded-full ${config.head} ${config.circle}`}
      />
    </div>
  );
};

export default Avatar;

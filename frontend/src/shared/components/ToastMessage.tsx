import doneIcon from '/images/doneIcon.png';
import failIcon from '/images/failIcon.png';

interface ToastProps {
  message: string;
  status: boolean;
}

const ToastMessage = ({ message, status }: ToastProps) => {
  return (
    <div className='fixed top-0 right-0 left-0 z-50 flex justify-center pt-6'>
      <div className='animate-fade-in-out z-50 flex items-center gap-4 rounded-lg bg-black/60 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md'>
        {status ? (
          <img src={doneIcon} alt='done' className='h-5 w-5' />
        ) : (
          <img src={failIcon} alt='fail' className='h-5 w-5' />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ToastMessage;

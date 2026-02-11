import { useState } from 'react';

import SecondContentAreaHeader from '@/features/upload/components/SecondContentAreaHeader';
import SecondContentItem from '@/features/upload/components/SecondContentItem';

interface SecondContentAreaProps {
  nextStep?: (step: string) => void;
}
const SecondContentArea = ({ nextStep }: SecondContentAreaProps) => {
  const [tabState, setTabState] = useState<1 | 2 | 3>(1);
  return (
    <>
      <SecondContentAreaHeader nextStep={nextStep} />
      <SecondContentItem tabState={tabState} setTabState={setTabState} />
    </>
  );
};

export default SecondContentArea;

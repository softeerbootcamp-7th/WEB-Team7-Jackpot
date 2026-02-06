import { useState } from 'react';

import SecondContentAreaHeader from '@/features/upload/components/SecondContentAreaHeader';
import SecondContentItem from '@/features/upload/components/SecondContentItem';

const SecondContentArea = () => {
  const [tabState, setTabState] = useState<1 | 2 | 3>(1);
  return (
    <>
      <SecondContentAreaHeader />
      <SecondContentItem tabState={tabState} setTabState={setTabState} />
    </>
  );
};

export default SecondContentArea;

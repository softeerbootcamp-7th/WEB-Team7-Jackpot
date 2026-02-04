import { useState } from 'react';

const useScrapNum = () => {
  const [scrapNum, setScrapNum] = useState(0);

  const addScrap = () => {
    setScrapNum((num) => num + 1);
  };

  const deleteScrap = () => {
    if (scrapNum < 0) return;
    setScrapNum((num) => num - 1);
  };

  return {
    scrapNum,
    addScrap,
    deleteScrap,
  };
};

export default useScrapNum;

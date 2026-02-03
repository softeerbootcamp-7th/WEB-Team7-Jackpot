import { useState } from 'react';

const useScrapNum = () => {
  const [scrabNum, setScrabNum] = useState(0);

  const addScrab = () => {
    setScrabNum((num) => num + 1);
  };

  const deleteScrab = () => {
    if (scrabNum < 0) return;
    setScrabNum((num) => num - 1);
  };

  return {
    scrabNum,
    addScrab,
    deleteScrab,
  };
};

export default useScrapNum;

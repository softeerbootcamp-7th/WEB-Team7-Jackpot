import { useState } from 'react';

import Deadline from '@/features/recruit/components/recruitForm/Deadline';
import type { CreateCoverLetterRequest } from '@/features/recruit/types';
import LabeledSelectInput from '@/shared/components/LabeledSelectInput';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';
import type { ApiApplyHalf } from '@/shared/types/coverLetter';
import type { DropdownStateType } from '@/shared/types/dropdown';
import { generateYearList } from '@/shared/utils/dates';

const COMPANY_NAME_LIST = ['삼성전자', 'SK하이닉스', '네이버'];
const JOB_POSITION_LIST = ['개발자', '기획자', '디자이너'];
const yearList = generateYearList(new Date().getFullYear());

interface Props {
  formData: CreateCoverLetterRequest;
  onUpdate: <K extends keyof CreateCoverLetterRequest>(
    key: K,
    value: CreateCoverLetterRequest[K],
  ) => void;
}

const RecruitDetail = ({ formData, onUpdate }: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<DropdownStateType>({
    companyNameDropdown: false,
    jobPositionDropdown: false,
    yearDropdown: false,
    questionTypeDropdown: false,
  });

  const toggleDropdown = (key: keyof DropdownStateType, isOpen: boolean) => {
    setIsDropdownOpen((prev) => ({ ...prev, [key]: isOpen }));
  };

  return (
    <div className='flex w-full flex-col gap-5'>
      <LabeledSelectInput
        label='기업명'
        name='companyName'
        value={formData.companyName}
        onChange={(val) => onUpdate('companyName', val)}
        constantData={COMPANY_NAME_LIST}
        handleDropdown={(isOpen) =>
          toggleDropdown('companyNameDropdown', isOpen)
        }
        isOpen={isDropdownOpen.companyNameDropdown}
        dropdownDirection='bottom'
      />

      <LabeledSelectInput
        label='직무명'
        name='jobPosition'
        value={formData.jobPosition}
        onChange={(val) => onUpdate('jobPosition', val)}
        constantData={JOB_POSITION_LIST}
        handleDropdown={(isOpen) =>
          toggleDropdown('jobPositionDropdown', isOpen)
        }
        isOpen={isDropdownOpen.jobPositionDropdown}
        dropdownDirection='bottom'
      />

      <RecruitPeriodSelectInput
        label='채용 시기'
        nameYear='applyYear'
        nameSeason='applyHalf'
        yearValue={formData.applyYear}
        seasonValue={formData.applyHalf}
        onChangeYear={(val) => onUpdate('applyYear', val)}
        onChangeSeason={(val: ApiApplyHalf) => onUpdate('applyHalf', val)}
        constantData={yearList}
        handleDropdown={(isOpen) => toggleDropdown('yearDropdown', isOpen)}
        isOpen={isDropdownOpen.yearDropdown}
        dropdownDirection='bottom'
      />

      <Deadline
        label='마감일'
        name='deadline'
        value={formData.deadline}
        onChange={(val) => onUpdate('deadline', val)}
      />
    </div>
  );
};

export default RecruitDetail;

import { useState } from 'react';

import Deadline from '@/features/recruit/components/recruitForm/Deadline';
import type { CreateCoverLetterRequest } from '@/features/recruit/types';
import type { DropdownStateType } from '@/features/upload/types/upload'; // 경로 확인
import LabeledSelectInput from '@/shared/components/LabeledSelectInput';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';
import type { ApiApplyHalf } from '@/shared/types/coverLetter';

const COMPANY_NAME_LIST = ['삼성전자', 'SK하이닉스', '네이버'];
const JOB_POSITION_LIST = ['개발자', '기획자', '디자이너'];
const yearList = [2025, 2026, 2027];

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
        value={formData.companyName} // [Controlled]
        onChange={(val) => onUpdate('companyName', val)} // [Controlled]
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
        value={formData.jobPosition} // [Controlled]
        onChange={(val) => onUpdate('jobPosition', val)} // [Controlled]
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
        yearValue={formData.applyYear} // [Controlled]
        seasonValue={formData.applyHalf} // [Controlled]
        onChangeYear={(val) => onUpdate('applyYear', val)} // [Controlled]
        onChangeSeason={(val: ApiApplyHalf) => onUpdate('applyHalf', val)} // [Controlled]
        constantData={yearList}
        handleDropdown={(isOpen) => toggleDropdown('yearDropdown', isOpen)}
        isOpen={isDropdownOpen.yearDropdown}
        dropdownDirection='bottom'
      />

      <Deadline
        label='마감일'
        name='deadline'
        value={formData.deadline} // [Controlled] (Deadline 컴포넌트 내부도 수정 필요할 수 있음)
        onChange={(val) => onUpdate('deadline', val)} // [Controlled]
      />
    </div>
  );
};

export default RecruitDetail;

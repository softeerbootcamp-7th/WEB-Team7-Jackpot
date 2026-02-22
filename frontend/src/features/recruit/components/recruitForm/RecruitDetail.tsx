import { useState } from 'react';

import Deadline from '@/shared/components/Deadline';
import LabeledSelectInput from '@/shared/components/LabeledSelectInput';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';
import { DEFAULT_APPLY_HALF } from '@/shared/constants/createCoverLetter';
// 💡 프로젝트 내 아이콘 경로에 맞게 수정해서 사용해!
import { SharedIcons as SI } from '@/shared/icons';
import type { CreateCoverLetterRequest } from '@/shared/types/coverLetter';
import type { DropdownStateType } from '@/shared/types/dropdown';
import { generateYearList } from '@/shared/utils/dates';

// [박소민] TODO: 상의 후 정하기
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

  // 💡 드롭다운 상태를 토글하는 단일 핸들러 (유지보수 포인트)
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
        yearValue={formData.applyYear ?? new Date().getFullYear()}
        seasonValue={formData.applyHalf ?? DEFAULT_APPLY_HALF}
        onChangeYear={(val) => onUpdate('applyYear', val)}
        onChangeSeason={(val) => onUpdate('applyHalf', val)}
        constantData={yearList}
        handleDropdown={(isOpen) => toggleDropdown('yearDropdown', isOpen)}
        isOpen={isDropdownOpen.yearDropdown}
        dropdownDirection='bottom'
        icon={<SI.DropdownArrowIcon isOpen={isDropdownOpen.yearDropdown} />}
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

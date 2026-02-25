import { useState } from 'react';

import Deadline from '@/shared/components/Deadline';
import LabeledSelectInput from '@/shared/components/LabeledSelectInput';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';
import { DEFAULT_APPLY_HALF } from '@/shared/constants/createCoverLetter';
import {
  useGetCompanies,
  useGetJobPositions,
} from '@/shared/hooks/coverLetterInformationQueries';
import * as SI from '@/shared/icons';
import type { CreateCoverLetterRequest } from '@/shared/types/coverLetter';
import type { DropdownStateType } from '@/shared/types/dropdown';
import { generateYearList } from '@/shared/utils/dates';

const yearList = generateYearList(new Date().getFullYear());

interface Props {
  formData: CreateCoverLetterRequest;
  onUpdate: <K extends keyof CreateCoverLetterRequest>(
    key: K,
    value: CreateCoverLetterRequest[K],
  ) => void;
}

const RecruitDetail = ({ formData, onUpdate }: Props) => {
  const {
    data: companyList,
    isLoading: isGetCompanyListLoading,
    isError: isGetCompanyListError,
  } = useGetCompanies();
  const {
    data: jobPositionList,
    isLoading: isGetJobPositionListLoading,
    isError: isGetJobPositionListError,
  } = useGetJobPositions();
  const [isDropdownOpen, setIsDropdownOpen] = useState<DropdownStateType>({
    companyNameDropdown: false,
    jobPositionDropdown: false,
    yearDropdown: false,
    questionTypeDropdown: false,
  });

  // 드롭다운 상태를 토글하는 단일 핸들러 (유지보수 포인트)
  const toggleDropdown = (key: keyof DropdownStateType, isOpen: boolean) => {
    setIsDropdownOpen((prev) => ({ ...prev, [key]: isOpen }));
  };

  if (isGetCompanyListLoading || isGetJobPositionListLoading) {
    return <div>기업명 또는 직무명 로딩 중...</div>;
  }

  if (isGetCompanyListError || isGetJobPositionListError) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className='flex w-full flex-col gap-5'>
      <LabeledSelectInput
        label='기업명'
        name='companyName'
        value={formData.companyName}
        onChange={(val) => onUpdate('companyName', val)}
        constantData={companyList}
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
        constantData={jobPositionList}
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
        icon={<SI.DropdownArrow isOpen={isDropdownOpen.yearDropdown} />}
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

import { useState } from 'react';

import CoverLetterContentArea from '@/features/upload/components/CoverLetterContentArea';
import CoverLetterList from '@/features/upload/components/CoverLetterList';
import LabeledSelectInput from '@/features/upload/components/LabeledSelectInput';
import { QUESTION_TYPE_LIST } from '@/features/upload/constants/uploadPage';
import useCoverLetterState from '@/features/upload/hooks/useCoverLetterState';
import { UploadPageIcons as I } from '@/features/upload/icons';
import type {
  CoverLetterTabProps,
  DropdownStateType,
} from '@/features/upload/types/upload';
import { yearList } from '@/features/upload/utils/generateAboutDate';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const COMPANY_NAME_LIST: string[] = ['현대자동차', '현대오토에버', '현대카드'];

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const JOB_POSITION_LIST: string[] = ['프론트엔드 개발', '프론트엔드', 'FE'];

const SecondContentItem = ({ tabState, setTabState }: CoverLetterTabProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<DropdownStateType>({
    companyNameDropdown: false,
    jobPositionDropdown: false,
    yearDropdown: false,
    questionTypeDropdown: false,
  });
  const { contents, updateContents } = useCoverLetterState();
  const currentData = contents[tabState];

  // [윤종근] - 추후 리팩토링 예정
  return (
    <div className='flex flex-col gap-6'>
      <CoverLetterList tabState={tabState} setTabState={setTabState} />
      <div className='flex gap-6'>
        <div className='flex-1'>
          <div className='flex flex-col gap-5'>
            <LabeledSelectInput
              label='기업명'
              value={currentData.companyName}
              constantData={COMPANY_NAME_LIST}
              handleChange={(value) =>
                updateContents(tabState, 'companyName', value)
              }
              handleDropdown={(isOpen) =>
                setIsDropdownOpen((prev) => ({
                  ...prev,
                  companyNameDropdown: isOpen,
                }))
              }
              isOpen={isDropdownOpen.companyNameDropdown}
              dropdownDirection='bottom'
            />

            <LabeledSelectInput
              label='직무명'
              value={currentData.jobPosition}
              constantData={JOB_POSITION_LIST}
              handleChange={(value) =>
                updateContents(tabState, 'jobPosition', value)
              }
              handleDropdown={(isOpen) =>
                setIsDropdownOpen((prev) => ({
                  ...prev,
                  jobPositionDropdown: isOpen,
                }))
              }
              isOpen={isDropdownOpen.jobPositionDropdown}
              dropdownDirection='bottom'
            />
            <RecruitPeriodSelectInput
              label='채용 시기'
              yearValue={currentData.recruitPeriod.year}
              seasonValue={currentData.recruitPeriod.season}
              constantData={yearList}
              handleYearChange={(value) =>
                updateContents(tabState, 'year', value)
              }
              handleSeasonChange={(value) =>
                updateContents(tabState, 'season', value)
              }
              handleDropdown={(isOpen) => {
                setIsDropdownOpen((prev) => ({
                  ...prev,
                  yearDropdown: isOpen,
                }));
              }}
              icon={<I.DropdownArrow isOpen={isDropdownOpen.yearDropdown} />}
              isOpen={isDropdownOpen.yearDropdown}
              dropdownDirection='bottom'
            />

            <LabeledSelectInput
              label='문항 유형'
              value={currentData.questionType}
              constantData={QUESTION_TYPE_LIST}
              handleChange={(value) =>
                updateContents(tabState, 'questionType', value)
              }
              handleDropdown={(isOpen) =>
                setIsDropdownOpen((prev) => ({
                  ...prev,
                  questionTypeDropdown: isOpen,
                }))
              }
              isOpen={isDropdownOpen.questionTypeDropdown}
              dropdownDirection='top'
            />
          </div>
        </div>
        <CoverLetterContentArea />
      </div>
    </div>
  );
};

export default SecondContentItem;

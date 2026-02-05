import { useState } from 'react';

import CoverLetterContentArea from '@/components/upload/CoverLetterContentArea';
import CoverLetterList from '@/components/upload/CoverLetterList';
import { UploadPageIcons as I } from '@/components/upload/icons';
import LabeledSelectInput from '@/components/upload/LabeledSelectInput';
import RecruitPeriodSelectInput from '@/components/upload/RecruitPeriodSelectInput';

import type {
  ContentItemType,
  ContentStateType,
  CoverLetterListProps,
  DropdownStateType,
} from '@/types/upload';
import { yearList } from '@/utils/upload/generateYearList';

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const COMPANY_NAME_LIST: string[] = ['현대자동차', '현대오토에버', '현대카드'];

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const QUESTION_TYPE_LIST: string[] = [
  '성장과정',
  '성장경험',
  '성장과정 및 갈등 해결 경험',
];

const SecondContentItem = ({ tabState, setTabState }: CoverLetterListProps) => {
  const [contents, setContents] = useState<ContentStateType>(
    [1, 2, 3].reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          companyName: '',
          jobPosition: '',
          recruitPeriod: {
            year: 2026,
            season: 'first',
          },
          questionType: '',
        },
      }),
      {},
    ),
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState<DropdownStateType>({
    companyNameDropdown: false,
    yearDropdown: false,
    questionTypeDropdown: false,
  });

  const handleContentChange = (
    key: number,
    field: keyof ContentItemType | 'year' | 'season',
    value: string | number,
  ) => {
    setContents((prev) => {
      const currentItem = prev[key];

      if (field === 'year' || field === 'season') {
        return {
          ...prev,
          [key]: {
            ...currentItem,
            recruitPeriod: {
              ...currentItem.recruitPeriod,
              [field]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [key]: {
          ...currentItem,
          [field]: value,
        },
      };
    });
  };

  const currentData = contents[tabState];

  return (
    <div className='flex flex-col gap-6'>
      <CoverLetterList tabState={tabState} setTabState={setTabState} />
      <div className='flex gap-6'>
        <div className='flex-1'>
          <div className='flex flex-col gap-5 '>
            <LabeledSelectInput
              label='기업명'
              value={currentData.companyName}
              constantData={COMPANY_NAME_LIST}
              handleChange={(value) =>
                handleContentChange(tabState, 'companyName', value)
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
              handleChange={(value) =>
                handleContentChange(tabState, 'jobPosition', value)
              }
            />
            <RecruitPeriodSelectInput
              label='채용 시기'
              yearValue={currentData.recruitPeriod.year}
              seasonValue={currentData.recruitPeriod.season}
              constantData={yearList}
              handleYearChange={(value) =>
                handleContentChange(tabState, 'year', value)
              }
              handleSeasonChange={(value) =>
                handleContentChange(tabState, 'season', value)
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
                handleContentChange(tabState, 'questionType', value)
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

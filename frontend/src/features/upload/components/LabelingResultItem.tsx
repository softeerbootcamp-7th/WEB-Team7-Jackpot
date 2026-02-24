import { useState } from 'react';

import type { LabeledQnAListResponse } from '@/features/notification/types/notification';
import CoverLetterContentArea from '@/features/upload/components/CoverLetterContentArea';
import CoverLetterList from '@/features/upload/components/CoverLetterList';
import LabeledSelectInput from '@/features/upload/components/LabeledSelectInput';
import { QUESTION_TYPE_LIST } from '@/features/upload/constants/uploadPage';
import {
  useGetCompanies,
  useGetJobPositions,
} from '@/features/upload/hooks/useUploadQueries';
import type {
  ContentItemType,
  ContentStateType,
} from '@/features/upload/types/upload';
import { yearList } from '@/features/upload/utils/generateAboutDate';
import Deadline from '@/shared/components/Deadline';
import RecruitPeriodSelectInput from '@/shared/components/RecruitPeriodSelectInput';
import * as SI from '@/shared/icons';
import type { DropdownStateType } from '@/shared/types/dropdown';

interface CoverLetterTabProps {
  tabState: number;
  setTabState: (newValue: number) => void;
  qnAState: number;
  setQnAState: (newValue: number) => void;
  data: LabeledQnAListResponse | undefined;
  contents: ContentStateType;
  updateContents: (
    key: number,
    field: keyof ContentItemType | 'year' | 'season',
    value: string | number,
  ) => void;
  updateQnA: (
    tabIndex: number,
    qnaIndex: number,
    field: 'question' | 'answer',
    value: string,
  ) => void;
  isInitialQuestionFailure: boolean;
  isInitialAnswerFailure: boolean;
}

const LabelingResultItem = ({
  tabState,
  setTabState,
  qnAState,
  setQnAState,
  data,
  contents,
  updateContents,
  updateQnA,
  isInitialQuestionFailure,
  isInitialAnswerFailure,
}: CoverLetterTabProps) => {
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
  const currentData = contents[tabState];

  if (isGetCompanyListLoading || isGetJobPositionListLoading) {
    return <div>기업명 또는 직무명 로딩 중...</div>;
  }

  if (isGetCompanyListError || isGetJobPositionListError) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }
  if (!data || !data.coverLetters) {
    console.error('저장할 데이터가 없습니다.');
    return;
  }
  const currentCoverLetterQnAs = data.coverLetters[tabState]?.qnAs;
  const currentQnA = currentCoverLetterQnAs[qnAState];

  // [윤종근] - 추후 리팩토링 예정
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex gap-6'>
        <div className='flex-3'>
          <div className='flex flex-col gap-5'>
            <CoverLetterList
              tabState={tabState}
              setTabState={setTabState}
              tabLength={data.coverLetters.length}
            />
            <LabeledSelectInput
              label='기업명'
              value={currentData.companyName}
              constantData={companyList}
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
              constantData={jobPositionList}
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
              onChangeYear={(value) => updateContents(tabState, 'year', value)}
              onChangeSeason={(value) =>
                updateContents(tabState, 'season', value)
              }
              handleDropdown={(isOpen) => {
                setIsDropdownOpen((prev) => ({
                  ...prev,
                  yearDropdown: isOpen,
                }));
              }}
              icon={<SI.DropdownArrow isOpen={isDropdownOpen.yearDropdown} />}
              isOpen={isDropdownOpen.yearDropdown}
              dropdownDirection='bottom'
            />
            <Deadline
              label='제출일'
              name='deadline'
              value={currentData.deadline}
              onChange={(value) => updateContents(tabState, 'deadline', value)}
              upload={true}
            />

            <LabeledSelectInput
              label='문항 유형'
              value={currentQnA?.questionCategory || ''}
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
              isError={
                !currentQnA?.questionCategory ||
                currentQnA.questionCategory.trim() === ''
              }
            />
          </div>
        </div>
        <CoverLetterContentArea
          qnAState={qnAState}
          setQnAState={setQnAState}
          qnAs={currentCoverLetterQnAs}
          onChangeQnA={(index, field, value) =>
            updateQnA(tabState, index, field, value)
          }
          isInitialQuestionFailure={isInitialQuestionFailure}
          isInitialAnswerFailure={isInitialAnswerFailure}
        />
      </div>
    </div>
  );
};

export default LabelingResultItem;

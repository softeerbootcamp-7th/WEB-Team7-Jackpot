import { useState } from 'react';

import CoverLetterList from '@/components/upload/CoverLetterList';
import { UploadPageIcons } from '@/components/upload/icons';

import { RECRUIT_SEASON_LIST } from '@/constants/constantsInUploadPage';
import type {
  ContentStateType,
  CoverLetterListProps,
  DropdownStateType,
} from '@/types/upload';

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const COMPANY_NAME_LIST: string[] = ['현대자동차', '현대오토에버', '현대카드'];

// [윤종근] - 추후에 지울 예정인 UI 테스트만을 위한 임시 데이터라서 constants에 옮기지 않았습니다.
const QUESTION_TYPE_LIST: string[] = [
  '성장과정',
  '성장경험',
  '성장과정 및 갈등 해결 경험',
];

const SecondContentItem = ({ tabState, setTabState }: CoverLetterListProps) => {
  const today = new Date();
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

  const generateYearList = (year: number) => {
    const yearList = [];
    for (let i = 0; i < 100; i += 1) {
      yearList.push(year - i);
    }

    return yearList;
  };

  const yearList = generateYearList(today.getFullYear());

  const [isDropdownOpen, setIsDropdownOpen] = useState<DropdownStateType>({
    companyNameDropdown: false,
    yearDropdown: false,
    questionTypeDropdown: false,
  });

  const handleContentsCompanyName = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
  ) => {
    const newValue = e.target.value;

    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        companyName: newValue,
      },
    }));
  };
  const handleContentsJobPosition = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
  ) => {
    const newValue = e.target.value;

    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        jobPosition: newValue,
      },
    }));
  };
  const handleContentsQuestionType = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
  ) => {
    const newValue = e.target.value;

    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        jobPosition: newValue,
      },
    }));
  };
  const handleClickContentsCompanyName = (key: number, newValue: string) => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        companyName: newValue,
      },
    }));
  };
  const handleClickContentsQuestionType = (key: number, newValue: string) => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        questionType: newValue,
      },
    }));
  };
  const handleContentsYear = (key: number, newValue: number) => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        recruitPeriod: {
          year: newValue,
          season: prev[key].recruitPeriod.season,
        },
      },
    }));
  };
  const handleContentsSeason = (key: number, newValue: 'first' | 'second') => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        recruitPeriod: {
          year: prev[key].recruitPeriod.year,
          season: newValue,
        },
      },
    }));
  };

  return (
    <div className='flex flex-col gap-6'>
      <CoverLetterList tabState={tabState} setTabState={setTabState} />
      <div className='flex gap-6'>
        <div className='flex-1'>
          <div className='flex flex-col gap-5 '>
            <div className='flex flex-col gap-3'>
              <div className='font-bold text-lg'>
                기업명 <span className='text-red-600'>*</span>
              </div>

              <div className='relative inline-block'>
                <input
                  type='text'
                  value={contents[tabState].companyName}
                  onChange={(e) => handleContentsCompanyName(e, tabState)}
                  className={`w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg focus:outline-none relative ${isDropdownOpen.companyNameDropdown ? 'z-20' : 'z-0'}`}
                  onClick={() =>
                    setIsDropdownOpen((prev) => ({
                      ...prev,
                      companyNameDropdown: !prev.companyNameDropdown,
                    }))
                  }
                />

                {isDropdownOpen.companyNameDropdown && (
                  <>
                    <div
                      className='fixed inset-0 z-10 cursor-default'
                      onClick={() =>
                        setIsDropdownOpen((prev) => ({
                          ...prev,
                          companyNameDropdown: false,
                        }))
                      }
                    />
                    <div className='absolute z-20 w-full max-h-48 mt-2 rounded-lg bg-white shadow-lg overflow-y-scroll select-none'>
                      <div className='flex flex-col p-1 gap-1'>
                        {COMPANY_NAME_LIST.map((name, index) => (
                          <button
                            type='button'
                            onClick={() => {
                              handleClickContentsCompanyName(tabState, name);
                              setIsDropdownOpen((prev) => ({
                                ...prev,
                                companyNameDropdown: false,
                              }));
                            }}
                            key={index}
                            className='w-full text-left px-4 py-[14px] text-[13px] rounded-md text-gray-700 cursor-pointer font-medium hover:bg-gray-50 hover:text-gray-950 hover:font-bold focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='font-bold text-lg'>
                직무명 <span className='text-red-600'>*</span>
              </div>
              <input
                type='text'
                value={contents[tabState].jobPosition}
                onChange={(e) => handleContentsJobPosition(e, tabState)}
                className='w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg text-[15px] focus:outline-none'
              />
            </div>
            <div className='flex flex-col gap-3'>
              <div className='font-bold text-lg'>
                채용 시기 <span className='text-red-600'>*</span>
              </div>
              <div className='flex gap-2 items-center'>
                <div className='relative inline-block'>
                  <button
                    type='button'
                    className={`flex-1 flex items-center justify-between gap-6 bg-gray-50 px-5 py-[14px] relative ${isDropdownOpen.yearDropdown ? 'z-20' : 'z-0'} rounded-lg cursor-pointer`}
                    onClick={() =>
                      setIsDropdownOpen((prev) => ({
                        ...prev,
                        yearDropdown: !prev.yearDropdown,
                      }))
                    }
                  >
                    <div className='font-medium'>
                      {contents[tabState].recruitPeriod.year}
                    </div>
                    <UploadPageIcons.DropdownArrow
                      isOpen={isDropdownOpen.yearDropdown}
                    />
                  </button>

                  {isDropdownOpen.yearDropdown && (
                    <>
                      <div
                        className='fixed inset-0 z-10 cursor-default'
                        onClick={() =>
                          setIsDropdownOpen((prev) => ({
                            ...prev,
                            yearDropdown: false,
                          }))
                        }
                      />
                      <div className='absolute z-20 w-56 max-h-32 mt-2 rounded-lg bg-white shadow-lg overflow-y-scroll select-none'>
                        <div className='flex flex-col p-1 gap-1'>
                          {yearList.map((year) => (
                            <button
                              type='button'
                              onClick={() => {
                                handleContentsYear(tabState, year);
                                setIsDropdownOpen((prev) => ({
                                  ...prev,
                                  yearDropdown: false,
                                }));
                              }}
                              key={year}
                              className='w-full text-left px-4 py-[14px] text-[13px] rounded-md text-gray-700 cursor-pointer font-medium hover:bg-gray-50 hover:text-gray-950 hover:font-bold focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className='flex-3 flex justify-between px-1 py-1 bg-gray-50 rounded-lg'>
                  {RECRUIT_SEASON_LIST.map((each) => (
                    <div key={each.season} className='flex-grow'>
                      <label className='items-center cursor-pointer select-none'>
                        <input
                          type='radio'
                          className='sr-only peer'
                          checked={
                            contents[tabState].recruitPeriod.season ===
                            each.season
                          }
                          onChange={() =>
                            handleContentsSeason(tabState, each.season)
                          }
                        />
                        <div
                          className={`flex justify-center rounded-md ${contents[tabState].recruitPeriod.season === each.season ? 'bg-white' : ''} px-8 py-[10px]`}
                        >
                          <span
                            className={`${contents[tabState].recruitPeriod.season === each.season ? 'font-bold text-gray-950' : 'text-gray-400'}`}
                          >
                            {each.label}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='font-bold text-lg'>
                문항 유형 <span className='text-red-600'>*</span>
              </div>
              <div className='relative inline-block'>
                <input
                  type='text'
                  value={contents[tabState].questionType}
                  onChange={(e) => handleContentsQuestionType(e, tabState)}
                  className={`w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg focus:outline-none relative ${isDropdownOpen.questionTypeDropdown ? 'z-20' : 'z-0'}`}
                  onClick={() =>
                    setIsDropdownOpen((prev) => ({
                      ...prev,
                      questionTypeDropdown: !prev.questionTypeDropdown,
                    }))
                  }
                />

                {isDropdownOpen.questionTypeDropdown && (
                  <>
                    <div
                      className='fixed inset-0 z-10 cursor-default'
                      onClick={() =>
                        setIsDropdownOpen((prev) => ({
                          ...prev,
                          questionTypeDropdown: false,
                        }))
                      }
                    />
                    <div className='absolute z-20 w-full max-h-48 mb-2 bottom-full rounded-lg bg-white shadow-lg overflow-y-scroll select-none'>
                      <div className='flex flex-col p-1 gap-1'>
                        {QUESTION_TYPE_LIST.map((name, index) => (
                          <button
                            type='button'
                            onClick={() => {
                              handleClickContentsQuestionType(tabState, name);
                              setIsDropdownOpen((prev) => ({
                                ...prev,
                                questionTypeDropdown: false,
                              }));
                            }}
                            key={index}
                            className='w-full text-left px-4 py-[14px] text-[13px] rounded-md text-gray-700 cursor-pointer font-medium hover:bg-gray-50 hover:text-gray-950 hover:font-bold focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex-2'>
          <div>
            <div className='flex gap-3 items-center'>
              <div className='px-4 py-2 bg-gray-50 rounded-md text-gray-600 font-bold text-[15px] select-none'>
                1
              </div>
              <div className='font-bold text-lg text-gray-950'>
                인생에서 가장 누워서 자고 싶었던 경험은 무엇이고 어떻게
                극복하셨나요?
              </div>
            </div>
            <div className='flex flex-col gap-3 pl-13'>
              <div className='text-sm text-gray-400'>총 1,038자</div>
              <div className='text-sm text-gray-600'>대학 시절 ...</div>
            </div>
          </div>
          <div className='flex gap-5 justify-self-center'>
            <button className='rounded-[7px] bg-gray-50 p-2 cursor-pointer'>
              <UploadPageIcons.LeftPaginationButtonIcon color='#D9D9D9' />
            </button>
            <div className='flex gap-[10px] font-bold text-lg select-none'>
              <div className='text-purple-500'>1</div>
              <div className='text-gray-400'>/</div>
              <div className='text-gray-400'>3</div>
            </div>
            <button className='rounded-[7px] bg-purple-50 p-2 cursor-pointer'>
              <UploadPageIcons.RightPaginationButtonIcon color='var(--color-purple-200)' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondContentItem;

import { useMemo } from 'react';

import { matchPath, useLocation, useNavigate } from 'react-router';

import type { LibraryView } from '@/features/library/types';

// [박소민] TODO: URL과 탭을 관리하는 상수 값 한번에 관리 (이동)
const SITE_MAP = {
  COMPANY: 'company',
  QUESTION: 'qna',
};

export const useLibraryTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentTab = useMemo<LibraryView>(() => {
    if (matchPath('/library/qna/*', pathname)) {
      return 'QUESTION';
    }

    return 'COMPANY';
  }, [pathname]);

  const handleTabChange = (newTab: LibraryView) => {
    if (newTab === currentTab) return;

    const newTabRoute = SITE_MAP[newTab] || 'company';

    navigate(`./${newTabRoute}`);
  };

  return {
    currentTab,
    handleTabChange,
  };
};

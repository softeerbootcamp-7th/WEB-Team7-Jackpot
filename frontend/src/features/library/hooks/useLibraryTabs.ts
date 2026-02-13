import { useMemo } from 'react';

import { matchPath, useLocation, useNavigate } from 'react-router';

import { SITE_MAP } from '@/features/library/constants';
import type { LibraryView } from '@/features/library/types';

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

    navigate(`/library/${newTabRoute}`);
  };

  return {
    currentTab,
    handleTabChange,
  };
};

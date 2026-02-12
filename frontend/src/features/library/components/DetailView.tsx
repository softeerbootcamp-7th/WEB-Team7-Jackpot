import CompanyDetailView from '@/features/library/components/company/CompanyDetailView';
import QnADetailView from '@/features/library/components/qna/QnADetailView';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';

const DetailView = () => {
  const { currentTab } = useLibraryTabs();

  return currentTab === 'COMPANY' ? <CompanyDetailView /> : <QnADetailView />;
};

export default DetailView;

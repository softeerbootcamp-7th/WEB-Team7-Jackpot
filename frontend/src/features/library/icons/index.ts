// 개별 import
import { ChevronLeftIcon } from '@/features/library/icons/ChevronLeft';
import { CompanyNameLibrary } from '@/features/library/icons/CompanyNameLibrary';
import { EditIcon } from '@/features/library/icons/Edit';
import { FolderIcon } from '@/features/library/icons/Folder';
import { LibraryIcon } from '@/features/library/icons/Library';
import { LibraryFolder } from '@/features/library/icons/LibraryFolder';
import { QnALibrary } from '@/features/library/icons/QnALibrary';
import { QnASearchResultIcon } from '@/features/library/icons/QnASearchResult';
import { QuestionIcon } from '@/features/library/icons/Question';
import { ScrapIcon } from '@/features/library/icons/Scrap';
import { SearchIcon } from '@/shared/icons';

// 개별 export (tree-shaking 가능)
export {
  ChevronLeftIcon,
  CompanyNameLibrary,
  EditIcon,
  FolderIcon,
  LibraryFolder,
  LibraryIcon,
  QnALibrary,
  QnASearchResultIcon,
  QuestionIcon,
  ScrapIcon,
  SearchIcon,
};

// 네임스페이스 export (기존 호환성)
export const LibraryIcons = {
  ChevronLeftIcon,
  CompanyNameLibraryIcon: CompanyNameLibrary,
  EditIcon,
  FolderIcon,
  LibraryIcon,
  LibraryFolderIcon: LibraryFolder,
  QnALibraryIcon: QnALibrary,
  QnASearchResultIcon,
  QuestionIcon,
  ScrapIcon,
  SearchIcon,
} as const;

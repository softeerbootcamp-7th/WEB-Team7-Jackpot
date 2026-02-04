import type { ReactNode } from 'react';

export interface TabContentType<T> {
  name: T;
  label: string;
  icon: ReactNode;
}

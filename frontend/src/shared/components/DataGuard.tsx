import React from 'react';

// 박소민 수정 네이밍
interface DataGuardProps<T> {
  className?: string;
  data: T | null;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

const DataGuard = <T,>({
  className,
  data,
  fallback,
  children,
}: DataGuardProps<T>) => {
  if (!data) {
    return fallback;
  }
  return <div className={className}>{children}</div>;
};

export default DataGuard;

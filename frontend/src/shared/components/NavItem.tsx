import type { ReactNode } from 'react';

import { ReplaceNavLink } from '@/shared/components/ReplaceNavLink';

interface NavItemProps {
  to: string;
  end?: boolean; // NavLink의 end 속성 (기본값: true)
  children: ReactNode;
}

const NavItem = ({ to, end = true, children }: NavItemProps) => {
  return (
    <ReplaceNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `text-body-l cursor-pointer ${
          isActive
            ? 'font-bold text-gray-950'
            : 'font-medium text-gray-600 hover:text-gray-900'
        }`
      }
    >
      {children}
    </ReplaceNavLink>
  );
};

export default NavItem;

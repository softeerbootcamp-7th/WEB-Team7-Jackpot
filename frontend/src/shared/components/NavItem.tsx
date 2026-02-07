import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

interface NavItemProps {
  to: string;
  children: ReactNode;
}

const NavItem = ({ to, children }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-body-l cursor-pointer ${
          isActive
            ? 'font-bold text-gray-950'
            : 'font-medium text-gray-600 hover:text-gray-900'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default NavItem;

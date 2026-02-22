// NavLink을 확장하여, 현재 경로가 메뉴의 범위(하위 포함 여부)에 있는 경우에도 replace: true로 동작하도록 하는 컴포넌트
// 이를 통해 사용자가 이미 해당 메뉴에 있을 때 같은 메뉴를 클릭해도 히스토리가 쌓이지 않도록 함

import {
  matchPath,
  NavLink,
  type NavLinkProps,
  useLocation,
} from 'react-router';

interface Props extends NavLinkProps {
  end?: boolean;
}

export const ReplaceNavLink = ({
  to,
  replace,
  end = true,
  ...props
}: Props) => {
  const location = useLocation();
  const targetPath = typeof to === 'string' ? to : to.pathname || '';

  // 현재 경로가 메뉴의 범위(하위 포함 여부)에 있는지 확인
  const isMatch = matchPath({ path: targetPath, end: end }, location.pathname);

  return (
    <NavLink
      to={to}
      end={end}
      // 핵심: 같은 경로(또는 하위 경로)라면 무조건 replace: true로 동작
      // 이를 통해 히스토리는 쌓이지 않지만, '이동'은 발생하여 리렌더링은 진행됨
      replace={replace ?? !!isMatch}
      {...props}
    />
  );
};

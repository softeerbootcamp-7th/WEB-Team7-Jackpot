// 이 커스텀 훅은 React Router의 useNavigate를 래핑하여,
// 현재 경로와 이동하려는 경로가 동일한 경우에는 navigate 함수를 호출하지 않도록 합니다.
// 이렇게 하면 불필요한 리렌더링을 방지할 수 있습니다.

import {
  matchPath,
  type NavigateOptions,
  useLocation,
  useNavigate,
} from 'react-router';

export const useSmartNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * @param to 이동할 경로
   * @param options navigate 옵션 (replace, state 등)
   * @param end true이면 정확히 일치할 때만, false이면 하위 경로 포함 시 무시
   */
  const smartNavigate = (
    to: string,
    options?: NavigateOptions,
    end: boolean = true,
  ) => {
    // 현재 경로와 목적지가 매칭되는지 확인
    const isMatch = matchPath({ path: to, end }, location.pathname);

    if (isMatch) {
      // 1. 버튼과 같은 상황: 이동 자체를 무시 (리렌더링 X)
      console.log('Same path detected. Navigation skipped.');
      return;
    }

    // 2. 다른 경로라면 정상적으로 이동
    navigate(to, options);
  };

  return smartNavigate;
};

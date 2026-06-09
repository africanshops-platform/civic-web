import KycGuard from './KycGuard';
import CivicUserGuard from '../civic-user/CivicUserGuard';

export function kycProtect(routes) {
  return routes.map((route) => ({
    ...route,
    element: (
      <KycGuard>
        <CivicUserGuard>
          {route.element}
        </CivicUserGuard>
      </KycGuard>
    ),
  }));
}

import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

/**
 * Single source of truth for "is this visitor actually signed in" — the
 * exact same check the top bar's UserMenu uses to decide between showing
 * the account menu vs. Sign In/Sign Up. Public landing/pitch pages must use
 * this instead of unconditionally linking their secondary CTA to /sign-in,
 * which otherwise shows a "Sign in" prompt to users who are already signed
 * in (a real, repeated bug across the civic verticals).
 */
export default function useCivicWebAuth() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = Boolean(user?.role && (!Array.isArray(user.role) || user.role.length > 0));
  return { user, isAuthenticated };
}

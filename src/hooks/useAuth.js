import { useSelector } from 'react-redux';
import { getDisplayName, getFirstName, getInitials } from '../utils/userUtils';

export default function useAuth() {
  const auth = useSelector((s) => s?.auth || {});
  // default to empty object for safer property reads in UI
  const user = auth?.user && typeof auth.user === 'object' ? auth.user : {};
  // For debugging: warn if the stored user is not an object (malformed)
  if (auth?.user && typeof auth.user !== 'object') {
    // Only warn in dev
    if (__DEV__) console.warn('Auth user is malformed (not an object). Coercing to {}', auth.user);
  }
  const token = auth?.token || null;

  return {
    auth,
    // keep 'user' as object even when not authenticated; prefer using auth?.isAuthenticated
    user,
    token,
    displayName: getDisplayName(user),
    firstName: getFirstName(user),
    initials: getInitials(user),
  };
}

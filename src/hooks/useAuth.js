import { useSelector } from 'react-redux';
import { getDisplayName, getFirstName, getInitials } from '../utils/userUtils';
import { useMemo } from 'react';

export default function useAuth() {
  const auth = useSelector((s) => s?.auth || {});
  // Keep `user` as the exact object from the store (or null) to avoid creating a new
  // object on each render which could cause effects to re-run when used as dependency.
  const user = auth?.user && typeof auth.user === 'object' ? auth.user : null;
  // For debugging: warn if the stored user is not an object (malformed)
  if (auth?.user && typeof auth.user !== 'object') {
    // Only warn in dev
    if (__DEV__) console.warn('Auth user is malformed (not an object). Coercing to {}', auth.user);
  }
  const token = auth?.token || null;

  // Memoize derived strings to keep stable references between renders
  const displayName = useMemo(() => getDisplayName(user), [user]);
  const firstName = useMemo(() => getFirstName(user), [user]);
  const initials = useMemo(() => getInitials(user), [user]);

  return {
    auth,
    // user: null when not authenticated
    user,
    token,
    displayName,
    firstName,
    initials,
  };
}

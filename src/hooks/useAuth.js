import { useSelector } from 'react-redux';
import { getDisplayName, getFirstName, getInitials } from '../utils/userUtils';
import { useMemo } from 'react';

export default function useAuth() {
  const auth = useSelector((s) => s?.auth || {});
  
  const user = auth?.user && typeof auth.user === 'object' ? auth.user : null;
 
  if (auth?.user && typeof auth.user !== 'object') {
   
    if (__DEV__) console.warn('Auth user is malformed (not an object). Coercing to {}', auth.user);
  }
  const token = auth?.token || null;

  // Memoize derived strings to keep stable references between renders
  const displayName = useMemo(() => getDisplayName(user), [user]);
  const firstName = useMemo(() => getFirstName(user), [user]);
  const initials = useMemo(() => getInitials(user), [user]);

  return {
    auth,
  
    user,
    token,
    displayName,
    firstName,
    initials,
  };
}

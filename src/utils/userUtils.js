// A small helper utilities file for deriving display name & initials from the user object
export function getFirstName(user) {
  if (!user) return null;
  if (user.fullName) {
    return user.fullName.trim().split(' ')[0];
  }
  if (user.displayName) return user.displayName.trim().split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return null;
}

export function getDisplayName(user) {
  if (!user) return 'Guest';

  // If employer and has company name, show that first
  if (user.role === 'employer') {
    if (user.companyName) return user.companyName;
    if (user.fullName) return user.fullName;
  }

  // Prefer explicit displayName if user sets it
  if (user.displayName) return user.displayName;

  if (user.fullName) return user.fullName;

  // fallback to email prefix
  if (user.email) return user.email.split('@')[0];

  return 'Guest';
}

export function getInitials(user) {
  if (!user) return 'G';
  const display = getDisplayName(user);
  if (!display) return 'G';
  const parts = display.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'G';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

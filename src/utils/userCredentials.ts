export type AppRole = 'admin' | 'student' | 'parent';

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateStudentLoginId(seatNumber: string): string {
  const seat = seatNumber.trim().replace(/\s+/g, '-').toUpperCase();
  return `STU-${seat}`;
}

export function generateParentLoginId(nic: string): string {
  const nicPart = nic.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `PAR-${nicPart}`;
}

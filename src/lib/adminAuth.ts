export const ADMIN_EMAILS = ['piti.coal@gmail.com', 'contacto.tuhistoriaenmi@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

export function checkAdminOrRedirect(user: any): boolean {
  if (!user || typeof user !== 'object') return false;
  return isAdminEmail(user.email);
}

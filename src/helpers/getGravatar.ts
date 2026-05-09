
export function getGravatar(email: string) {
  const normalized = email.split("@")[0].trim().toLowerCase();

  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${normalized}`;
}
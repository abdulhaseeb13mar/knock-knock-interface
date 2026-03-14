export interface CurrentUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  knockBalance: string | number;
}

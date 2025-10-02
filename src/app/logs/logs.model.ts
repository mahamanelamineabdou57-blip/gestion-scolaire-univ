export interface Logs {
  date?: string;
  niveau: 'INFO' | 'WARN' | 'ERROR' | string;
  utilisateur: string;
  message: string;
}
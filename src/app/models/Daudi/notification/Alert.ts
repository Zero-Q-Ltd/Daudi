export interface Alert {
  duration?: number;
  title: string;
  body: string;
  icon?: string;
  alert_type?: 'warning' | 'error' | 'notify' | 'msgnew' | 'success' | 'alert' | 'cash' | 'unprocessedpayment';
}

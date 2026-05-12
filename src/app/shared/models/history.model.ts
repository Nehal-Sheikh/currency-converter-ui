export interface HistoryRecord {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  exchangeRate: number;
  historicalDate?: string;
  timestamp: string;
  source?: 'guest' | 'synced';
}


export interface HistoryResponse {
  data: HistoryRecord[];
}

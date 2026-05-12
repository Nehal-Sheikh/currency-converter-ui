export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface LatestRateResponse {
  data: {
    rate: number;
    isCached: boolean;
    cacheAge?: number;
    warning?: string;
    amount: number;
    result: number;
  };
}

export interface SupportedCurrenciesResponse {
  data: Currency[];
}

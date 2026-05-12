import { Injectable, signal } from '@angular/core';
import { HistoryRecord } from '../../shared/models/history.model';

@Injectable({
  providedIn: 'root'
})
export class GuestHistoryService {
  private STORAGE_KEY = 'guest_history';
  private _history = signal<HistoryRecord[]>(this.loadFromStorage());

  history = this._history.asReadonly();

  saveRecord(record: Partial<HistoryRecord>) {
    const history = this.loadFromStorage();
    const newRecord = { 
      ...record, 
      id: Date.now().toString(), 
      timestamp: new Date().toISOString(),
      source: 'guest'
    } as HistoryRecord;

    
    history.unshift(newRecord);
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
    this._history.set(limitedHistory);
  }

  getRecords(): HistoryRecord[] {
    return this._history();
  }

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this._history.set([]);
  }

  private loadFromStorage(): HistoryRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}

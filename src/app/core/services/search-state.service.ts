import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchFilters } from '../models/book.model';

/* SearchState - Interface for storing complete search state */
export interface SearchState {
  query: string;
  filters: {
    author: string;
    year: number | null;
    subject: string;
  };
  scrollPosition?: number;
}

/**
 * SearchStateService - Manages and persists search state across navigation
 *
 * Purpose: Preserves search query, filters, and scroll position when user
 * navigates away from search page (e.g., to book details) and returns back
 *
 * Usage:
 * - Search component saves state before navigation
 * - Search component restores state on init if available
 * - State is cleared when user explicitly starts new search
 */
@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  /* searchState$ - Observable stream of search state */
  private searchState$ = new BehaviorSubject<SearchState | null>(null);

  constructor() { }

  /* saveState - Saves current search state */
  saveState(state: SearchState): void {
    this.searchState$.next(state);
  }

  /* getState - Gets current search state */
  getState(): SearchState | null {
    return this.searchState$.value;
  }

  /* clearState - Clears saved search state */
  clearState(): void {
    this.searchState$.next(null);
  }

  /* hasState - Checks if there is saved state */
  hasState(): boolean {
    return this.searchState$.value !== null;
  }
}

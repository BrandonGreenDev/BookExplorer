import { Injectable, signal, computed, effect } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'book-explorer-favorites';

  favorites = signal<Book[]>(this.loadFromStorage());

  count = computed(() => this.favorites().length);

  constructor() {
    effect(() => {
      this.saveToStorage(this.favorites());
    });
  }

  addFavorite(book: Book): void {
    const current = this.favorites();
    if (!this.isFavoriteSync(book.key)) {
      this.favorites.set([...current, book]);
    }
  }

  removeFavorite(bookKey: string): void {
    const current = this.favorites();
    this.favorites.set(current.filter(book => book.key !== bookKey));
  }

  toggleFavorite(book: Book): void {
    if (this.isFavoriteSync(book.key)) {
      this.removeFavorite(book.key);
    } else {
      this.addFavorite(book);
    }
  }

  isFavoriteSync(bookKey: string): boolean {
    return this.favorites().some(book => book.key === bookKey);
  }

  private loadFromStorage(): Book[] {
    try {
      const saved = localStorage.getItem(this.FAVORITES_KEY);
      if (saved) {
        return JSON.parse(saved) as Book[];
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
    return [];
  }

  private saveToStorage(favorites: Book[]): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
}

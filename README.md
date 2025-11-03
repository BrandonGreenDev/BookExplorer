# Book Explorer

A modern Angular application that demonstrates reactive programming principles through book search and discovery. Built with a reactive-first approach using RxJS streams, this app showcases efficient API integration, real-time search with intelligent debouncing, and a comprehensive favorites system. The application emphasizes user experience through smooth animations, dark/light theming, and responsive design while maintaining clean architecture with standalone components and service-based data management.

## Technologies Used

- **Angular 20**: Latest framework with standalone components and signals
- **RxJS 7.8**: Reactive programming for search pipeline and state management  
- **Angular Material**: UI components with comprehensive theming system
- **GSAP**: Smooth animations and micro-interactions
- **TypeScript**: Type-safe development with strict mode
- **SCSS**: Advanced styling with CSS custom properties
- **Open Library API**: Free book data source

## Architecture & Business Logic

### Reactive Search Pipeline

The core business logic centers around RxJS search implementation:

```Typescript
// Combines multiple form streams into reactive search pipeline
combineLatest([
  this.searchQuery$,
  this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
  this.searchTypeControl.valueChanges.pipe(startWith(this.searchTypeControl.value)),
  this.genreControl.valueChanges.pipe(startWith(this.genreControl.value))
]).pipe(
  debounceTime(300),           // Wait 300ms after user stops typing
  distinctUntilChanged(),      // Only proceed if values actually changed
  tap(() => this.resetSearchState()),
  switchMap(([query, filters, searchType, genre]) => 
    this.performSearch(query, filters, searchType, genre)
  )
).subscribe(results => this.handleSearchResults(results));
```

**Key Benefits:**
- Automatic search: Triggers on any input change (search text, filters, type)
- Efficient API usage: Debouncing prevents API spam, switchMap cancels outdated requests
- Smart caching: distinctUntilChanged prevents duplicate searches
- Loading states: Reactive loading indicators tied to search pipeline

### Three Search Types Implementation

```typescript
// Dynamic search logic based on selected type
if (searchType === 'genre') {
  return genre && genre.trim() !== '' 
    ? this.bookService.searchBooksByGenre(genre, filters)
    : of([]);
} else {
  return query && query.trim() !== ''
    ? this.bookService.searchBooks(query, filters, searchType)
    : of([]);
}
```

**Search Types:**
1. **Title Search**: Full-text search across book titles
2. **Author Search**: Targeted author name matching  
3. **Genre Search**: Curated dropdown of popular genres

### Favorites System with Signals

Angular signals power the favorites system for reactive state management:

```typescript
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoritesSignal = signal<Book[]>([]);
  
  favorites = this.favoritesSignal.asReadonly();
  favoriteCount = computed(() => this.favorites().length);
  
  toggleFavorite(book: Book): void {
    const current = this.favoritesSignal();
    const exists = current.find(fav => fav.key === book.key);
    
    if (exists) {
      this.favoritesSignal.set(current.filter(fav => fav.key !== book.key));
    } else {
      this.favoritesSignal.set([...current, book]);
    }
    
    this.saveFavorites();
  }
}
```

**Features:**
- **Persistent storage**: localStorage integration
- **Reactive updates**: Signal-based state automatically updates UI
- **Computed properties**: Derived state like favorite count
- **Cross-component sync**: Favorites state shared across all components

### Service Layer Architecture

Clean separation of concerns with dedicated services:

```Typescript
// BookService - API integration
searchBooks(query: string, filters: SearchFilters, type: string): Observable<Book[]> {
  return this.http.get<ApiResponse>(url, { params })
    .pipe(
      map(response => this.transformApiResponse(response)),
      catchError(() => of([])),
      shareReplay(1)
    );
}

// ThemeService - Dark/light mode management  
toggleTheme(): void {
  this.isDarkMode.update(current => !current);
  document.body.classList.toggle('dark-theme', this.isDarkMode());
  localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
}
```

### Component Communication Strategy

Parent-Child Communication:
- `@Input()` for data down
- `@Output()` events for actions up
- Services for cross-component state

Route-Based Data:
- Route parameters for book IDs
- Query parameters for search state persistence
- Navigation state for user flow

## Key Features

### Advanced Search System
- **Real-time search**: 300ms debounced input with request cancellation
- **Multi-modal filtering**: Author, year, and subject filters with AND logic
- **Search type switching**: Title, author, or genre-based search modes
- **Infinite scroll**: Progressive loading for large result sets
- **Empty state handling**: Contextual messages for no results

### Comprehensive Favorites System  
- **Toggle favorites**: Heart icon with smooth animations
- **Persistent storage**: Survives browser sessions
- **Dedicated favorites page**: Grid layout with filtering
- **Batch operations**: Clear all favorites functionality
- **Visual feedback**: Immediate UI updates with signal-based reactivity

### Responsive Design & Theming
- **Dark/light themes**: System preference detection with manual override
- **CSS custom properties**: Consistent theming across components
- **Mobile-first design**: Responsive grid layouts and navigation
- **Accessibility**: ARIA labels, keyboard navigation, high contrast ratios

### Performance Optimizations
- **Lazy loading**: Route-based code splitting
- **OnPush change detection**: Optimized rendering cycles  
- **Image optimization**: Placeholder images and lazy loading
- **Request deduplication**: shareReplay prevents duplicate API calls

## API Integration

**Error Handling:**
- Graceful degradation with empty states
- Retry logic for failed requests
- User-friendly error messages
- Offline state detection

## Development Decisions

**CSS Custom Properties**: Theme system built on CSS variables for consistent styling and easy theme switching

**GSAP Animations**: Professional-grade animations for enhanced user experience without performance penalties

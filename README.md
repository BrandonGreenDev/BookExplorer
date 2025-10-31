# Book Explorer

A modern Angular application for searching and browsing books using the Open Library API. Built with Angular 20, Angular Material, and RxJS for a responsive, reactive user experience.

## Features

- **Search Books**: Real-time search with debouncing for efficient API usage
- **Three Filters**:
  - Author Name (text input)
  - Publication Year (number input)
  - Subject/Genre (dropdown)
- **Responsive Grid Layout**: Book results displayed in a Material Design card grid
- **Book Detail View**: Comprehensive information including cover, description, subjects, and metadata
- **Routing**: Seamless navigation between search and detail views
- **RxJS Integration**: Reactive data flow with automatic search on filter changes

## Technologies Used

- **Angular 20**: Latest Angular framework with standalone components
- **Angular Material**: Pre-built UI components with Material Design
- **RxJS**: Reactive programming for data streams and async operations
- **TypeScript**: Type-safe development
- **Open Library API**: Free, open book data source

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/BookExplorer.git
   cd BookExplorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/app/
├── core/
│   ├── models/
│   │   └── book.model.ts          # TypeScript interfaces for type safety
│   └── services/
│       └── book.service.ts        # API integration with RxJS
├── features/
│   ├── search/
│   │   ├── search.component.ts    # Main search page with 3 filters
│   │   ├── search.component.html
│   │   └── search.component.scss
│   ├── book-detail/
│   │   ├── book-detail.component.ts  # Detailed book view
│   │   ├── book-detail.component.html
│   │   └── book-detail.component.scss
│   └── shared/
│       └── book-card/
│           ├── book-card.component.ts   # Reusable book card
│           ├── book-card.component.html
│           └── book-card.component.scss
├── app.ts                         # Root component
├── app.routes.ts                  # Routing configuration
└── app.config.ts                  # App configuration
```

## Architecture & Design Decisions

### 1. Standalone Components

**Decision**: Use Angular's standalone components instead of NgModules

**Why**:
- Simpler architecture with less boilerplate
- Faster compilation and better tree-shaking
- Recommended approach for new Angular projects
- Easier to understand and maintain

**Trade-off**: Requires Angular 14+ (we're using Angular 20)

### 2. RxJS for Reactive Search

**Decision**: Implement search using RxJS Observables with debouncing and switchMap

**Implementation**:
```typescript
this.books$ = combineLatest([
  this.searchQuery$,
  this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
]).pipe(
  debounceTime(300),           // Wait 300ms after typing stops
  distinctUntilChanged(),      // Only proceed if values changed
  switchMap(([query, filters]) =>
    this.bookService.searchBooks(query, filters)
  )
);
```

**Benefits**:
- **debounceTime(300)**: Reduces API calls by waiting for user to finish typing
- **distinctUntilChanged()**: Prevents duplicate searches with same query
- **switchMap()**: Cancels previous API calls when new search starts
- **Automatic updates**: Search triggers on query OR filter changes

**Trade-off**: More complex than simple button-triggered search, but provides better UX

### 3. Angular Material for UI

**Decision**: Use Angular Material instead of custom CSS or other libraries

**Why**:
- Pre-built, accessible components
- Consistent Material Design aesthetic
- Built-in responsive features
- Well-integrated with Angular

**Components Used**:
- MatCard, MatButton, MatIcon
- MatFormField, MatInput, MatSelect
- MatToolbar, MatProgressSpinner
- MatList, MatChips

**Trade-off**: Adds bundle size (~100KB), but saves development time and ensures accessibility

### 4. Three Filter Types

**Decision**: Implement Author Name (text), Publication Year (number), and Subject (dropdown)

**Why**:
- Covers different filter types (text input, number input, dropdown)
- Matches Open Library API capabilities
- Provides meaningful book discovery options

**Implementation Details**:
- Filters combine with AND logic
- Empty filters are ignored
- All filters are optional
- Clear Filters button resets all at once

**Trade-off**: Could add more filters (language, publisher), but keeping it simple per requirements

### 5. Lazy Loading Routes

**Decision**: Use lazy loading for Search and BookDetail components

**Implementation**:
```typescript
{
  path: 'search',
  loadComponent: () => import('./features/search/search.component')
    .then(m => m.SearchComponent)
}
```

**Benefits**:
- Smaller initial bundle size
- Faster initial page load
- Components loaded only when needed

**Trade-off**: Slight delay on first navigation to each route

### 6. Service Layer Separation

**Decision**: Create BookService to handle all API logic, separate from components

**Why**:
- Separation of concerns (components for UI, service for data)
- Reusable across multiple components
- Easier to test and mock
- Single source of truth for API interactions

**Trade-off**: Adds a layer of abstraction, but improves maintainability

## Function Documentation

### BookService (src/app/core/services/book.service.ts)

#### `searchBooks(query: string, filters: SearchFilters): Observable<Book[]>`
**Purpose**: Searches for books using Open Library API with optional filters

**How it works**:
1. Validates query is not empty
2. Builds HTTP parameters from query and filters
3. Makes GET request to Open Library search endpoint
4. Maps API response to Book model array
5. Returns empty array on error (graceful degradation)

**RxJS Operators**:
- `map()`: Transforms API response to our Book model
- `catchError()`: Handles errors by returning empty array
- `shareReplay(1)`: Caches last result for multiple subscribers

#### `getBookDetails(workId: string): Observable<BookDetail>`
**Purpose**: Fetches detailed information for a specific book

**How it works**:
1. Constructs URL using work ID
2. Makes GET request to works endpoint
3. Returns book details directly
4. Logs and re-throws errors for component to handle

**RxJS Operators**:
- `catchError()`: Logs error and re-throws for component

#### `getCoverImageUrl(coverId: number, size: 'S' | 'M' | 'L'): string`
**Purpose**: Constructs cover image URL from cover ID

**How it works**:
- Takes cover ID and size parameter
- Returns formatted URL string for image binding
- Pure function (no side effects)

#### `getPlaceholderImage(): string`
**Purpose**: Returns SVG placeholder for books without covers

**How it works**:
- Returns data URL with SVG "No Cover" image
- Prevents broken image icons in UI

---

### SearchComponent (src/app/features/search/search.component.ts)

#### `ngOnInit(): void`
**Purpose**: Sets up reactive search pipeline

**How it works**:
1. Combines searchQuery$ and filterForm.valueChanges using combineLatest
2. Applies debouncing (300ms wait after typing)
3. Filters duplicate searches with distinctUntilChanged
4. Switches to new API call with switchMap (cancels previous)
5. Updates loading state before/after API call
6. Assigns result to books$ Observable for template

**Benefits**:
- Automatic search on every keystroke
- Efficient API usage (no spam)
- Cancels outdated requests
- Reacts to filter changes automatically

#### `onSearchInput(value: string): void`
**Purpose**: Emits new search query to trigger reactive pipeline

**How it works**:
1. Called on keyup event in search input
2. Emits value to searchQuery$ BehaviorSubject
3. BehaviorSubject emission triggers combineLatest
4. RxJS pipeline processes search with debouncing

#### `clearFilters(): void`
**Purpose**: Resets all filters to empty values

**How it works**:
1. Resets filterForm to initial empty state
2. Form valueChanges automatically triggers new search
3. Search runs with current query but no filters

#### `onBookClick(workKey: string): void`
**Purpose**: Navigates to book detail view

**How it works**:
1. Receives work key from BookCardComponent
2. Extracts work ID (removes "/works/" prefix)
3. Navigates to /book/:id route using Router

---

### BookDetailComponent (src/app/features/book-detail/book-detail.component.ts)

#### `ngOnInit(): void`
**Purpose**: Fetches book details using work ID from route

**How it works**:
1. Extracts work ID from ActivatedRoute params
2. Calls bookService.getBookDetails(workId)
3. Updates loading/error state via tap operator
4. Handles errors with catchError (returns null)
5. Template uses async pipe for automatic subscription

#### `goBack(): void`
**Purpose**: Navigates back to search page

**How it works**:
- Uses Angular Router to navigate to /search
- User can continue browsing

#### `getCoverUrl(covers?: number[]): string`
**Purpose**: Gets cover image URL or placeholder

**How it works**:
1. Checks if covers array exists and has items
2. Uses bookService to construct URL from first cover ID
3. Returns placeholder if no covers

#### `getDescription(description?: string | { value: string }): string`
**Purpose**: Extracts description text from inconsistent API format

**How it works**:
1. Handles two formats: string or object with 'value' property
2. Returns description text or fallback message
3. Needed because Open Library returns different formats

#### `getAuthorNames(authors?: Array<{ author: { key: string } }>): string`
**Purpose**: Converts author objects to readable string

**How it works**:
1. Extracts author keys from objects
2. Removes "/authors/" prefix
3. Joins with commas
4. Returns "Unknown Author" if none

**Note**: For simplicity, shows author IDs. Could make additional API calls for full names.

---

### BookCardComponent (src/app/features/shared/book-card/book-card.component.ts)

#### `onCardClick(): void`
**Purpose**: Emits bookClick event when user clicks card

**How it works**:
1. Called when user clicks anywhere on card
2. Emits book.key to parent component
3. Parent (SearchComponent) handles navigation

#### `getFirstAuthor(): string`
**Purpose**: Displays single author name instead of array

**How it works**:
1. Checks if author_name array exists
2. Returns first author if available
3. Returns "Unknown Author" fallback

#### `getCoverUrl(): string`
**Purpose**: Provides image URL for template binding

**How it works**:
1. Checks if book has cover_i (cover ID)
2. Uses bookService to construct URL if available
3. Returns placeholder if no cover

## API Integration

### Open Library API Endpoints

1. **Search Endpoint**:
   ```
   GET https://openlibrary.org/search.json?q={query}&author={author}&first_publish_year={year}&subject={subject}
   ```
   - Returns array of books matching criteria
   - Supports multiple filter parameters
   - Limited to 20 results for performance

2. **Book Detail Endpoint**:
   ```
   GET https://openlibrary.org/works/{work_id}.json
   ```
   - Returns detailed book information
   - Includes description, subjects, metadata

3. **Cover Images**:
   ```
   https://covers.openlibrary.org/b/id/{cover_i}-{size}.jpg
   ```
   - Sizes: S (small), M (medium), L (large)
   - Returns book cover image

## Trade-offs & Future Enhancements

### Current Trade-offs

1. **Simple Filter Options**: Only 3 filters implemented
   - **Pro**: Keeps UI clean and simple
   - **Con**: Could add more advanced filtering (language, publisher, ISBN)

2. **Author ID Instead of Full Name**: Detail view shows author IDs
   - **Pro**: Avoids additional API calls
   - **Con**: Less user-friendly than full names
   - **Future**: Could fetch author details from `/authors/{id}.json`

3. **Client-side Filtering**: Filters passed to API
   - **Pro**: Server-side filtering, accurate results
   - **Con**: Can't filter on fields API doesn't support
   - **Alternative**: Could combine server + client filtering

4. **No Caching Strategy**: Results not persisted
   - **Pro**: Always shows fresh data
   - **Con**: Re-fetches on navigation back
   - **Future**: Could implement service-level caching or browser storage

5. **Fixed Result Limit**: Hardcoded to 20 results
   - **Pro**: Fast response, less data transfer
   - **Con**: Can't see more results
   - **Future**: Add pagination or "Load More" button

### Future Enhancements

- Pagination for search results
- Save favorite books (localStorage or backend)
- Advanced search with boolean operators
- Reading list / bookmarks feature
- Share book links
- Dark mode toggle
- Accessibility improvements (ARIA labels, keyboard navigation)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Built with Claude Code as part of a UI take-home challenge.

---

**Note**: This is a demonstration project built to showcase Angular, RxJS, and Material Design best practices.

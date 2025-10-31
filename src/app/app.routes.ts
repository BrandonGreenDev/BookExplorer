import { Routes } from '@angular/router';

/**
 * Application Routes
 *
 * Purpose: Defines the navigation structure for the Book Explorer app
 *
 * Routes:
 * 1. '' (root) - Redirects to /search
 * 2. 'search' - Main search page with filters
 * 3. 'book/:id' - Detail view for a specific book (id is the work ID)
 * 4. '**' (wildcard) - Catches all invalid routes, redirects to /search
 *
 * How routing works:
 * - User lands on / → redirected to /search
 * - User searches and clicks a book → navigates to /book/OL45804W
 * - User types invalid URL → redirected back to /search
 */
export const routes: Routes = [
  // Default route - redirect to search
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  // Search page route
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  // Book detail route with dynamic :id parameter
  {
    path: 'book/:id',
    loadComponent: () => import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent)
  },
  // Wildcard route - handles invalid URLs
  {
    path: '**',
    redirectTo: '/search'
  }
];

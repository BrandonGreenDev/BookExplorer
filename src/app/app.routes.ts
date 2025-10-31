import { Routes } from '@angular/router';

/* Application Routes */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'book/:id',
    loadComponent: () => import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/search'
  }
];

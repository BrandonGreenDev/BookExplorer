import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, tap, takeUntil } from 'rxjs/operators';
import { Book, SearchFilters } from '../../core/models/book.model';
import { BookService } from '../../core/services/book.service';
import { ThemeService } from '../../core/services/theme.service';
import { SearchStateService } from '../../core/services/search-state.service';
import { BookCardComponent } from '../shared/book-card/book-card.component';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    BookCardComponent
  ]
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  /* BehaviorSubject holding current search text */
  searchQuery$ = new BehaviorSubject<string>('');

  /* books - Array of all loaded books */
  books: Book[] = [];

  /* isLoading - initial loading state indicator */
  isLoading = false;

  /* isLoadingMore - loading more results indicator */
  isLoadingMore = false;

  /* currentPage - current pagination page */
  currentPage = 1;

  /* totalResults - total number of results available */
  totalResults = 0;

  /* hasMoreResults - whether there are more results to load */
  hasMoreResults = true;

  /* destroy$ - Subject for cleanup */
  private destroy$ = new Subject<void>();

  /* scrollTrigger - Element ref for intersection observer */
  @ViewChild('scrollTrigger', { read: ElementRef }) scrollTrigger?: ElementRef;

  /* searchControl - FormControl for search input */
  searchControl = new FormControl<string>('', { nonNullable: true });

  /* filterForm - reactive form containing 3 filter controls */
  filterForm = new FormGroup({
    author: new FormControl<string>('', { nonNullable: true }),
    year: new FormControl<number | null>(null),
    subject: new FormControl<string>('', { nonNullable: true })
  });

  /* subjects - array of subject options for dropdown */
  subjects = [
    'Fiction',
    'Science',
    'History',
    'Biography',
    'Fantasy',
    'Mystery',
    'Romance',
    'Children',
    'Science Fiction',
    'Non-fiction'
  ];

  /* currentYear - current year for year filter validation */
  currentYear = new Date().getFullYear();

  constructor(
    private bookService: BookService,
    private router: Router,
    public themeService: ThemeService,
    private searchStateService: SearchStateService
  ) { }

  /* ngOnInit - Initializes reactive search pipeline */
  ngOnInit(): void {
    // Restore state if available (user navigated back from book details)
    const savedState = this.searchStateService.getState();
    if (savedState) {
      this.searchControl.setValue(savedState.query, { emitEvent: false });
      this.filterForm.patchValue(savedState.filters, { emitEvent: false });
      this.searchQuery$.next(savedState.query);
    }

    // Connect search control to search query
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchQuery$.next(value);
    });

    combineLatest([
      this.searchQuery$,
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value)
      )
    ]).pipe(
      // wait 300ms after user stops typing
      debounceTime(300),
      // only proceed if values actually changed
      distinctUntilChanged((prev, curr) => {
        return prev[0] === curr[0] &&
          prev[1].author === curr[1].author &&
          prev[1].year === curr[1].year &&
          prev[1].subject === curr[1].subject;
      }),
      tap(() => {
        this.isLoading = true;
        this.currentPage = 1;
        this.books = [];
        this.hasMoreResults = true;
      }),
      // switch map for cancelling outdated requests
      switchMap(([query, filters]) => {
        const searchFilters: SearchFilters = {
          author: filters.author || undefined,
          year: filters.year || undefined,
          subject: filters.subject || undefined
        };
        return this.bookService.searchBooks(query, searchFilters, 1);
      }),
      tap(result => {
        this.books = result.books;
        this.totalResults = result.totalResults;
        this.hasMoreResults = result.books.length < result.totalResults;
        this.isLoading = false;
        // Re-setup observer after results load
        setTimeout(() => this.setupIntersectionObserver(), 100);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /* Intersection observer instance */
  private observer?: IntersectionObserver;

  /* ngAfterViewInit - Setup intersection observer for infinite scroll */
  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  /* Setup or re-setup intersection observer */
  private setupIntersectionObserver(): void {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      if (this.scrollTrigger) {
        console.log('Setting up intersection observer');
        this.observer = new IntersectionObserver(
          (entries) => {
            console.log('Intersection observed:', {
              isIntersecting: entries[0].isIntersecting,
              hasMoreResults: this.hasMoreResults,
              isLoadingMore: this.isLoadingMore,
              isLoading: this.isLoading,
              booksLength: this.books.length,
              totalResults: this.totalResults
            });

            if (entries[0].isIntersecting && this.hasMoreResults && !this.isLoadingMore && !this.isLoading) {
              console.log('Conditions met - loading more books...');
              this.loadMore();
            }
          },
          { threshold: 0, rootMargin: '200px' }
        );
        this.observer.observe(this.scrollTrigger.nativeElement);
        console.log('Intersection observer set up successfully');
      } else {
        console.warn('Scroll trigger element not found');
      }
    }, 500);
  }

  /* ngOnDestroy - Cleanup subscriptions */
  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* loadMore - Load next page of results */
  loadMore(): void {
    console.log('loadMore called');
    if (!this.hasMoreResults || this.isLoadingMore) {
      console.log('Skipping loadMore - hasMoreResults:', this.hasMoreResults, 'isLoadingMore:', this.isLoadingMore);
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;
    console.log('Fetching page:', this.currentPage);

    const searchFilters: SearchFilters = {
      author: this.filterForm.value.author || undefined,
      year: this.filterForm.value.year || undefined,
      subject: this.filterForm.value.subject || undefined
    };

    this.bookService.searchBooks(this.searchQuery$.value, searchFilters, this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        console.log('Received results:', result.books.length, 'Total before:', this.books.length);
        this.books = [...this.books, ...result.books];
        this.hasMoreResults = this.books.length < result.totalResults;
        this.isLoadingMore = false;
        console.log('Books after append:', this.books.length, 'Has more:', this.hasMoreResults);
      });
  }

  /* onSearchInput - handles input event from search box
   - emits new search query to trigger reactive pipeline */
  onSearchInput(value: string): void {
    this.searchQuery$.next(value);
  }

  /* clearFilters - Resets all filters and search to empty values */
  clearFilters(): void {
    // Clear the search input
    this.searchControl.setValue('');
    // Clear the filters
    this.filterForm.reset({
      author: '',
      year: null,
      subject: ''
    });
    // Clear the books
    this.books = [];
    this.totalResults = 0;
    this.currentPage = 1;
    this.hasMoreResults = true;
    // Clear saved state
    this.searchStateService.clearState();
  }

  /* onBookClick - Handles click event from BookCardComponent
   - navigates to book detail view when user clicks a card */
  onBookClick(workKey: string): void {
    // Save current search state before navigating away
    this.searchStateService.saveState({
      query: this.searchQuery$.value,
      filters: {
        author: this.filterForm.value.author || '',
        year: this.filterForm.value.year || null,
        subject: this.filterForm.value.subject || ''
      }
    });

    // Extract work ID from key
    const workId = workKey.replace('/works/', '');
    this.router.navigate(['/book', workId]);
  }
}

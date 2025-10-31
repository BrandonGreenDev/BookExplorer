import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BookDetail } from '../../core/models/book.model';
import { BookService } from '../../core/services/book.service';
import { gsap } from 'gsap';

/* BookDetailComponent - Displays detailed information about a specific book */
@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ]
})
export class BookDetailComponent implements OnInit, AfterViewInit {
  /* book$ - Observable stream of book details: template uses async pipe for automatic subscription management */
  book$!: Observable<BookDetail | null>;

  /* workId - Open Library work ID from route parameter */
  workId = '';

  /* isLoading - Loading state indicator */
  isLoading = true;

  /* hasError - Error state indicator */
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) { }

  /*  RxJS Operators:
    - tap(): Side effect to update loading/error state
    - catchError(): Handles errors and returns fallback value */
  ngOnInit(): void {
    this.workId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.workId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.book$ = this.bookService.getBookDetails(this.workId).pipe(
      tap(() => {
        this.isLoading = false;
        this.hasError = false;
      }),
      catchError(error => {
        console.error('Error loading book details:', error);
        this.isLoading = false;
        this.hasError = true;
        return of(null);
      })
    );
  }

  /* goBack - Navigates back to search page provides navigation back to search results */
  goBack(): void {
    this.router.navigate(['/search']);
  }

  /* getCoverUrl - Gets cover image URL for the book. Provides cover image URL for template binding */
  getCoverUrl(covers?: number[]): string {
    if (covers && covers.length > 0) {
      return this.bookService.getCoverImageUrl(covers[0], 'L');
    }
    return this.bookService.getPlaceholderImage();
  }

  /* getDescription - Extracts description text from BookDetail. Handles API's inconsistent description format. Open Library API returns description in different formats */
  getDescription(description?: string | { value: string }): string {
    if (!description) {
      return 'No description available.';
    }

    if (typeof description === 'string') {
      return description;
    }

    return description.value || 'No description available.';
  }

  /* getAuthorNames - Extracts author names from authors array. Converts author objects to readable string */
  getAuthorNames(authors?: Array<{ author: { key: string } }>): string {
    if (!authors || authors.length === 0) {
      return 'Unknown Author';
    }

    // Extract author keys and clean them
    // Example: "/authors/x" -> "x"
    const authorKeys = authors.map(a => {
      const key = a.author.key;
      return key.replace('/authors/', '');
    });

    return authorKeys.join(', ');
  }

  /*  hasSubjects - Checks if book has subject tags. Conditionally shows subjects section in template */
  hasSubjects(subjects?: string[]): boolean {
    return subjects !== undefined && subjects.length > 0;
  }

  /* ngAfterViewInit - Animate page entrance with GSAP */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animatePageEntrance();
    }, 100);
  }

  /* animatePageEntrance - Stagger animation for book detail sections */
  private animatePageEntrance(): void {
    const backButton = document.querySelector('.back-button');
    const detailCard = document.querySelector('.detail-card');
    const coverImage = document.querySelector('.cover-image');
    const bookTitle = document.querySelector('.book-title');
    const bookAuthors = document.querySelector('.book-authors');
    const metadata = document.querySelectorAll('.metadata-item');
    const descriptionSection = document.querySelector('.description-section');
    const subjectsSection = document.querySelector('.subjects-section');

    // Animate back button
    if (backButton) {
      gsap.fromTo(backButton,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      );
    }

    // Animate main card
    if (detailCard) {
      gsap.fromTo(detailCard,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1, clearProps: 'all' }
      );
    }

    // Animate cover with rotation
    if (coverImage) {
      gsap.fromTo(coverImage,
        { opacity: 0, scale: 0.8, rotation: -5 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.2)', delay: 0.2, clearProps: 'all' }
      );
    }

    // Animate title
    if (bookTitle) {
      gsap.fromTo(bookTitle,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.3, clearProps: 'all' }
      );
    }

    // Animate authors
    if (bookAuthors) {
      gsap.fromTo(bookAuthors,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.4, clearProps: 'all' }
      );
    }

    // Stagger metadata items
    if (metadata.length > 0) {
      gsap.fromTo(metadata,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.5, clearProps: 'all' }
      );
    }

    // Animate description
    if (descriptionSection) {
      gsap.fromTo(descriptionSection,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.7, clearProps: 'all' }
      );
    }

    // Animate subjects
    if (subjectsSection) {
      gsap.fromTo(subjectsSection,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.8, clearProps: 'all' }
      );

      // Stagger animate chips
      const chips = subjectsSection.querySelectorAll('mat-chip');
      if (chips.length > 0) {
        gsap.fromTo(chips,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.9, clearProps: 'all' }
        );
      }
    }
  }
}

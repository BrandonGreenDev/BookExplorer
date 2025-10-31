import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Book } from '../../../core/models/book.model';
import { BookService } from '../../../core/services/book.service';

/* BookCardComponent - Reusable card component for displaying book preview */
@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  imports: [CommonModule, MatCardModule]
})
export class BookCardComponent {
  /* @Input book - Receives book object from SearchComponent */
  @Input() book!: Book;

  /* @Output bookClick - Event emitted when card is clicked
   * Emits the work key ("/works/x") to parent component */
  @Output() bookClick = new EventEmitter<string>();

  // injects bookservice to supplement getCoverUrl method, BookService.getCoverImageUrl and BookService.getPlaceholderImage.
  constructor(private bookService: BookService) { }

  /**
   * onCardClick handles click event on the card. called when user clicks anywhere on the card, emits the book.key to parent component via bookClick event, parent (SearchComponent) catches event and navigates to detail view */
  onCardClick(): void {
    this.bookClick.emit(this.book.key);
  }

  /* getFirstAuthor extracts the first author name from the book */
  getFirstAuthor(): string {
    return this.book.author_name && this.book.author_name.length > 0
      ? this.book.author_name[0]
      : 'Unknown Author';
  }

  /* getCoverUrl gets the cover image URL for this book */
  getCoverUrl(): string {
    if (this.book.cover_i) {
      return this.bookService.getCoverImageUrl(this.book.cover_i, 'M');
    }
    return this.bookService.getPlaceholderImage();
  }
}

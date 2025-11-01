import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Book } from '../../../core/models/book.model';
import { BookService } from '../../../core/services/book.service';
import { FavoritesService } from '../../../core/services/favorites.service';

/* BookCardComponent - Reusable card component for displaying book preview */
@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule]
})
export class BookCardComponent implements OnInit {
  /* @Input book - Receives book object from SearchComponent */
  @Input() book!: Book;

  /* @Output bookClick - Event emitted when card is clicked
   * Emits the work key ("/works/x") to parent component */
  @Output() bookClick = new EventEmitter<string>();

  /* Computed properties - calculated once in ngOnInit to avoid repeated calculations */
  coverUrl: string = '';
  firstAuthor: string = '';

  // injects bookservice to supplement getCoverUrl method, BookService.getCoverImageUrl and BookService.getPlaceholderImage.
  constructor(
    private bookService: BookService,
    public favoritesService: FavoritesService
  ) { }

  /* ngOnInit - Compute values once when component initializes */
  ngOnInit(): void {
    this.coverUrl = this.book.cover_i
      ? this.bookService.getCoverImageUrl(this.book.cover_i, 'M')
      : this.bookService.getPlaceholderImage();

    this.firstAuthor = this.book.author_name && this.book.author_name.length > 0
      ? this.book.author_name[0]
      : 'Unknown Author';
  }

  /**
   * onCardClick handles click event on the card. called when user clicks anywhere on the card, emits the book.key to parent component via bookClick event, parent (SearchComponent) catches event and navigates to detail view */
  onCardClick(): void {
    this.bookClick.emit(this.book.key);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.book);
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavoriteSync(this.book.key);
  }
}

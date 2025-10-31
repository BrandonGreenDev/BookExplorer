import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { Book, BookDetail, SearchFilters, OpenLibrarySearchResponse } from '../models/book.model';

/* handles all API interactions with Open Library */
@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Base URLs for Open Library API endpoints
  private readonly SEARCH_API = 'https://openlibrary.org/search.json';
  private readonly WORKS_API = 'https://openlibrary.org/works';
  private readonly COVERS_API = 'https://covers.openlibrary.org/b/id';

  constructor(private http: HttpClient) { }

  /* searchBooks searches for books using Open Library API with filters and pagination */
  searchBooks(query: string, filters: SearchFilters = {}, page: number = 1): Observable<{books: Book[], totalResults: number}> {
    // little time saver if no query provided
    if (!query || query.trim().length === 0) {
      return of({books: [], totalResults: 0});
    }

    const limit = 20;
    const offset = (page - 1) * limit;

    // Build http parameters from query and filters
    let params = new HttpParams()
      .set('q', query.trim())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    // Add author filter if provided
    if (filters.author && filters.author.trim().length > 0) {
      params = params.set('author', filters.author.trim());
    }

    // Add year filter if provided
    if (filters.year) {
      params = params.set('first_publish_year', filters.year.toString());
    }

    // Add subject filter if provided
    if (filters.subject && filters.subject.trim().length > 0) {
      params = params.set('subject', filters.subject.trim());
    }

    // Make API request and transform response
    return this.http.get<OpenLibrarySearchResponse>(this.SEARCH_API, { params }).pipe(
      map(response => ({
        books: response.docs || [],
        totalResults: response.numFound || 0
      })),
      catchError(error => {
        console.error('Error searching books:', error);
        return of({books: [], totalResults: 0});
      }),
      shareReplay(1)
    );
  }

  /* getBookDetails fetches detailed information for a specific book */
  getBookDetails(workId: string): Observable<BookDetail> {
    // workId starts with /works/
    const cleanWorkId = workId.startsWith('/works/') ? workId : `/works/${workId}`;
    const url = `https://openlibrary.org${cleanWorkId}.json`;

    return this.http.get<BookDetail>(url).pipe(
      catchError(error => {
        console.error('Error fetching book details:', error);
        throw error;
      })
    );
  }

  /* getCoverImageUrl constructs the URL for a book cover image */
  getCoverImageUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${this.COVERS_API}/${coverId}-${size}.jpg`;
  }

  /* getPlaceholderImage returns a placeholder image URL for books without covers */
  getPlaceholderImage(): string {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="%23ddd"/><text x="50%" y="50%" font-size="20" text-anchor="middle" fill="%23999">No Cover</text></svg>';
  }
}

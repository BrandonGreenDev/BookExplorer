/* Book model representing a search result from Open Library API
 * Used in search results list to display basic book information */
export interface Book {
  key: string;                    
  title: string;                  
  author_name?: string[];         
  first_publish_year?: number;    
  isbn?: string[];                
  cover_i?: number;               
  subject?: string[];             
}

/* BookDetail model representing detailed information from Open Library works endpoint
 * Used in the detail view to show comprehensive book information */
export interface BookDetail {
  title: string;                  
  description?: string | {        
    value: string;
  };
  authors?: Array<{               
    author: {
      key: string;                
    };
  }>;
  subjects?: string[];            
  covers?: number[];              
  first_publish_date?: string;    
  number_of_pages?: number;       
}

/* API Response model for Open Library search endpoint
 * Used internally to map raw API response to our Book model */
export interface OpenLibrarySearchResponse {
  numFound: number;               
  start: number;                  
  docs: Book[];                   
}

/* SearchFilters model representing the three filter options
 * Used to pass filter values from component to service */
export interface SearchFilters {
  author?: string;                
  year?: number;                  
  subject?: string;               
}



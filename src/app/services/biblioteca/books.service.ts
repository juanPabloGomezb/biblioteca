import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define interfaces
export interface BookSearch {
  query: string;
  filters?: {
    titulo?: string;
    autor?: string;
    tema?: string;
    idioma?: string;
  };
}

export interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    language?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    previewLink?: string;
  };
}

export interface BookResponse {
  items?: Book[];
  totalItems: number;
}

// Define typed filter mappings
type FilterCategory = 'titulo' | 'autor' | 'tema' | 'idioma';
type FilterMappingsType = {
  [key in FilterCategory]: {
    [category: string]: string
  }
};

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private apiKey = 'AIzaSyDDfr-GyLMH_EhPhdQxRiGlodX25YIIHLc';

  // Typed filter mappings
  private filterMappings: FilterMappingsType = {
    titulo: {
      'Novela': 'fiction',
      'Ciencia Ficción': 'science fiction',
      'Historia': 'history',
      'Poesía': 'poetry',
      'Biografía': 'biography',
      'Ensayo': 'essay'
    },
    autor: {
      'Nacional': 'national author',
      'Internacional': 'international author',
      'Contemporáneo': 'contemporary',
      'Clásico': 'classic'
    },
    tema: {
      'Educación': 'education',
      'Tecnología': 'technology',
      'Naturaleza': 'nature',
      'Política': 'politics',
      'Psicología': 'psychology',
      'Arte': 'art'
    },
    idioma: {
      'Español': 'es',
      'Inglés': 'en',
      'Francés': 'fr',
      'Alemán': 'de',
      'Portugués': 'pt',
      'Italiano': 'it'
    }
  };

  constructor(private http: HttpClient) {}

  getInitialBooks(maxResults = 10): Observable<BookResponse> {
    const currentYear = new Date().getFullYear();
    const queries = [
      `published_date:${currentYear}`,
      'best sellers',
      'popular books',
      'new releases',
      'trending books'
    ];
  
    // Selecciona una consulta aleatoria
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
    const params = {
      q: randomQuery,
      orderBy: 'relevance',
      key: this.apiKey,
      maxResults: maxResults.toString()
    };
  
    return this.http.get<BookResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  searchBooks(search: BookSearch, startIndex = 0, maxResults = 10): Observable<BookResponse> {
    // Si no hay consulta ni filtros, usa una búsqueda predeterminada
    if (!search.query && (!search.filters || Object.values(search.filters).every(filter => filter === ''))) {
      return this.getInitialBooks(maxResults);
    }
  
    // Build query parts
    let queryParts: string[] = [];
  
    // Add main search query
    if (search.query) {
      queryParts.push(search.query);
    }
  
    // Apply filters con type-safe checking
    if (search.filters) {
      (Object.keys(search.filters) as FilterCategory[]).forEach((key) => {
        const value = search.filters?.[key];
        if (value && this.filterMappings[key]) {
          const mappedValue = this.filterMappings[key][value];
          if (mappedValue) {
            // Different approach based on filter type
            switch(key) {
              case 'titulo':
                queryParts.push(`subject:"${mappedValue}"`);
                break;
              case 'autor':
                queryParts.push(`inauthor:"${mappedValue}"`);
                break;
              case 'tema':
                queryParts.push(`subject:"${mappedValue}"`);
                break;
              case 'idioma':
                queryParts.push(`langrestric:${mappedValue}`);
                break;
            }
          }
        }
      });
    }
  
    // Si no hay términos de búsqueda, usa una consulta predeterminada
    const searchQuery = queryParts.length > 0 ? queryParts.join('+') : 'best books 2024';
  
    // Construct request parameters
    const params = {
      q: searchQuery,
      key: this.apiKey,
      startIndex: startIndex.toString(),
      maxResults: maxResults.toString()
    };
  
    return this.http.get<BookResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
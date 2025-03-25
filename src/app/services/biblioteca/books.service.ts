import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Define interfaces
export interface BookSearch {
  query: string;
  type?: 'title' | 'author' | 'subject' | 'language';
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

// Define a more flexible type for filter mappings
type FilterMappingsType = {
  [key: string]: { [filterOption: string]: string }
};

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private apiKey = 'AIzaSyDDfr-GyLMH_EhPhdQxRiGlodX25YIIHLc';

  // Updated filter mappings with the new type
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
      'Contemporáneo': 'contemporary author',
      'Clásico': 'classic author'
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

  // Método para obtener libros destacados al inicio
  getInitialBooks(maxResults = 10): Observable<BookResponse> {
    const params = {
      q: 'best books 2024',
      orderBy: 'relevance',
      key: this.apiKey,
      maxResults: maxResults.toString()
    };

    return this.http.get<BookResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Initial Books Response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Método de búsqueda actualizado para manejar filtros más robustamente
  searchBooks(search: BookSearch, startIndex = 0, maxResults = 10): Observable<BookResponse> {
    // Construir la query base
    let queryParts: string[] = [];

    // Agregar término de búsqueda principal
    if (search.query) {
      queryParts.push(search.query);
    }

    // Aplicar filtros de manera más flexible
    if (search.filters) {
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value) {
          // Use type assertion to bypass the strict typing
          const mapping = this.filterMappings[key as keyof FilterMappingsType];
          if (mapping && mapping[value]) {
            queryParts.push(`subject:${mapping[value]}`);
          }
        }
      });
    }

    // Construir parámetros de la solicitud
    const params = {
      q: queryParts.join('+'),
      key: this.apiKey,
      startIndex: startIndex.toString(),
      maxResults: maxResults.toString()
    };

    return this.http.get<BookResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Search Books Response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
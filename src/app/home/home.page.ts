import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { BooksService, Book, BookSearch } from '../services/biblioteca/books.service';
import { ReferenciaService, Referencia } from '../services/referencia.service';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    RouterModule  
  ],
  providers: [BooksService, ReferenciaService]
})
export class HomePage implements OnInit {
  books: Book[] = [];
  searchQuery = '';
  currentStartIndex = 0;
  totalItems = 0;
  isLoading = false;
  isSearching = false;
  noResultsFound = false;

  // Existing category arrays
  tituloCategories = ['Novela', 'Ciencia Ficción', 'Historia', 'Poesía', 'Biografía', 'Ensayo'];
  autorCategories = ['Nacional', 'Internacional', 'Contemporáneo', 'Clásico'];
  temaCategories = ['Educación', 'Tecnología', 'Naturaleza', 'Política', 'Psicología', 'Arte'];
  idiomaCategories = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'];

  // States of filter selection
  selectedFilters = {
    titulo: '',
    autor: '',
    tema: '',
    idioma: ''
  };

  constructor(
    private booksService: BooksService,
    private referenciaService: ReferenciaService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadInitialBooks();
  }

  // Filter methods
  filterTitulo(category: string) {
    this.selectedFilters.titulo = this.selectedFilters.titulo === category ? '' : category;
    this.searchBooks();
  }

  filterAutor(category: string) {
    this.selectedFilters.autor = this.selectedFilters.autor === category ? '' : category;
    this.searchBooks();
  }

  filterTema(category: string) {
    this.selectedFilters.tema = this.selectedFilters.tema === category ? '' : category;
    this.searchBooks();
  }

  filterIdioma(category: string) {
    this.selectedFilters.idioma = this.selectedFilters.idioma === category ? '' : category;
    this.searchBooks();
  }

  // Load initial books
  async loadInitialBooks() {
    const loading = await this.loadingController.create({
      message: 'Cargando libros...'
    });
    await loading.present();

    this.currentStartIndex = 0;
    this.searchOrLoadBooks(() => loading.dismiss());
  }

  // Search books
  async searchBooks() {
    const loading = await this.loadingController.create({
      message: 'Buscando libros...'
    });
    await loading.present();

    this.books = [];
    this.currentStartIndex = 0;
    this.isSearching = true;
    this.noResultsFound = false;

    this.searchOrLoadBooks(() => loading.dismiss());
  }

  // Manual load more books
  loadMoreBooksManually() {
    this.currentStartIndex += 10;
    this.searchOrLoadBooks();
  }

  // Infinite scroll load more
  loadMoreBooks(event: any) {
    if (this.books.length < this.totalItems) {
      this.currentStartIndex += 10;
      this.searchOrLoadBooks(() => event.target.complete());
    } else {
      event.target.complete();
    }
  }

  // Centralized search and load method
  private searchOrLoadBooks(onComplete?: () => void) {
    const searchParams: BookSearch = {
      query: this.searchQuery?.trim() || '',
      filters: this.selectedFilters
    };
  
    this.isLoading = true;
  
    this.booksService.searchBooks(searchParams, this.currentStartIndex)
      .subscribe({
        next: (response) => {
          if (response.items) {
            // Filtrar libros duplicados antes de añadirlos
            const newBooks = response.items.filter(
              newBook => !this.books.some(existingBook => existingBook.id === newBook.id)
            );
  
            this.books = [...this.books, ...newBooks];
            this.totalItems = response.totalItems;
            this.isLoading = false;
            this.noResultsFound = this.books.length === 0;
            
            if (onComplete) {
              onComplete();
            }
          }
        },
        error: (error) => {
          this.presentToast('Error al cargar libros');
          this.isLoading = false;
          
          if (onComplete) {
            onComplete();
          }
        }
      });
  }

  // Toast presentation method
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Clear filters
  clearFilters() {
    this.selectedFilters = {
      titulo: '',
      autor: '',
      tema: '',
      idioma: ''
    };
    this.searchQuery = '';
    this.loadInitialBooks();
  }

  // Check if any filter is active
  hasActiveFilters(): boolean {
    return Object.values(this.selectedFilters).some(filter => filter !== '');
  }

  // Save reference
  async guardarReferencia(libro: Book) {
    if (!this.authService.isAuthenticated) {
      await this.mostrarAlertaInicioSesion();
      return;
    }

    const referencia: Omit<Referencia, 'usuario'> = {
      autor: libro.volumeInfo.authors?.join(', ') || 'Autor desconocido',
      titulo: libro.volumeInfo.title,
      fechaguardado: new Date(),
      etiquetas: [
        ...(libro.volumeInfo.categories || ['Sin categoría']),
        libro.volumeInfo.language || 'Sin idioma'
      ]
    };

    try {
      await this.referenciaService.addReferencia(referencia);
      this.presentToast('Referencia guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar referencia', error);
      this.presentToast('Error al guardar referencia');
    }
  }

  // Login alert
  async mostrarAlertaInicioSesion() {
    const alert = await this.alertController.create({
      header: 'Iniciar Sesión',
      message: 'Debes iniciar sesión para guardar referencias',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Iniciar Sesión',
          handler: () => {
            // Add navigation to login page if needed
            // this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}
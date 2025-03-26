import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { BooksService, Book, BookSearch } from '../services/biblioteca/books.service';
import { ReferenciaService, Referencia } from '../services/referencia.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule
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
  tituloCategories = ['Novela', 'Ciencia Ficción', 'Historia', 'Poesía', 'Biografía', 'Ensayo'];
  autorCategories = ['Nacional', 'Internacional', 'Contemporáneo', 'Clásico'];
  temaCategories = ['Educación', 'Tecnología', 'Naturaleza', 'Política', 'Psicología', 'Arte'];
  idiomaCategories = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'];
  filterTitulo(category: string) {
    // Lógica para filtrar por título
    // Actualiza la lista de libros 'books' en base a la categoría seleccionada
    console.log('Filtrando por título:', category);
  }

  filterAutor(category: string) {
    // Lógica para filtrar por autor
    // Actualiza la lista de libros 'books' en base a la categoría seleccionada
    console.log('Filtrando por autor:', category);
  }

  filterTema(category: string) {
    // Lógica para filtrar por tema
    // Actualiza la lista de libros 'books' en base a la categoría seleccionada
    console.log('Filtrando por tema:', category);
  }

  filterIdioma(category: string) {
    // Lógica para filtrar por idioma
    // Actualiza la lista de libros 'books' en base a la categoría seleccionada
    console.log('Filtrando por idioma:', category);
  }

  // Hardcoded filter options
  filterOptions = {
    titulo: [
      { value: '', label: 'Todos los Títulos' },
      { value: 'Novela', label: 'Novela' },
      { value: 'Ciencia Ficción', label: 'Ciencia Ficción' },
      { value: 'Historia', label: 'Historia' },
      { value: 'Poesía', label: 'Poesía' },
      { value: 'Biografía', label: 'Biografía' },
      { value: 'Ensayo', label: 'Ensayo' }
    ],
    autor: [
      { value: '', label: 'Todos los Autores' },
      { value: 'Nacional', label: 'Nacional' },
      { value: 'Internacional', label: 'Internacional' },
      { value: 'Contemporáneo', label: 'Contemporáneo' },
      { value: 'Clásico', label: 'Clásico' }
    ],
    tema: [
      { value: '', label: 'Todos los Temas' },
      { value: 'Educación', label: 'Educación' },
      { value: 'Tecnología', label: 'Tecnología' },
      { value: 'Naturaleza', label: 'Naturaleza' },
      { value: 'Política', label: 'Política' },
      { value: 'Psicología', label: 'Psicología' },
      { value: 'Arte', label: 'Arte' }
    ],
    idioma: [
      { value: '', label: 'Todos los Idiomas' },
      { value: 'Español', label: 'Español' },
      { value: 'Inglés', label: 'Inglés' },
      { value: 'Francés', label: 'Francés' },
      { value: 'Alemán', label: 'Alemán' },
      { value: 'Portugués', label: 'Portugués' },
      { value: 'Italiano', label: 'Italiano' }
    ]
  };

  // Estados de selección de filtros
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

  async loadInitialBooks() {
    const loading = await this.loadingController.create({
      message: 'Cargando libros...'
    });
    await loading.present();

    this.booksService.getInitialBooks()
      .subscribe({
        next: (response) => {
          loading.dismiss();
          if (response.items && response.items.length > 0) {
            this.books = response.items;
            this.totalItems = response.totalItems;
          } else {
            this.presentToast('No se encontraron libros');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.presentToast('Error al cargar libros');
        }
      });
  }

  onFilterChange() {
    console.log('Filtros seleccionados:', this.selectedFilters);
    this.searchBooks();
  }

  async searchBooks() {
    console.log('Iniciando búsqueda con filtros:', this.selectedFilters);

    if (!this.searchQuery && !this.hasActiveFilters()) {
      this.presentToast('Por favor ingrese un término de búsqueda o seleccione un filtro');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Buscando libros...'
    });
    await loading.present();

    this.books = [];
    this.currentStartIndex = 0;
    this.isSearching = true;
    this.noResultsFound = false;

    const searchParams: BookSearch = {
      query: this.searchQuery?.trim() || '',
      filters: this.selectedFilters
    };

    console.log('Parámetros de búsqueda:', searchParams);

    this.booksService.searchBooks(searchParams, this.currentStartIndex)
      .subscribe({
        next: (response) => {
          loading.dismiss();

          console.log('Respuesta de búsqueda:', response);

          if (response.items && response.items.length > 0) {
            this.books = response.items;
            this.totalItems = response.totalItems;
            this.isSearching = false;
            this.noResultsFound = false;
          } else {
            this.noResultsFound = true;
            this.presentToast('No se encontraron libros');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSearching = false;
          this.noResultsFound = true;
          console.error('Error en búsqueda:', error);
          this.presentToast('Error al buscar libros');
        }
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  loadMoreBooks(event: any) {
    if (this.books.length < this.totalItems) {
      this.currentStartIndex += 10;

      const searchParams: BookSearch = {
        query: this.searchQuery?.trim() || '',
        filters: this.selectedFilters
      };

      this.booksService.searchBooks(searchParams, this.currentStartIndex)
        .subscribe({
          next: (response) => {
            if (response.items) {
              this.books = [...this.books, ...response.items];
            }
            event.target.complete();
          },
          error: () => {
            event.target.complete();
          }
        });
    } else {
      event.target.complete();
    }
  }

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

  hasActiveFilters(): boolean {
    return Object.values(this.selectedFilters).some(filter => filter !== '');
  }

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
            // this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}

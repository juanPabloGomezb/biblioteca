import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { FirestoreService } from '../services/firestore/firestore.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.page.html',
  styleUrls: ['./pruebas.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    CommonModule, 
    FormsModule
  ]
})
export class PruebasPage implements OnInit {
  textToUpload: string = '';
  fileToUpload: File | null = null;
  referencias: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private auth: Auth
  ) { }

  ngOnInit() {
    this.obtenerReferencias();
  }

  async uploadText() {
    try {
      if (this.textToUpload) {
        await this.firestoreService.uploadTextFile(this.textToUpload, `pruebas/texto-${Date.now()}.txt`);
        console.log('Texto subido exitosamente');
      }
    } catch (error) {
      console.error('Error al subir texto:', error);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
    }
  }

  async uploadFile() {
    try {
      if (this.fileToUpload) {
        await this.firestoreService.uploadFile(this.fileToUpload, `pruebas/${this.fileToUpload.name}`);
        console.log('Archivo subido exitosamente');
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  }

  async listFiles() {
    try {
      const files = await this.firestoreService.listFiles('pruebas/');
      console.log('Archivos en la carpeta pruebas:', files);
    } catch (error) {
      console.error('Error al listar archivos:', error);
    }
  }

  obtenerReferencias() {
    const usuarioId = this.auth.currentUser?.uid;

    if (!usuarioId) {
      console.warn('No hay usuario autenticado.');
      return;
    }

    this.firestoreService.obtenerReferencias(usuarioId).subscribe({
      next: (data: any[]) => {  // Especificamos que 'data' es un array de 'any'
        this.referencias = data;
        console.log('Referencias obtenidas:', this.referencias);
      },
      error: (error: any) => console.error('Error al obtener referencias:', error)
    });
  }
}

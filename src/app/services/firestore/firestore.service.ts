import { Injectable } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadString, 
  uploadBytes, 
  getDownloadURL, 
  listAll, 
  deleteObject 
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private storage: Storage) { }

  // Método para subir un texto simple como un archivo
  async uploadTextFile(text: string, path: string) {
    try {
      const storageRef = ref(this.storage, path);
      const result = await uploadString(storageRef, text);
      console.log('Archivo de texto subido con éxito:', result);
      return result;
    } catch (error) {
      console.error('Error al subir archivo de texto:', error);
      throw error;
    }
  }

  // Método para subir un archivo binario
  async uploadFile(file: File, path: string) {
    try {
      const storageRef = ref(this.storage, path);
      const result = await uploadBytes(storageRef, file);
      console.log('Archivo binario subido con éxito:', result);
      return result;
    } catch (error) {
      console.error('Error al subir archivo binario:', error);
      throw error;
    }
  }

  // Método para obtener la URL de descarga de un archivo
  async getFileDownloadURL(path: string) {
    try {
      const storageRef = ref(this.storage, path);
      const url = await getDownloadURL(storageRef);
      console.log('URL de descarga:', url);
      return url;
    } catch (error) {
      console.error('Error al obtener URL de descarga:', error);
      throw error;
    }
  }

  // Método para listar archivos en una carpeta
  async listFiles(path: string) {
    try {
      const listRef = ref(this.storage, path);
      const result = await listAll(listRef);
      console.log('Archivos en la carpeta:', result);
      return result;
    } catch (error) {
      console.error('Error al listar archivos:', error);
      throw error;
    }
  }

  // Método para eliminar un archivo
  async deleteFile(path: string) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      console.log('Archivo eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }
}
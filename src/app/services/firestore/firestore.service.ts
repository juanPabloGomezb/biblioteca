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

import { Firestore, collection, addDoc, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private storage: Storage, private firestore: Firestore) { }

  // =======================
  // 🔥 FIREBASE STORAGE
  // =======================

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

  // =======================
  // 🔥 FIRESTORE DATABASE
  // =======================

  // Guardar referencia en Firestore
  async guardarReferencia(usuarioId: string, titulo: string, url: string, etiquetas: string[]) {
    try {
      const referenciaCollection = collection(this.firestore, 'referencias');

      const referencia = {
        usuario: usuarioId,
        titulo: titulo,
        url: url,
        etiquetas: etiquetas,
        fechaGuardado: Timestamp.now() // Agregar marca de tiempo
      };

      await addDoc(referenciaCollection, referencia);
      console.log('✅ Referencia guardada en Firestore:', referencia);
    } catch (error) {
      console.error('❌ Error al guardar referencia:', error);
      throw error;
    }
  }

  // Obtener referencias de Firestore por usuario
  obtenerReferencias(usuarioId: string): Observable<any[]> {
    const referenciaCollection = collection(this.firestore, 'referencias');
    const q = query(referenciaCollection, where('usuario', '==', usuarioId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Obtener referencias por etiqueta
  obtenerReferenciasPorEtiqueta(etiqueta: string): Observable<any[]> {
    const referenciaCollection = collection(this.firestore, 'referencias');
    const q = query(referenciaCollection, where('etiquetas', 'array-contains', etiqueta));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}

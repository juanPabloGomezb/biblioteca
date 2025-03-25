import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { query, where } from '@angular/fire/firestore';

export interface Referencia {
  id?: string; // Añadida propiedad id opcional
  autor: string;
  titulo: string;
  usuario: {
    uid: string;
    email: string;
    displayName?: string;
  };
  fechaguardado: Date;
  etiquetas: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReferenciaService {
  private referenciasCollection = collection(this.firestore, 'referencias');

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Agregar una nueva referencia con el usuario actual
  addReferencia(referencia: Omit<Referencia, 'usuario'>) {
    // Obtener el usuario actual
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Crear el objeto de referencia completo
    const referenciaConUsuario: Referencia = {
      ...referencia,
      usuario: {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || ''
      }
    };

    // Agregar la referencia a Firestore
    return addDoc(this.referenciasCollection, referenciaConUsuario);
  }

  // Obtener referencias del usuario actual
  getReferenciasUsuarioActual(): Observable<Referencia[]> {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Filtrar referencias por el UID del usuario actual
    const usuarioReferenciaQuery = query(
      this.referenciasCollection,
      where('usuario.uid', '==', currentUser.uid)
    );

    return collectionData(usuarioReferenciaQuery, { idField: 'id' }) as Observable<Referencia[]>;
  }

  // Obtener todas las referencias (opcional)
  getReferencias(): Observable<Referencia[]> {
    return collectionData(this.referenciasCollection, { idField: 'id' }) as Observable<Referencia[]>;
  }

  // Eliminar una referencia por ID
  deleteReferencia(id: string) {
    const ref = doc(this.firestore, `referencias/${id}`);
    return deleteDoc(ref);
  }
}
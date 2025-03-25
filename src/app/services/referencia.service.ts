import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Referencia {
  autor: string;
  titulo: string;
  usuario: string;
  fechaguardado: Date;
  etiquetas: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReferenciaService {
  private referenciasCollection = collection(this.firestore, 'referencias');

  constructor(private firestore: Firestore) {}

  // Agregar una nueva referencia
  addReferencia(referencia: Referencia) {
    return addDoc(this.referenciasCollection, referencia);
  }

  // Obtener todas las referencias
  getReferencias(): Observable<Referencia[]> {
    return collectionData(this.referenciasCollection, { idField: 'id' }) as Observable<Referencia[]>;
  }

  // Eliminar una referencia por ID
  deleteReferencia(id: string) {
    const ref = doc(this.firestore, `referencias/${id}`);
    return deleteDoc(ref);
  }
}

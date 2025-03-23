import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  listAll,
  getDownloadURL 
} from '@angular/fire/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    private router: Router
  ) {
    // Observar cambios en el estado de autenticación
    this.auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
    });
  }

  // Iniciar sesión con email y contraseña
  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    // Guardar información de sesión
    await this.saveUserSession(userCredential.user);
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    return userCredential;
  }

  // Registrarse con email y contraseña
  async registerWithEmail(email: string, password: string, displayName: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Actualizar el perfil con el nombre del usuario
    await this.updateUserProfile(userCredential.user, { displayName });
    
    // Crear carpeta en Storage
    await this.createUserFolder(email);
    
    // Guardar información adicional en Firestore
    await this.saveUserData(userCredential.user, { displayName });
    
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    
    return userCredential;
  }

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    
    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Es un nuevo usuario, crear carpeta en Storage
      await this.createUserFolder(userCredential.user.email || 'unknown');
      
      // Guardar información en Firestore
      await this.saveUserData(userCredential.user, {
        displayName: userCredential.user.displayName || 'Usuario',
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL
      });
    }
    
    // Guardar información de sesión
    await this.saveUserSession(userCredential.user);
    
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    
    return userCredential;
  }

  // Crear carpeta para el usuario en Storage
  private async createUserFolder(email: string): Promise<void> {
    try {
      // Firebase Storage no tiene el concepto de "carpetas" real, pero podemos
      // simular una estructura de carpetas utilizando nombres de archivos con rutas
      // Creamos un archivo vacío para representar la carpeta
      const folderRef = ref(this.storage, `users/${email}/.folder`);
      
      // Verificar si la carpeta ya existe listando su contenido
      try {
        const listResult = await listAll(ref(this.storage, `users/${email}`));
        if (listResult.items.length > 0 || listResult.prefixes.length > 0) {
          console.log('La carpeta ya existe');
          return;
        }
      } catch (error) {
        console.log('La carpeta no existe, creándola...');
      }
      
      // Crear un archivo vacío para simular la carpeta
      const emptyBlob = new Blob([''], { type: 'text/plain' });
      await uploadBytes(folderRef, emptyBlob);
      console.log('Carpeta creada con éxito');
    } catch (error) {
      console.error('Error al crear la carpeta del usuario:', error);
      throw error;
    }
  }

  // Guardar información del usuario en Firestore
  private async saveUserData(user: User, additionalData: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: additionalData.displayName || user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...additionalData
      }, { merge: true });
      
      console.log('Información del usuario guardada con éxito');
    } catch (error) {
      console.error('Error al guardar la información del usuario:', error);
      throw error;
    }
  }

  // Guardar información de sesión
  private async saveUserSession(user: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      
      await setDoc(userRef, {
        lastLogin: new Date()
      }, { merge: true });
      
      console.log('Sesión de usuario guardada con éxito');
    } catch (error) {
      console.error('Error al guardar la sesión del usuario:', error);
    }
  }

  // Actualizar el perfil del usuario
  private async updateUserProfile(user: User, profile: { displayName?: string, photoURL?: string }): Promise<void> {
    try {
      // Esta funcionalidad depende de la implementación específica
      // Por ahora, solo guardamos la información en Firestore
      await this.saveUserData(user, profile);
    } catch (error) {
      console.error('Error al actualizar el perfil del usuario:', error);
      throw error;
    }
  }

  // Enviar correo de recuperación de contraseña
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  // Obtener usuario actual
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  // Verificar si el usuario está autenticado
  get isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
}
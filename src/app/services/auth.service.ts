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
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

// Interfaz para definir la estructura de las credenciales
interface Credentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  // Variable para almacenamiento temporal de credenciales
  private tempCredentials: Credentials | null = null;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Observar cambios en el estado de autenticación
    this.auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
    });
  }

  // Método para guardar credenciales temporalmente
  storeTemporaryCredentials(email: string, password: string): void {
    this.tempCredentials = { email, password };
  }

  // Método para obtener credenciales temporales
  getTemporaryCredentials(): Credentials | null {
    return this.tempCredentials;
  }

  // Método para limpiar credenciales temporales
  clearTemporaryCredentials(): void {
    this.tempCredentials = null;
  }

  // Iniciar sesión con email y contraseña
  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    return userCredential;
  }

  // Registrarse con email y contraseña
  async registerWithEmail(email: string, password: string, displayName: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    
    return userCredential;
  }

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    
    // Redirigir a la página principal
    this.router.navigate(['/home']);
    
    return userCredential;
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
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // Observar cambios en el estado de autenticación
    this.auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
    });
  }

  // Iniciar sesión con email y contraseña
  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Registrarse con email y contraseña
  async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Enviar correo de recuperación de contraseña
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    return signOut(this.auth);
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
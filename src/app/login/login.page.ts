import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonItem, 
  IonLabel, 
  IonInput,
  IonCheckbox,
  IonIcon,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonCheckbox,
    IonIcon,
    CommonModule, 
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {
  // Opción 1: Inicializar con ! (non-null assertion operator)
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  
  // Alternativa: Inicializar directamente aquí
  // loginForm: FormGroup = this.formBuilder.group({});
  // registerForm: FormGroup = this.formBuilder.group({});
  
  isSignUp: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ logoGoogle });
  }

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, [Validators.requiredTrue]]
    });
  }

  signIn() {
    this.isSignUp = false;
  }

  signUp() {
    this.isSignUp = true;
  }

  async login() {
    if (this.loginForm.valid) {
      // Aquí implementarías la lógica real de autenticación
      console.log('Login con:', this.loginForm.value);
      
      // Simulación de login exitoso
      const toast = await this.toastController.create({
        message: 'Login exitoso!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      
      // Redireccionar al home después del login exitoso
      // this.router.navigate(['/home']);
    }
  }

  async register() {
    if (this.registerForm.valid) {
      // Aquí implementarías la lógica real de registro
      console.log('Registro con:', this.registerForm.value);
      
      // Simulación de registro exitoso
      const toast = await this.toastController.create({
        message: 'Registro exitoso! Ahora puedes iniciar sesión',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      
      this.isSignUp = false; // Volver a la pantalla de login
    }
  }

  async loginWithGoogle() {
    // Aquí implementarías la integración real con Google
    console.log('Login con Google');
    
    const toast = await this.toastController.create({
      message: 'Login con Google iniciado',
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }

  async registerWithGoogle() {
    // Aquí implementarías la integración real con Google para registro
    console.log('Registro con Google');
    
    const toast = await this.toastController.create({
      message: 'Registro con Google iniciado',
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Ingresa tu correo electrónico'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              // Aquí implementarías el envío real de correo de recuperación
              console.log('Enviar recuperación a:', data.email);
              this.showRecoveryToast();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showRecoveryToast() {
    const toast = await this.toastController.create({
      message: 'Se ha enviado un correo de recuperación',
      duration: 3000,
      color: 'success'
    });
    toast.present();
  }
}
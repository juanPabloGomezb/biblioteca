import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ReferenciaService, Referencia } from '../services/referencia.service';
import { Observable,of  } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class HistorialPage implements OnInit {
  referencias$: Observable<Referencia[]>;

  constructor(
    private referenciaService: ReferenciaService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    // Inicializar con un Observable vacío
    this.referencias$ = of([]);
  }

  ngOnInit() {
    if (this.authService.isAuthenticated) {
      this.cargarReferencias();
    }
  }


  cargarReferencias() {
    this.referencias$ = this.referenciaService.getReferenciasUsuarioActual();
  }

  async eliminarReferencia(referenciaId?: string) {
    // Verificar si el id existe antes de intentar eliminarlo
    if (!referenciaId) {
      await this.presentToast('No se puede eliminar la referencia: ID inválido');
      return;
    }
  
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar esta referencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.referenciaService.deleteReferencia(referenciaId);
              await this.presentToast('Referencia eliminada exitosamente');
            } catch (error) {
              console.error('Error al eliminar referencia', error);
              await this.presentToast('Error al eliminar referencia');
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
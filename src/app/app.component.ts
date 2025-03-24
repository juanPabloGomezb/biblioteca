import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  @ViewChildren('menuItem') menuItems!: QueryList<ElementRef>;
  
  public appPages = [
    { title: 'home', url: '/home', icon: 'mail' },
    { title: 'historial', url: '/historial', icon: 'paper-plane' },
    { title: 'pruebas', url: '/pruebas', icon: 'paper-plane' }
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  constructor(
    private menuCtrl: MenuController,
    private router: Router
  ) {
    addIcons({ 
      mailOutline, mailSharp, 
      paperPlaneOutline, paperPlaneSharp, 
      heartOutline, heartSharp, 
      archiveOutline, archiveSharp, 
      trashOutline, trashSharp, 
      warningOutline, warningSharp, 
      bookmarkOutline, bookmarkSharp 
    });
    
    // Manejar el cierre del menú al navegar a una nueva página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(async () => {
      const isMenuOpen = await this.menuCtrl.isOpen();
      if (isMenuOpen) {
        await this.menuCtrl.close();
      }
    });
  }

  // Cuando se abre el menú, mueve el foco al primer elemento del menú
  onMenuOpen() {
    setTimeout(() => {
      if (this.menuItems && this.menuItems.first) {
        const firstMenuItem = this.menuItems.first.nativeElement;
        firstMenuItem.focus();
      }
    }, 150); // Pequeño retraso para asegurar que el menú esté completamente abierto
  }

  // Antes de cerrar el menú, asegura que el foco se mueva fuera del área que se ocultará
  onMenuClose() {
    // Mover el foco a un elemento seguro que no estará oculto
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Buscar el primer elemento enfocable en el contenido principal
      const focusableElement = mainContent.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElement) {
        (focusableElement as HTMLElement).focus();
      }
    }
  }
}
import { Component } from '@angular/core';
import { Viewer3dComponent } from './viewer3d/viewer3d.component';
import { InfoPanelComponent } from './viewer3d/ui/info-panel/info-panel.component';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Viewer3dComponent,
    InfoPanelComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {

  menuOpen = false;
  @ViewChild(Viewer3dComponent) viewerComponent!: Viewer3dComponent;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  switchModel() {
    if (this.viewerComponent) {
      this.viewerComponent.switchModel();
    }
  }

  highlightSelected() {
    console.log('[AppComponent] bouton cliqué');
    if (this.viewerComponent) {
      this.viewerComponent.highlightSelected();
    }
  }
  

  resetCamera() {
    if (this.viewerComponent) {
      this.viewerComponent.resetCamera();
    }
  }
  
}
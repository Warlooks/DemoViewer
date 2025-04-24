import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../../core/services/selection.service';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.css',
  imports: [CommonModule],
})
export class InfoPanelComponent implements OnInit {
  selectedObject: THREE.Object3D | null = null;

  closePanel(): void {
    this.selectionService.setSelected(null);
  }
  

  constructor(private selectionService: SelectionService) {}

  ngOnInit(): void {
    this.selectionService.selectedObject$.subscribe(obj => {
      this.selectedObject = obj;
    });
  }

  readonly meshDataMap: { [name: string]: { material: string; temperature: string } } = {
    'mesh0': {
      material: 'Aluminium',
      temperature: '250°C'
    },
    'Fan': {
      material: 'Acier',
      temperature: '450°C'
    },
    'Hub_cover': {
      material: 'Carbone',
      temperature: '600°C'
    }
  };

  get material(): string {
    const data = this.selectedObject ? this.meshDataMap[this.selectedObject.name] : null;
    return data ? data.material : 'Inconnu';
  }
  
  get temperature(): string {
    const data = this.selectedObject ? this.meshDataMap[this.selectedObject.name] : null;
    return data ? data.temperature : '—';
  }
  
  
}

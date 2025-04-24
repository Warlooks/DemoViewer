import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selectedObjectSubject = new BehaviorSubject<THREE.Object3D | null >(null);
  selectedObject$ = this.selectedObjectSubject.asObservable();

  setSelected(object: THREE.Object3D | null): void {
    this.selectedObjectSubject.next(object);
  }
}

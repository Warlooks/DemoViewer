import { AfterViewInit, Component, ElementRef, model, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SelectionService } from '../core/services/selection.service';
import * as THREE from 'three';

@Component({
  selector: 'app-viewer3d',
  standalone: true,
  templateUrl: './viewer3d.component.html',
  styleUrl: './viewer3d.component.css'
})



export class Viewer3dComponent implements AfterViewInit {

  private scene!: THREE.Scene;
  private selectedObject: THREE.Object3D | null = null;
  private currentModel: THREE.Object3D | null = null;
  

  private modelIndex = 0;
  private modelPaths = [
    'assets/models/Fan_Angular.gltf',
    'assets/models/Hub_Angular.gltf'
  ];

  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;


  constructor(private selectionService: SelectionService) {}

  


  private loadModel(path: string, scene: THREE.Scene) {
    const loader = new GLTFLoader();
  
    loader.load(path, (gltf) => {
      // 👇 Supprimer l’ancien modèle s’il existe
      if (this.currentModel) {
        scene.remove(this.currentModel);
      }
  
      // ✅ Stocker le modèle chargé dans currentModel pour pouvoir le manipuler plus tard
      this.currentModel = gltf.scene;
  
      // 📦 Ajuster taille et position
      this.currentModel.scale.set(1, 1, 1);
      this.currentModel.position.set(0, 0, 0);
  
      // 🎨 Appliquer une couleur à tous les MeshStandardMaterial du modèle
      this.currentModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.color = new THREE.Color(0xff6666); // 💙 ou toute autre couleur
          }
          if (!mesh.name || mesh.name === 'mesh0') {
            mesh.name = 'Fan'; // ou n'importe quel nom plus parlant
          }
        }
      });
  
      // 👇 Ajouter à la scène une fois configuré
      scene.add(this.currentModel);
    }, undefined, (error) => {
      console.error('Erreur chargement modèle :', error);
    });
  }

  switchModel() {
    this.modelIndex = (this.modelIndex + 1) % this.modelPaths.length;
    this.loadModel(this.modelPaths[this.modelIndex], this.scene);
  }
  
  ngOnInit(): void {
    this.selectionService.selectedObject$.subscribe(obj => {
      this.selectedObject = obj;
    });
  }

  highlightSelected(): void {
    if (
      this.selectedObject &&
      (this.selectedObject as THREE.Mesh).isMesh
    ) {
      const mesh = this.selectedObject as THREE.Mesh;
  
      // Si le matériau est un tableau (multi-matériaux)
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat: any) => {
          if (mat.emissive) {
            const original = mat.emissive.clone();
            mat.emissive.set(0xffff00); // Jaune
            setTimeout(() => mat.emissive.copy(original), 1000);
          }
        });
      } else {
        const mat: any = mesh.material;
        if (mat.emissive) {
          const original = mat.emissive.clone();
          mat.emissive.set(0xffff00); // Jaune
          setTimeout(() => mat.emissive.copy(original), 1000);
        }
      }
    } else {
      console.warn('Aucun objet sélectionné ou ce n’est pas un mesh.');
    }
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 0, 5); // Position par défaut
      this.controls.target.set(0, 0, 0); // Centre de la scène
      this.controls.update();
    }
  }
  

  
  
  //Référence au container DOM qui va accueillir le canvas 3D
  @ViewChild('canvasContainer', {static: false}) containerRef!: ElementRef;

  ngAfterViewInit(): void {

    

    //Récupération du conteneur
    const container = this.containerRef.nativeElement;

    //Création de la scène
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee); // blanc très doux


    //Caméra perspective
    this.camera = new THREE.PerspectiveCamera(
      75, //champ de vision
      container.clientWidth / container.clientHeight, //ratio
      0.1, 1000 //near, far
    );
    this.camera.position.z = 5; //recule de la cam

    //création du renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement); //injecte le canvas dans le DOM

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('click', (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      console.log('Mesh cliqué :', clickedObject.name);
      this.selectionService.setSelected(clickedObject);
    } else {
      // 👇 Aucun objet cliqué → on efface la sélection
      this.selectionService.setSelected(null);
    }
    

    
});

    // Mouvement caméra
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true; //rotation fluide

    //cube remplacé par le modèle GLTF
    const loader = new GLTFLoader;
    this.loadModel(this.modelPaths[this.modelIndex], this.scene);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    // Fonction fléchée = garde le bon contexte "this" (celui de la classe)
const animate = () => {

  // Demande à Three.js de rappeler cette fonction à la prochaine frame (60x/sec environ)
  requestAnimationFrame(animate);

  // Si un modèle est chargé, on le fait tourner
  if (this.currentModel) {
    this.currentModel.rotation.y += 0.005; // tourne lentement autour de l’axe Y
  }

  // Met à jour les contrôles de la caméra (damping, rotation souris, etc.)
  this.controls.update();

  // Dessine la scène et la caméra sur le canvas
  renderer.render(this.scene, this.camera);
};

// Lancement de la boucle de rendu une première fois
animate();
  }

  

}

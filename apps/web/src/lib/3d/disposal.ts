import * as THREE from 'three';

const disposeMaterial = (material: THREE.Material): void => {
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
  material.dispose();
};

export const disposeSceneAssets = (scene: THREE.Scene): void => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }
  });
};

export const disposeGeometry = (geometry: THREE.BufferGeometry): void => {
  geometry.dispose();
};

export const disposeTexture = (texture: THREE.Texture): void => {
  texture.dispose();
};

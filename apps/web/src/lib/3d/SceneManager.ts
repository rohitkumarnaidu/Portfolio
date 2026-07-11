import type { SceneType } from './types';

type SceneTransitionCallback = (progress: number) => void;

export class SceneManager {
  private currentScene: SceneType | null = null;
  private transitionDuration = 800;
  private onProgress: SceneTransitionCallback | null = null;

  setOnProgress(callback: SceneTransitionCallback): void {
    this.onProgress = callback;
  }

  async transitionTo(scene: SceneType): Promise<void> {
    if (scene === this.currentScene) return;

    await this.fadeOut(this.currentScene);
    this.currentScene = scene;
    await this.fadeIn(scene);
  }

  getCurrentScene(): SceneType | null {
    return this.currentScene;
  }

  private fadeOut(scene: SceneType | null): Promise<void> {
    if (!scene) return Promise.resolve();
    return this.animate(1, 0, this.transitionDuration);
  }

  private fadeIn(_scene: SceneType): Promise<void> {
    return this.animate(0, 1, this.transitionDuration);
  }

  private animate(from: number, to: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.onProgress?.(from + (to - from) * eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
}

export const sceneManager = new SceneManager();

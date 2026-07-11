export type Tier = 'high' | 'mid' | 'low' | 'off';
export type SceneType = 'hero' | 'notFound' | 'admin';

export type HealthState = 'normal' | 'loading' | 'error';

export interface SceneProps {
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

export interface Scene3DProps {
  scene: SceneType;
  tier: Tier;
  theme: 'light' | 'dark';
}

export interface SceneRegistryProps {
  scene: SceneType;
  tier: Tier;
  theme: 'light' | 'dark';
}

export interface MouseState {
  x: number;
  y: number;
}

export interface IdleState {
  isIdle: boolean;
  lastActivity: number;
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  bloom: boolean;
}

export interface DeviceCapabilities {
  tier: Tier;
  webgl2: boolean;
  maxTextureSize: number;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connectionType?: string;
}

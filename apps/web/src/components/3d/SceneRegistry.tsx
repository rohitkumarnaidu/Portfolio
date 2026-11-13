'use client';

import dynamic from 'next/dynamic';
import type { SceneType, Tier } from '@/lib/3d/types';

interface SceneRegistryProps {
  scene: SceneType;
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

const HeroScene = dynamic(() => import('./scenes/HeroScene').then((mod) => mod.HeroScene), {
  ssr: false,
});

const NotFoundScene = dynamic(
  () => import('./scenes/NotFoundScene').then((mod) => mod.NotFoundScene),
  { ssr: false },
);

const SCENE_COMPONENTS: Record<
  SceneType,
  React.ComponentType<Omit<SceneRegistryProps, 'scene'>>
> = {
  hero: HeroScene,
  notFound: NotFoundScene,
};

export const SceneRegistry = ({ scene, ...props }: SceneRegistryProps) => {
  const SceneComponent = SCENE_COMPONENTS[scene];
  if (!SceneComponent) return null;
  return <SceneComponent {...props} />;
};

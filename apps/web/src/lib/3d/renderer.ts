import { WebGLRenderer, ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import type { ToneMapping, ColorSpace } from 'three';
import type { Tier } from './types';

interface RendererConfig {
  antialias: boolean;
  alpha: boolean;
  powerPreference: 'high-performance' | 'low-power';
  stencil: boolean;
  depth: boolean;
  preserveDrawingBuffer: boolean;
  toneMapping: ToneMapping;
  outputColorSpace: ColorSpace;
}

const getRendererConfig = (tier: Tier): RendererConfig => ({
  antialias: tier === 'high',
  alpha: true,
  powerPreference: tier === 'high' ? 'high-performance' : 'low-power',
  stencil: false,
  depth: true,
  preserveDrawingBuffer: false,
  toneMapping: ACESFilmicToneMapping,
  outputColorSpace: SRGBColorSpace,
});

export const createRenderer = (
  canvas: HTMLCanvasElement,
  tier: Tier
): WebGLRenderer => {
  const config = getRendererConfig(tier);
  const renderer = new WebGLRenderer({
    canvas,
    antialias: config.antialias,
    alpha: config.alpha,
    powerPreference: config.powerPreference,
    stencil: config.stencil,
    depth: config.depth,
    preserveDrawingBuffer: config.preserveDrawingBuffer,
  });

  renderer.toneMapping = config.toneMapping;
  renderer.outputColorSpace = config.outputColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  return renderer;
};

export const getWebGLContextInfo = (
  canvas: HTMLCanvasElement
): { webgl2: boolean; maxTextureSize: number } => {
  const gl2 = canvas.getContext('webgl2');
  const gl = gl2 || canvas.getContext('webgl');

  if (!gl2 && !gl) {
    return { webgl2: false, maxTextureSize: 0 };
  }

  const context = gl2 || gl!;
  const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);

  return { webgl2: !!gl2, maxTextureSize };
};

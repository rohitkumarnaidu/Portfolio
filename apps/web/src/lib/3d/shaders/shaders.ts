export const particleWarp = `uniform float uTime;
uniform float uSpeed;
uniform float uBreath;
uniform vec2  uMouse;
uniform float uIdle;
uniform float uTier;

attribute float aPhase;
attribute float aSpeed;
attribute float aSize;

varying float vAlpha;
varying float vGlow;

void main() {
  vec3 pos = position;

  float t = uTime * uSpeed * (0.5 + aSpeed * 0.5);
  float warpX = sin(t * 0.7 + aPhase) * 0.3 * uBreath;
  float warpY = cos(t * 0.5 + aPhase * 1.3) * 0.3 * uBreath;
  float warpZ = sin(t * 0.3 + aPhase * 0.7) * 0.2 * uBreath;

  float mouseDist = distance(pos.xy, uMouse);
  float mouseInfluence = smoothstep(0.8, 0.0, mouseDist) * 0.15 * (1.0 - uIdle);
  pos.x += uMouse.x * mouseInfluence;
  pos.y += uMouse.y * mouseInfluence;

  pos.x += warpX;
  pos.y += warpY;
  pos.z += warpZ;

  float activeBlend = 1.0 - uIdle * 0.7;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * uTier * activeBlend * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = 0.6 + 0.4 * sin(t * 0.4 + aPhase) * activeBlend;
  vGlow = 0.3 + 0.7 * (1.0 - mouseDist);
}
`;

export const particleColor = `uniform vec3  uLightColor;
uniform vec3  uDarkColor;
uniform float uMixFactor;
uniform float uTime;
uniform float uGlowIntensity;

varying float vAlpha;
varying float vGlow;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha *= alpha;

  vec3 color = mix(uLightColor, uDarkColor, uMixFactor);
  color *= 1.0 + vGlow * uGlowIntensity * 0.3;

  float pulse = 0.8 + 0.2 * sin(uTime * 0.3 + dist * 10.0);
  color *= pulse;

  gl_FragColor = vec4(color, alpha * vAlpha);
}
`;

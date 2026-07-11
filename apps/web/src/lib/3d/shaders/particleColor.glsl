uniform vec3  uLightColor;
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

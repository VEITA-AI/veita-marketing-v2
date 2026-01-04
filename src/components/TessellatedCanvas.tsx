"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

interface TriangleData {
  centerX: number;
  centerY: number;
  currentOffsetY: number;
  scale: number;
  normalizedY: number;
  color: THREE.Color;
  seed: number;
  instanceId: number;
  isUpward: boolean;
}

interface TessellatedCanvasConfig {
  scrollStart?: string;
  scrollEnd?: string;
  startProgressMultiplier?: number;
  startProgressOffset?: number;
  animationDuration?: number;
  initialScale?: number;
  triangleSize?: number;
  colorStart?: { r: number; g: number; b: number };
  colorEnd?: { r: number; g: number; b: number };
  gradientOrigin?: { x: number; y: number }; // Normalized 0-1 coordinates
  gradientScale?: number; // Scale factor for gradient size (default: 1.0, larger = smaller circle)
}

interface TessellatedCanvasProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  config?: TessellatedCanvasConfig;
}

const defaultConfig: TessellatedCanvasConfig = {
  scrollStart: "top top",
  scrollEnd: "bottom bottom",
  startProgressMultiplier: 0.8,
  startProgressOffset: 0.2,
  animationDuration: 0.3,
  initialScale: 0,
  triangleSize: 40,
  gradientOrigin: { x: 0.4, y: 1.0 }, // 40% from left, 100% from top (bottom)
  gradientScale: 1.0, // Default scale
};

export default function TessellatedCanvas({
  containerRef: externalContainerRef,
  config = {},
}: TessellatedCanvasProps) {
  const finalConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trianglesRef = useRef<TriangleData[]>([]);
  const upwardInstancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const downwardInstancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const animationFrameRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const matrixRef = useRef(new THREE.Matrix4());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup (orthographic for 2D-like rendering)
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const createTriangleGeometry = (
      size: number,
      isUpward: boolean,
      rowHeight: number
    ): THREE.BufferGeometry => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(9);
      const halfHeight = rowHeight / 2;

      if (isUpward) {
        // Upward pointing triangle
        vertices[0] = 0; // x1 (center top)
        vertices[1] = halfHeight; // y1 (top)
        vertices[2] = 0; // z1
        vertices[3] = -size / 2; // x2 (left)
        vertices[4] = -halfHeight; // y2 (bottom)
        vertices[5] = 0; // z2
        vertices[6] = size / 2; // x3 (right)
        vertices[7] = -halfHeight; // y3 (bottom)
        vertices[8] = 0; // z3
      } else {
        // Downward pointing triangle
        vertices[0] = 0; // x1 (center bottom)
        vertices[1] = -halfHeight; // y1 (bottom)
        vertices[2] = 0; // z1
        vertices[3] = -size / 2; // x2 (left)
        vertices[4] = halfHeight; // y2 (top)
        vertices[5] = 0; // z2
        vertices[6] = size / 2; // x3 (right)
        vertices[7] = halfHeight; // y3 (top)
        vertices[8] = 0; // z3
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      return geometry;
    };

    const initTriangles = () => {
      // Clear existing instanced meshes
      if (upwardInstancedMeshRef.current) {
        scene.remove(upwardInstancedMeshRef.current);
        upwardInstancedMeshRef.current.geometry.dispose();
        (upwardInstancedMeshRef.current.material as THREE.Material).dispose();
      }
      if (downwardInstancedMeshRef.current) {
        scene.remove(downwardInstancedMeshRef.current);
        downwardInstancedMeshRef.current.geometry.dispose();
        (downwardInstancedMeshRef.current.material as THREE.Material).dispose();
      }
      trianglesRef.current = [];

      const size = finalConfig.triangleSize!;
      const rowHeight = (Math.sqrt(3) / 2) * size;
      const numRows = Math.ceil(height / rowHeight) + 4;
      const numCols = Math.ceil(width / (size / 2)) + 6;

      const startCol = -3;
      const startRow = -2;

      const upwardTriangles: TriangleData[] = [];
      const downwardTriangles: TriangleData[] = [];

      for (let row = startRow; row < numRows + startRow; row++) {
        const y = row * rowHeight;
        for (let col = startCol; col < numCols + startCol; col++) {
          const x = col * (size / 2);
          const isUpward = (row + col) % 2 === 0;

          const centerX = x + size / 2;
          const centerY = isUpward
            ? y + (rowHeight * 2) / 3
            : y + rowHeight / 3 + rowHeight * 0.33; // Lower downward triangles slightly

          const normalizedY = (height - centerY) / height;

          const triangleData: TriangleData = {
            centerX,
            centerY,
            currentOffsetY: 0,
            scale: finalConfig.initialScale!,
            normalizedY,
            color: new THREE.Color(), // Not used anymore, but keep for compatibility
            seed: Math.random() * 0.2,
            instanceId: isUpward
              ? upwardTriangles.length
              : downwardTriangles.length,
            isUpward,
          };

          if (isUpward) {
            upwardTriangles.push(triangleData);
          } else {
            downwardTriangles.push(triangleData);
          }
        }
      }

      // Create geometries
      const upwardGeometry = createTriangleGeometry(size, true, rowHeight);
      const downwardGeometry = createTriangleGeometry(size, false, rowHeight);

      // Get gradient colors for uniforms
      const startColor = finalConfig.colorStart || {
        r: 12 / 255,
        g: 28 / 255,
        b: 90 / 255,
      };
      const endColor = finalConfig.colorEnd || {
        r: 41 / 255,
        g: 98 / 255,
        b: 255 / 255,
      };
      const gradientOrigin = finalConfig.gradientOrigin || { x: 0.4, y: 1.0 };
      const gradientScale = finalConfig.gradientScale || 1.0;
      const aspectRatio = width / height;

      // Create shader material with gradient calculation in fragment shader
      const upwardMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(width, height) },
          uAspectRatio: { value: aspectRatio },
          uGradientOrigin: {
            value: new THREE.Vector2(gradientOrigin.x, gradientOrigin.y),
          },
          uGradientScale: { value: gradientScale },
          uColorStart: {
            value: new THREE.Vector3(startColor.r, startColor.g, startColor.b),
          },
          uColorEnd: {
            value: new THREE.Vector3(endColor.r, endColor.g, endColor.b),
          },
          uBurnIntensity: { value: 0.3 },
          uNoiseScale: { value: 2.5 },
        },
        vertexShader: `
          attribute float instanceOffsetY;
          varying vec2 vWorldPos;
          
          void main() {
            // Get world position of vertex
            vec4 worldPos = instanceMatrix * vec4(position, 1.0);
            
            // Pass world position to fragment shader for gradient calculation
            vWorldPos = worldPos.xy;
            
            // Apply offsetY (for scroll animation)
            worldPos.y += instanceOffsetY;
            
            gl_Position = projectionMatrix * modelViewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform vec2 uResolution;
          uniform float uAspectRatio;
          uniform vec2 uGradientOrigin;
          uniform float uGradientScale;
          uniform vec3 uColorStart;
          uniform vec3 uColorEnd;
          uniform float uBurnIntensity;
          uniform float uNoiseScale;
          varying vec2 vWorldPos;
          
          // Simple hash function for dithering and noise
          float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
            p3 += dot(p3, p3.yzx + 19.19);
            return fract((p3.x + p3.y) * p3.z);
          }
          
          // Fractal noise for texture
          float noise(vec2 p) {
            return hash(p);
          }
          
          // Fractal brownian motion for richer texture
          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 4; i++) {
              value += amplitude * noise(p * frequency);
              frequency *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }
          
          void main() {
            // Convert world position to screen coordinates (pixels)
            vec2 screenPos = vWorldPos + uResolution * 0.5;
            
            // Convert gradient origin from normalized (0-1) to screen coordinates
            vec2 gradientCenterScreen = uGradientOrigin * uResolution;
            
            // Calculate distance in screen space - this naturally creates a circular gradient
            vec2 delta = screenPos - gradientCenterScreen;
            float distToCenter = length(delta);
            
            // Normalize distance by screen diagonal for consistent gradient scale
            // Apply gradient scale to control circle size (larger scale = smaller circle)
            float maxDist = length(uResolution);
            float normalizedDist = (distToCenter / maxDist) * uGradientScale;
            
            // Map distance to gradient progress with very smooth interpolation
            // Use smoothstep for gradual transitions instead of hard stops
            float progressDist = smoothstep(0.1, 0.8, normalizedDist);
            
            // Apply additional smoothing for ultra-smooth gradient
            // Double smoothstep for even smoother transitions
            float smoothProgress = progressDist * progressDist * (3.0 - 2.0 * progressDist);
            
            // Interpolate between start and end colors
            vec3 color = mix(uColorStart, uColorEnd, smoothProgress);
            
            // Generate procedural noise texture (sparser by using thresholding)
            vec2 normalizedPos = screenPos / uResolution;
            vec2 noiseCoord = normalizedPos * uNoiseScale;
            float noiseValue = fbm(noiseCoord);
            
            // Make noise sparser by thresholding - only apply burn where noise is above a threshold
            float noiseThreshold = 0.5;
            float sparseNoise = smoothstep(noiseThreshold, noiseThreshold + 0.2, noiseValue);
            
            // Calculate luminance to reduce burn intensity on lighter tones
            float luminance = dot(color, vec3(0.299, 0.587, 0.114));
            float burnModulator = 1.0 - smoothstep(0.3, 0.9, luminance); // Less burn on lighter colors
            
            // Apply burn blend mode: darken the color based on sparse noise
            // Reduced intensity on lighter tones
            color = color * (1.0 - sparseNoise * uBurnIntensity * burnModulator);
            
            // Add subtle dithering to reduce banding (1/255.0 for 8-bit dither)
            float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
            color += dither;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const downwardMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(width, height) },
          uAspectRatio: { value: aspectRatio },
          uGradientOrigin: {
            value: new THREE.Vector2(gradientOrigin.x, gradientOrigin.y),
          },
          uGradientScale: { value: gradientScale },
          uColorStart: {
            value: new THREE.Vector3(startColor.r, startColor.g, startColor.b),
          },
          uColorEnd: {
            value: new THREE.Vector3(endColor.r, endColor.g, endColor.b),
          },
          uBurnIntensity: { value: 0.3 },
          uNoiseScale: { value: 2.5 },
        },
        vertexShader: `
          attribute float instanceOffsetY;
          varying vec2 vWorldPos;
          
          void main() {
            // Get world position of vertex
            vec4 worldPos = instanceMatrix * vec4(position, 1.0);
            
            // Pass world position to fragment shader for gradient calculation
            vWorldPos = worldPos.xy;
            
            // Apply offsetY (for scroll animation)
            worldPos.y += instanceOffsetY;
            
            gl_Position = projectionMatrix * modelViewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform vec2 uResolution;
          uniform float uAspectRatio;
          uniform vec2 uGradientOrigin;
          uniform float uGradientScale;
          uniform vec3 uColorStart;
          uniform vec3 uColorEnd;
          uniform float uBurnIntensity;
          uniform float uNoiseScale;
          varying vec2 vWorldPos;
          
          // Simple hash function for dithering and noise
          float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
            p3 += dot(p3, p3.yzx + 19.19);
            return fract((p3.x + p3.y) * p3.z);
          }
          
          // Fractal noise for texture
          float noise(vec2 p) {
            return hash(p);
          }
          
          // Fractal brownian motion for richer texture
          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 4; i++) {
              value += amplitude * noise(p * frequency);
              frequency *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }
          
          void main() {
            // Convert world position to screen coordinates (pixels)
            vec2 screenPos = vWorldPos + uResolution * 0.5;
            
            // Convert gradient origin from normalized (0-1) to screen coordinates
            vec2 gradientCenterScreen = uGradientOrigin * uResolution;
            
            // Calculate distance in screen space - this naturally creates a circular gradient
            vec2 delta = screenPos - gradientCenterScreen;
            float distToCenter = length(delta);
            
            // Normalize distance by screen diagonal for consistent gradient scale
            // Apply gradient scale to control circle size (larger scale = smaller circle)
            float maxDist = length(uResolution);
            float normalizedDist = (distToCenter / maxDist) * uGradientScale;
            
            // Map distance to gradient progress with very smooth interpolation
            // Use smoothstep for gradual transitions instead of hard stops
            float progressDist = smoothstep(0.1, 0.8, normalizedDist);
            
            // Apply additional smoothing for ultra-smooth gradient
            // Double smoothstep for even smoother transitions
            float smoothProgress = progressDist * progressDist * (3.0 - 2.0 * progressDist);
            
            // Interpolate between start and end colors
            vec3 color = mix(uColorStart, uColorEnd, smoothProgress);
            
            // Generate procedural noise texture (sparser by using thresholding)
            vec2 normalizedPos = screenPos / uResolution;
            vec2 noiseCoord = normalizedPos * uNoiseScale;
            float noiseValue = fbm(noiseCoord);
            
            // Make noise sparser by thresholding - only apply burn where noise is above a threshold
            float noiseThreshold = 0.5;
            float sparseNoise = smoothstep(noiseThreshold, noiseThreshold + 0.2, noiseValue);
            
            // Calculate luminance to reduce burn intensity on lighter tones
            float luminance = dot(color, vec3(0.299, 0.587, 0.114));
            float burnModulator = 1.0 - smoothstep(0.3, 0.9, luminance); // Less burn on lighter colors
            
            // Apply burn blend mode: darken the color based on sparse noise
            // Reduced intensity on lighter tones
            color = color * (1.0 - sparseNoise * uBurnIntensity * burnModulator);
            
            // Add subtle dithering to reduce banding (1/255.0 for 8-bit dither)
            float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
            color += dither;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true,
      });

      // Create instanced meshes
      const upwardMesh = new THREE.InstancedMesh(
        upwardGeometry,
        upwardMaterial,
        upwardTriangles.length
      );
      const downwardMesh = new THREE.InstancedMesh(
        downwardGeometry,
        downwardMaterial,
        downwardTriangles.length
      );

      // Set up instance offsetY as instanced attribute (colors now in shader)
      const upwardOffsetY = new Float32Array(upwardTriangles.length);
      const downwardOffsetY = new Float32Array(downwardTriangles.length);

      upwardTriangles.forEach((triangle, i) => {
        upwardOffsetY[i] = triangle.currentOffsetY;
      });

      downwardTriangles.forEach((triangle, i) => {
        downwardOffsetY[i] = triangle.currentOffsetY;
      });

      upwardGeometry.setAttribute(
        "instanceOffsetY",
        new THREE.InstancedBufferAttribute(upwardOffsetY, 1)
      );

      downwardGeometry.setAttribute(
        "instanceOffsetY",
        new THREE.InstancedBufferAttribute(downwardOffsetY, 1)
      );

      // Initialize instance matrices
      const overlapScale = 1.02; // Slight overlap to prevent gaps
      const matrix = new THREE.Matrix4();
      upwardTriangles.forEach((triangle) => {
        const x = triangle.centerX - width / 2;
        const y = height / 2 - triangle.centerY;
        matrix.makeTranslation(x, y, 0);
        matrix.scale(
          new THREE.Vector3(
            triangle.scale * overlapScale,
            triangle.scale * overlapScale,
            1
          )
        );
        upwardMesh.setMatrixAt(triangle.instanceId, matrix);
      });

      downwardTriangles.forEach((triangle) => {
        const x = triangle.centerX - width / 2;
        const y = height / 2 - triangle.centerY;
        matrix.makeTranslation(x, y, 0);
        matrix.scale(
          new THREE.Vector3(
            triangle.scale * overlapScale,
            triangle.scale * overlapScale,
            1
          )
        );
        downwardMesh.setMatrixAt(triangle.instanceId, matrix);
      });

      upwardMesh.instanceMatrix.needsUpdate = true;
      downwardMesh.instanceMatrix.needsUpdate = true;

      scene.add(upwardMesh);
      scene.add(downwardMesh);

      upwardInstancedMeshRef.current = upwardMesh;
      downwardInstancedMeshRef.current = downwardMesh;

      trianglesRef.current = [...upwardTriangles, ...downwardTriangles];

      // Sort triangles by Y position
      trianglesRef.current.sort((a, b) => b.centerY - a.centerY);

      // Set up ScrollTrigger animation
      if (externalContainerRef?.current) {
        gsap.registerPlugin(ScrollTrigger);

        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill();
        }

        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: externalContainerRef.current,
          start: finalConfig.scrollStart,
          end: finalConfig.scrollEnd,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;

            trianglesRef.current.forEach((triangle) => {
              const startProgress =
                triangle.normalizedY *
                  (finalConfig.startProgressMultiplier! + triangle.seed) -
                Math.sin(triangle.seed * Math.PI * 4) *
                  finalConfig.startProgressOffset!;
              const endProgress = Math.min(
                startProgress + finalConfig.animationDuration!,
                1
              );

              if (progress < startProgress) {
                triangle.scale = finalConfig.initialScale!;
              } else if (progress > endProgress) {
                triangle.scale = 1;
              } else {
                const localProgress =
                  (progress - startProgress) / (endProgress - startProgress);
                const easedProgress =
                  localProgress < 0.5
                    ? 2 * localProgress * localProgress
                    : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
                triangle.scale =
                  finalConfig.initialScale! +
                  (1 - finalConfig.initialScale!) * easedProgress;
              }
            });
          },
        });
      }
    };

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;

      const matrix = matrixRef.current;

      trianglesRef.current.forEach((triangle) => {
        // Update instance matrix (position and scale only)
        const x = triangle.centerX - width / 2;
        const baseY = height / 2 - triangle.centerY;

        const overlapScale = 1.02; // Slight overlap to prevent gaps
        matrix.makeTranslation(x, baseY, 0);
        matrix.scale(
          new THREE.Vector3(
            triangle.scale * overlapScale,
            triangle.scale * overlapScale,
            1
          )
        );

        const instancedMesh = triangle.isUpward
          ? upwardInstancedMeshRef.current
          : downwardInstancedMeshRef.current;

        if (instancedMesh) {
          instancedMesh.setMatrixAt(triangle.instanceId, matrix);

          // Update instanceOffsetY attribute
          const geometry = instancedMesh.geometry;
          const offsetYAttr = geometry.getAttribute(
            "instanceOffsetY"
          ) as THREE.InstancedBufferAttribute;
          if (offsetYAttr) {
            offsetYAttr.array[triangle.instanceId] = triangle.currentOffsetY;
            offsetYAttr.needsUpdate = true;
          }
        }
      });

      if (upwardInstancedMeshRef.current) {
        upwardInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
      }
      if (downwardInstancedMeshRef.current) {
        downwardInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      cameraRef.current.left = newWidth / -2;
      cameraRef.current.right = newWidth / 2;
      cameraRef.current.top = newHeight / 2;
      cameraRef.current.bottom = newHeight / -2;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(newWidth, newHeight);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));

      initTriangles();
    };

    initTriangles();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (upwardInstancedMeshRef.current) {
        scene.remove(upwardInstancedMeshRef.current);
        upwardInstancedMeshRef.current.geometry.dispose();
        (upwardInstancedMeshRef.current.material as THREE.Material).dispose();
      }
      if (downwardInstancedMeshRef.current) {
        scene.remove(downwardInstancedMeshRef.current);
        downwardInstancedMeshRef.current.geometry.dispose();
        (downwardInstancedMeshRef.current.material as THREE.Material).dispose();
      }
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [externalContainerRef, finalConfig]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ background: "transparent" }}
    />
  );
}

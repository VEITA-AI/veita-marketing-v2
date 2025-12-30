"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

interface TriangleData {
  centerX: number;
  centerY: number;
  currentOffsetY: number;
  targetOffsetY: number;
  scale: number;
  velocity: number;
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
}

interface TessellatedCanvasProps {
  containerRef?: React.RefObject<HTMLElement>;
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
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
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

    const getGradientColor = (x: number, y: number): THREE.Color => {
      const progress = (x / width + y / height) / 2;
      const startColor = { r: 12 / 255, g: 28 / 255, b: 90 / 255 };
      const endColor = { r: 41 / 255, g: 98 / 255, b: 255 / 255 };

      const r = startColor.r + (endColor.r - startColor.r) * progress;
      const g = startColor.g + (endColor.g - startColor.g) * progress;
      const b = startColor.b + (endColor.b - startColor.b) * progress;

      return new THREE.Color(r, g, b);
    };

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
          const color = getGradientColor(centerX, centerY);

          const triangleData: TriangleData = {
            centerX,
            centerY,
            currentOffsetY: 0,
            targetOffsetY: 0,
            scale: finalConfig.initialScale!,
            velocity: 0,
            normalizedY,
            color,
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

      // Create shader material for per-instance colors
      const upwardMaterial = new THREE.ShaderMaterial({
        uniforms: {
          mousePos: { value: new THREE.Vector2(0, 0) },
          influenceRadius: { value: 200.0 },
          maxDistortion: { value: 80.0 },
        },
        vertexShader: `
          attribute vec3 instanceColor;
          attribute vec3 instanceCenter;
          attribute float instanceOffsetY;
          uniform vec2 mousePos;
          uniform float influenceRadius;
          uniform float maxDistortion;
          varying vec3 vColor;
          
          void main() {
            vColor = instanceColor;
            
            // Get world position of vertex
            vec4 worldPos = instanceMatrix * vec4(position, 1.0);
            
            // Use triangle center for displacement calculation
            vec2 centerPos2D = instanceCenter.xy;
            
            // Calculate distance from mouse to triangle center
            float dist = length(mousePos - centerPos2D);
            
            // Apply vertical displacement based on distance from mouse (spherical raise)
            float verticalDisplacement = 0.0;
            if (dist < influenceRadius && dist > 0.0) {
              float normalizedDist = dist / influenceRadius;
              float influence = pow(1.0 - normalizedDist, 2.5);
              
              // Push triangles up vertically based on distance - closer = higher (raise)
              verticalDisplacement = influence * maxDistortion;
            }
            
            // Apply vertical raise from mouse interaction
            worldPos.y += verticalDisplacement;
            
            // Apply existing offsetY (for scroll animation)
            worldPos.y += instanceOffsetY;
            
            gl_Position = projectionMatrix * modelViewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const downwardMaterial = new THREE.ShaderMaterial({
        uniforms: {
          mousePos: { value: new THREE.Vector2(0, 0) },
          influenceRadius: { value: 200.0 },
          maxDistortion: { value: 80.0 },
        },
        vertexShader: `
          attribute vec3 instanceColor;
          attribute vec3 instanceCenter;
          attribute float instanceOffsetY;
          uniform vec2 mousePos;
          uniform float influenceRadius;
          uniform float maxDistortion;
          varying vec3 vColor;
          
          void main() {
            vColor = instanceColor;
            
            // Get world position of vertex
            vec4 worldPos = instanceMatrix * vec4(position, 1.0);
            
            // Use triangle center for displacement calculation
            vec2 centerPos2D = instanceCenter.xy;
            
            // Calculate distance from mouse to triangle center
            float dist = length(mousePos - centerPos2D);
            
            // Apply vertical displacement based on distance from mouse (spherical raise)
            float verticalDisplacement = 0.0;
            if (dist < influenceRadius && dist > 0.0) {
              float normalizedDist = dist / influenceRadius;
              float influence = pow(1.0 - normalizedDist, 2.5);
              
              // Push triangles up vertically based on distance - closer = higher (raise)
              verticalDisplacement = influence * maxDistortion;
            }
            
            // Apply vertical raise from mouse interaction
            worldPos.y += verticalDisplacement;
            
            // Apply existing offsetY (for scroll animation)
            worldPos.y += instanceOffsetY;
            
            gl_Position = projectionMatrix * modelViewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor, 1.0);
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

      // Set up instance colors, centers, and offsetY as instanced attributes
      const upwardColors = new Float32Array(upwardTriangles.length * 3);
      const downwardColors = new Float32Array(downwardTriangles.length * 3);
      const upwardCenters = new Float32Array(upwardTriangles.length * 3);
      const downwardCenters = new Float32Array(downwardTriangles.length * 3);
      const upwardOffsetY = new Float32Array(upwardTriangles.length);
      const downwardOffsetY = new Float32Array(downwardTriangles.length);

      upwardTriangles.forEach((triangle, i) => {
        upwardColors[i * 3] = triangle.color.r;
        upwardColors[i * 3 + 1] = triangle.color.g;
        upwardColors[i * 3 + 2] = triangle.color.b;

        const x = triangle.centerX - width / 2;
        const y = height / 2 - triangle.centerY;
        upwardCenters[i * 3] = x;
        upwardCenters[i * 3 + 1] = y;
        upwardCenters[i * 3 + 2] = 0;

        upwardOffsetY[i] = triangle.currentOffsetY;
      });

      downwardTriangles.forEach((triangle, i) => {
        downwardColors[i * 3] = triangle.color.r;
        downwardColors[i * 3 + 1] = triangle.color.g;
        downwardColors[i * 3 + 2] = triangle.color.b;

        const x = triangle.centerX - width / 2;
        const y = height / 2 - triangle.centerY;
        downwardCenters[i * 3] = x;
        downwardCenters[i * 3 + 1] = y;
        downwardCenters[i * 3 + 2] = 0;

        downwardOffsetY[i] = triangle.currentOffsetY;
      });

      upwardGeometry.setAttribute(
        "instanceColor",
        new THREE.InstancedBufferAttribute(upwardColors, 3)
      );
      upwardGeometry.setAttribute(
        "instanceCenter",
        new THREE.InstancedBufferAttribute(upwardCenters, 3)
      );
      upwardGeometry.setAttribute(
        "instanceOffsetY",
        new THREE.InstancedBufferAttribute(upwardOffsetY, 1)
      );

      downwardGeometry.setAttribute(
        "instanceColor",
        new THREE.InstancedBufferAttribute(downwardColors, 3)
      );
      downwardGeometry.setAttribute(
        "instanceCenter",
        new THREE.InstancedBufferAttribute(downwardCenters, 3)
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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;

      const mouse = mouseRef.current;
      const influenceRadius = 200;
      const maxLift = 25;
      const matrix = matrixRef.current;

      // Convert mouse screen coordinates to world coordinates
      const mouseWorldX = mouse.x - width / 2;
      const mouseWorldY = height / 2 - mouse.y;

      // Update mouse position uniform
      if (upwardInstancedMeshRef.current) {
        const material = upwardInstancedMeshRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.mousePos.value.set(mouseWorldX, mouseWorldY);
      }
      if (downwardInstancedMeshRef.current) {
        const material = downwardInstancedMeshRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.mousePos.value.set(mouseWorldX, mouseWorldY);
      }

      trianglesRef.current.forEach((triangle) => {
        const distance = Math.sqrt(
          Math.pow(mouse.x - triangle.centerX, 2) +
            Math.pow(mouse.y - triangle.centerY, 2)
        );

        if (distance < influenceRadius) {
          const normalizedDistance = distance / influenceRadius;
          const influence = Math.pow(1 - normalizedDistance, 2.5);
          triangle.targetOffsetY = -influence * maxLift;
        } else {
          triangle.targetOffsetY = 0;
        }

        const springStrength = 0.05;
        const damping = 0.88;
        const force =
          (triangle.targetOffsetY - triangle.currentOffsetY) * springStrength;
        triangle.velocity += force;
        triangle.velocity *= damping;
        triangle.currentOffsetY += triangle.velocity;

        if (
          Math.abs(triangle.currentOffsetY) < 0.01 &&
          Math.abs(triangle.velocity) < 0.01
        ) {
          triangle.currentOffsetY = 0;
          triangle.velocity = 0;
        }

        // Update instance matrix (position and scale only, depression handled in shader)
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
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
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

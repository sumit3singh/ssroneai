import React, { useEffect, useRef, useState, Component, ErrorInfo, ReactNode } from 'react';

interface HeroCanvas3DProps {
  className?: string;
}

// ── WebGL Capability Detection Helper ──
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// ── 2D Canvas Atmospheric Fallback (Silky, Premium Warm Daylight Ambience) ──
// Renders subtle warm daylight volumetric radiance, delicate undulating horizon lines,
// and soft champagne/emerald floating motes with zero text interference.
function render2DFallback(
  container: HTMLDivElement,
  onCleanup: (fn: () => void) => void
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  let animId: number;
  let width = (canvas.width = container.clientWidth || window.innerWidth);
  let height = (canvas.height = container.clientHeight || 700);

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 20;
    targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 12;
  };
  window.addEventListener('mousemove', handleMouseMove);

  const handleResize = () => {
    if (!container) return;
    width = canvas.width = container.clientWidth || window.innerWidth;
    height = canvas.height = container.clientHeight || 700;
  };
  window.addEventListener('resize', handleResize);

  // 60 Fine ambient particles (subtle, low-opacity motes)
  const particleCount = 60;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.6,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -Math.random() * 0.3 - 0.05,
    alpha: Math.random() * 0.18 + 0.05,
  }));

  let tick = 0;

  const draw = () => {
    tick += 0.012;
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse lerp
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const cx = width / 2 + mouseX;
    const cy = height * 0.38 + mouseY;

    // 1. Warm Soft Volumetric Sunlight Wash (Subtle, Daylight Luxury)
    const sunGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.6);
    sunGlow.addColorStop(0, 'rgba(255, 250, 238, 0.45)');
    sunGlow.addColorStop(0.4, 'rgba(247, 243, 232, 0.2)');
    sunGlow.addColorStop(1, 'rgba(250, 249, 245, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Elegant Horizon Topography Lines (Deep Lower Section Only)
    ctx.save();
    const horizonY = height * 0.78 + mouseY * 0.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const waveOffset = i * 28;
      const waveAlpha = 0.07 - i * 0.012;
      ctx.strokeStyle = `rgba(16, 59, 43, ${Math.max(0.02, waveAlpha)})`;
      ctx.lineWidth = 1.2;

      for (let x = 0; x <= width; x += 15) {
        const y = horizonY + waveOffset + Math.sin(x * 0.005 + tick + i) * 14 + Math.cos(x * 0.003 - tick * 0.7) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 3. Floating Micro-Motes
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 59, 43, ${p.alpha})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  };

  draw();

  onCleanup(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animId);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });
}

// ── Main HeroCanvas3D Component with WebGL & 2D Resilience ──
const HeroCanvasInternal: React.FC<HeroCanvas3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupCallbacks: (() => void)[] = [];
    const registerCleanup = (fn: () => void) => cleanupCallbacks.push(fn);

    const isSupported = checkWebGLSupport();
    const THREE = (window as any).THREE;

    if (!isSupported || !THREE) {
      render2DFallback(container, registerCleanup);
      return () => cleanupCallbacks.forEach((fn) => fn());
    }

    // Attempt WebGL 3D Setup: High-End Architectural Digital Topography
    try {
      let animId: number;
      let width = container.clientWidth || window.innerWidth;
      let height = container.clientHeight || 700;

      const scene = new THREE.Scene();
      // Warm daylight atmospheric fog seamlessly merging into page background (#FAF9F5)
      scene.fog = new THREE.FogExp2(0xFAF9F5, 0.007);

      // Camera positioned to view deep horizon, leaving upper 60% of viewport pristine
      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      camera.position.set(0, 16, 80);
      camera.lookAt(0, -6, 0);

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });

      if (!renderer || !renderer.domElement) {
        throw new Error('WebGLRenderer failed to instantiate');
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // ── Architectural Daylight Lighting ──
      const ambientLight = new THREE.AmbientLight(0xFFFDF7, 1.15);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xFFE9CC, 1.1);
      sunLight.position.set(40, 50, 30);
      scene.add(sunLight);

      const subtleEmeraldPoint = new THREE.PointLight(0x103B2B, 0.7, 70);
      subtleEmeraldPoint.position.set(0, -12, 10);
      scene.add(subtleEmeraldPoint);

      // ── 1. Generative Digital Terrain Plane (Unified Data Kernel Foundation) ──
      // Positioned low in the background (y: -22, z: -25 to -100)
      const planeWidth = 170;
      const planeDepth = 110;
      const segmentsX = 55;
      const segmentsY = 40;
      const terrainGeo = new THREE.PlaneGeometry(planeWidth, planeDepth, segmentsX, segmentsY);

      // Store initial vertex positions for mathematical wave animation
      const posAttr = terrainGeo.attributes.position;
      const initialZ = new Float32Array(posAttr.count);
      for (let i = 0; i < posAttr.count; i++) {
        initialZ[i] = posAttr.getZ(i);
      }

      // Base warm reflective surface
      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0xF5F2E8,
        roughness: 0.85,
        metalness: 0.12,
        flatShading: true,
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.rotation.x = -Math.PI / 2.35;
      terrainMesh.position.set(0, -22, -25);
      scene.add(terrainMesh);

      // Gossamer Wireframe Overlay in Deep Emerald
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x103B2B,
        wireframe: true,
        transparent: true,
        opacity: 0.13,
      });
      const wireframeMesh = new THREE.Mesh(terrainGeo, wireframeMat);
      wireframeMesh.rotation.x = -Math.PI / 2.35;
      wireframeMesh.position.set(0, -21.9, -25);
      scene.add(wireframeMesh);

      // ── 2. Distant Horizon Architectural Emblem Nucleus ──
      // Floating subtly on the deep horizon (y: -8, z: -70)
      const nucleusGroup = new THREE.Group();
      nucleusGroup.position.set(0, -8, -65);

      const outerRingGeo = new THREE.TorusGeometry(12, 0.12, 16, 72);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0xB8860B,
        transparent: true,
        opacity: 0.3,
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      nucleusGroup.add(outerRing);

      const innerRingGeo = new THREE.TorusGeometry(7.5, 0.1, 16, 64);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0x103B2B,
        transparent: true,
        opacity: 0.22,
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      nucleusGroup.add(innerRing);

      scene.add(nucleusGroup);

      // ── 3. Ultra-Refined Champagne & Emerald Micro-Dust Motes ──
      const dustCount = 80;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i += 3) {
        dustPositions[i] = (Math.random() - 0.5) * 110;
        dustPositions[i + 1] = Math.random() * 45 - 20;
        dustPositions[i + 2] = (Math.random() - 0.5) * 70 - 10;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0x103B2B,
        size: 0.28,
        transparent: true,
        opacity: 0.25,
      });
      const dustPoints = new THREE.Points(dustGeo, dustMat);
      scene.add(dustPoints);

      // ── Mouse Smooth Damped Parallax ──
      let targetMouseX = 0;
      let targetMouseY = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 12;
        targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 6;
      };
      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        if (!container) return;
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || 700;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      // ── 60fps Micro-Wave Animation Loop ──
      let clock = 0;
      const animate = () => {
        clock += 0.014;
        currentMouseX += (targetMouseX - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY - currentMouseY) * 0.04;

        // Subtle camera orbit parallax
        camera.position.x = currentMouseX;
        camera.position.y = 16 - currentMouseY;
        camera.lookAt(0, -6, 0);

        // Slow horizon ring rotation
        outerRing.rotation.z = clock * 0.06;
        innerRing.rotation.z = -clock * 0.09;

        // Harmonic terrain undulating wave
        const positions = terrainGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const u = (i % (segmentsX + 1)) / segmentsX;
          const v = Math.floor(i / (segmentsX + 1)) / segmentsY;
          const waveZ = Math.sin(u * 6 + clock * 0.8) * Math.cos(v * 5 + clock * 0.6) * 2.2 +
                        Math.sin((u + v) * 4 - clock * 0.4) * 1.2;
          positions.setZ(i, initialZ[i] + waveZ);
        }
        positions.needsUpdate = true;
        terrainGeo.computeVertexNormals();

        // Slow dust motes drift
        const dustPos = dustGeo.attributes.position;
        for (let i = 1; i < dustPos.count * 3; i += 3) {
          dustPos.array[i] += 0.02;
          if (dustPos.array[i] > 25) {
            dustPos.array[i] = -20;
          }
        }
        dustPos.needsUpdate = true;

        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      };
      animate();

      registerCleanup(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
      });
    } catch (err) {
      console.warn('WebGL initialization caught gracefully. Engaging 2D ambient fallback canvas:', err);
      render2DFallback(container, registerCleanup);
    }

    return () => {
      cleanupCallbacks.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`hero-3d-canvas-wrapper ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    />
  );
};

// ── Error Boundary Wrapper ──
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class HeroCanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('HeroCanvas3D caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            background: 'radial-gradient(ellipse at 50% 35%, rgba(255, 248, 230, 0.45) 0%, rgba(240, 235, 220, 0.15) 50%, transparent 80%)',
          }}
        />
      );
    }
    return this.props.children;
  }
}

export const HeroCanvas3D: React.FC<HeroCanvas3DProps> = (props) => {
  return (
    <HeroCanvasErrorBoundary>
      <HeroCanvasInternal {...props} />
    </HeroCanvasErrorBoundary>
  );
};

export default HeroCanvas3D;

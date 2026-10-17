import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Compass,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface WealthCanvasProps {
  isFullBleed?: boolean;
  onToggleFullBleed?: () => void;
  ambientOpacity?: number; // 0.1 to 1.0
}

export const WealthCanvas: React.FC<WealthCanvasProps> = ({
  isFullBleed = false,
  onToggleFullBleed,
  ambientOpacity = 0.25,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Floating controls state for full-bleed / interactive mode
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [particleDensity, setParticleDensity] = useState<'high' | 'low'>('high');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Background Fog
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x070d1e); // Deep navy horizon
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(fogColor, 0.035);

    // 2. Camera Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);

    // 3. Renderer Setup with ACESFilmicToneMapping & Studio PBR Environment
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Generate Procedural Studio Environment Map using PMREMGenerator & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio PBR Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff3d6, 3.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(hemiLight);

    // Accent Emerald Rim Light
    const rimLight = new THREE.PointLight(0x10b981, 2.8, 12);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // 5. Composite 3-12 Part Procedural Model: "The Sovereign Wealth Vault"
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, 0, 0);

    // Part 1: Heavy Beveled Titanium/Gold Plinth Base
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.25, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.1;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    vaultGroup.add(baseMesh);

    // Part 2: Inner Chamfered Ring on Base
    const innerRingGeo = new THREE.TorusGeometry(1.15, 0.06, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.12,
    });
    const baseInnerRing = new THREE.Mesh(innerRingGeo, goldMat);
    baseInnerRing.rotation.x = Math.PI / 2;
    baseInnerRing.position.y = -0.96;
    vaultGroup.add(baseInnerRing);

    // Part 3: Floating Transmissive Emerald Prism Core (Crystalline Asset)
    const prismGeo = new THREE.OctahedronGeometry(0.85, 0);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      emissiveIntensity: 0.35,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.65,
      ior: 1.52,
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    prismMesh.position.y = 0.2;
    prismMesh.castShadow = true;
    vaultGroup.add(prismMesh);

    // Part 4: Inner Floating Octahedron Cage
    const cageGeo = new THREE.OctahedronGeometry(0.92, 0);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      wireframe: true,
      metalness: 0.9,
      roughness: 0.1,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    cageMesh.position.y = 0.2;
    vaultGroup.add(cageMesh);

    // Part 5: Gimbal Orbital Ring 1 (Gold, X-axis rotation)
    const gimbal1Geo = new THREE.TorusGeometry(1.35, 0.045, 16, 80);
    const gimbal1 = new THREE.Mesh(gimbal1Geo, goldMat);
    vaultGroup.add(gimbal1);

    // Part 6: Gimbal Orbital Ring 2 (Dark Titanium, Y-axis rotation)
    const gimbal2Geo = new THREE.TorusGeometry(1.6, 0.035, 16, 80);
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.25,
    });
    const gimbal2 = new THREE.Mesh(gimbal2Geo, titaniumMat);
    vaultGroup.add(gimbal2);

    // Part 7: Outer Equatorial Coordinate Ring
    const gimbal3Geo = new THREE.TorusGeometry(1.85, 0.025, 16, 90);
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.7,
      roughness: 0.2,
    });
    const gimbal3 = new THREE.Mesh(gimbal3Geo, emeraldMat);
    gimbal3.rotation.x = Math.PI / 3;
    vaultGroup.add(gimbal3);

    // Part 8: 6 Symmetrical Floating Gold Ingots / Satellites
    const satelliteGroup = new THREE.Group();
    const ingotGeo = new THREE.BoxGeometry(0.24, 0.12, 0.38);
    const ingotMeshCount = 6;
    for (let i = 0; i < ingotMeshCount; i++) {
      const angle = (i / ingotMeshCount) * Math.PI * 2;
      const ingot = new THREE.Mesh(ingotGeo, goldMat);
      const rad = 2.05;
      ingot.position.set(Math.cos(angle) * rad, 0.2 + Math.sin(angle * 2) * 0.2, Math.sin(angle) * rad);
      ingot.rotation.y = -angle;
      ingot.rotation.z = 0.2;
      ingot.castShadow = true;
      satelliteGroup.add(ingot);
    }
    vaultGroup.add(satelliteGroup);

    // Part 9: Contact Shadow on Ground (Procedural Canvas Radial Texture)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlaneGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.22;
    vaultGroup.add(shadowPlane);

    scene.add(vaultGroup);

    // 6. Holographic Constellation Particles (Instanced Mesh for 60fps)
    const particleCount = 120;
    const particleGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.75,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    const dummy = new THREE.Object3D();
    const particleRadii: number[] = [];
    const particleAngles: number[] = [];
    const particleSpeeds: number[] = [];
    const particleHeights: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const r = 2.4 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * 3.5;
      const spd = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);

      particleRadii.push(r);
      particleAngles.push(angle);
      particleSpeeds.push(spd);
      particleHeights.push(h);

      dummy.position.set(Math.cos(angle) * r, h, Math.sin(angle) * r);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    scene.add(instancedParticles);

    // 7. Laser Grid Horizon Floor
    const gridHelper = new THREE.GridHelper(18, 24, 0x10b981, 0x1e293b);
    gridHelper.position.y = -1.23;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    scene.add(gridHelper);

    // 8. OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go under ground
    controls.minDistance = 3.5;
    controls.maxDistance = 15;
    controls.enabled = isFullBleed; // Only allow drag-orbit when fullbleed is active
    controlsRef.current = controls;

    // 9. Damped Mouse Parallax when in ambient mode
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 3.2;

    const handleMouseMove = (e: MouseEvent) => {
      if (controls.enabled) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 0.6;
      mouseY = normY * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 10. Animation Loop (Lossless 60fps with pre-allocated scratch objects)
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime() * rotationSpeed;

      // Vault Part Rotations
      prismMesh.rotation.y = elapsed * 0.6;
      prismMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
      cageMesh.rotation.y = -elapsed * 0.5;

      gimbal1.rotation.x = elapsed * 0.45;
      gimbal1.rotation.y = elapsed * 0.3;

      gimbal2.rotation.y = -elapsed * 0.5;
      gimbal2.rotation.z = elapsed * 0.25;

      gimbal3.rotation.z = elapsed * 0.35;

      satelliteGroup.rotation.y = elapsed * 0.3;

      // Floating gentle bobbing
      vaultGroup.position.y = Math.sin(elapsed * 1.2) * 0.06;

      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        const currentAngle = particleAngles[i] + elapsed * particleSpeeds[i] * 0.4;
        const r = particleRadii[i];
        const h = particleHeights[i] + Math.sin(elapsed * 1.5 + i) * 0.08;

        dummy.position.set(Math.cos(currentAngle) * r, h, Math.sin(currentAngle) * r);
        dummy.updateMatrix();
        instancedParticles.setMatrixAt(i, dummy.matrix);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;

      // Camera Damping
      if (!controls.enabled) {
        targetCameraX += (mouseX - targetCameraX) * (1 - Math.exp(-4 * delta));
        targetCameraY += (3.2 + mouseY - targetCameraY) * (1 - Math.exp(-4 * delta));
        camera.position.x = targetCameraX;
        camera.position.y = targetCameraY;
        camera.lookAt(0, 0.2, 0);
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup & Disposal on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      baseGeo.dispose();
      baseMat.dispose();
      innerRingGeo.dispose();
      goldMat.dispose();
      prismGeo.dispose();
      prismMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      gimbal1Geo.dispose();
      gimbal2Geo.dispose();
      gimbal3Geo.dispose();
      titaniumMat.dispose();
      emeraldMat.dispose();
      ingotGeo.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      shadowTexture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      instancedParticles.dispose();
      renderer.dispose();
    };
  }, [isFullBleed, rotationSpeed]);

  return (
    <div
      className={`transition-all duration-500 overflow-hidden ${
        isFullBleed
          ? 'fixed inset-0 z-50 bg-[#070D1E]'
          : 'fixed inset-0 pointer-events-none z-0'
      }`}
      style={{
        opacity: isFullBleed ? 1 : ambientOpacity,
      }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Viewport Control Dock when in Full-Bleed 3D Mode */}
      {isFullBleed && (
        <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-3 pointer-events-auto">
          {/* Main Control Pill */}
          <div className="bg-[#0B132B]/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xs text-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs tracking-tight">Sovereign Wealth Vault</span>
              </div>

              {onToggleFullBleed && (
                <button
                  onClick={onToggleFullBleed}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close 3D View"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interactive procedural Three.js PBR asset symbolizing your liquidity, reserves, and compounding wealth trajectory.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Orbit Velocity</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => setRotationSpeed(Math.max(0.2, rotationSpeed - 0.4))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{rotationSpeed.toFixed(1)}x</span>
                  <button
                    onClick={() => setRotationSpeed(Math.min(3.0, rotationSpeed + 0.4))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Navigation</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Drag to Orbit • Scroll to Zoom
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              {onToggleFullBleed && (
                <button
                  onClick={onToggleFullBleed}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

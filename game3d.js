import * as THREE from "./vendor/three.module.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

const canvas = document.getElementById("scene3d");
const shell = document.getElementById("sceneShell");

if (canvas && shell) {
  canvas.dataset.sceneModule = "loaded";

  const CELL = 1.16;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6d97c4);
  scene.fog = new THREE.Fog(0x8fb4d8, 24, 52);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(11.6, 13.4, 12.6);

  let cameraAngleTheta = -0.68;
  let cameraAnglePhi = 0.907;
  let cameraRadius = 21.75;

  function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.sin(cameraAnglePhi) * Math.sin(cameraAngleTheta);
    camera.position.z = cameraRadius * Math.sin(cameraAnglePhi) * Math.cos(cameraAngleTheta);
    camera.position.y = cameraRadius * Math.cos(cameraAnglePhi);
    camera.lookAt(0, 0, 0);
  }

  const terrainRoot = new THREE.Group();
  const routeRoot = new THREE.Group();
  const effectRoot = new THREE.Group();
  scene.add(terrainRoot, routeRoot, effectRoot);

  /* ── Pirate Lighting ── */
  const ambient = new THREE.HemisphereLight(0xffe2b8, 0x5a6f8c, 1.45);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffd08a, 4.4);
  sun.position.set(4.5, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -11;
  sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 11;
  sun.shadow.camera.bottom = -11;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x7a3eff, 1.8);
  rim.position.set(-8, 5, -8);
  scene.add(rim);

  const goldFill = new THREE.PointLight(0xffaa00, 2.5, 9);
  goldFill.position.set(5.8, 3.1, -5.4);
  scene.add(goldFill);

  /* ── Shared Geometries ── */
  const geometries = {
    tile: new THREE.BoxGeometry(CELL * 0.98, 0.08, CELL * 0.98),
    riskPlate: new THREE.BoxGeometry(CELL * 0.86, 0.035, CELL * 0.86),
    routeDot: new THREE.SphereGeometry(0.115, 18, 12),
    routeSegment: new THREE.BoxGeometry(1, 0.07, 0.12),
    rock: new THREE.DodecahedronGeometry(0.18, 0),
    shard: new THREE.BoxGeometry(0.18, 0.08, 0.24),
    packageBox: new THREE.BoxGeometry(0.55, 0.44, 0.55),
    packageBandX: new THREE.BoxGeometry(0.64, 0.06, 0.09),
    packageBandZ: new THREE.BoxGeometry(0.09, 0.06, 0.64),
    packageCrossX: new THREE.BoxGeometry(0.34, 0.03, 0.11),
    packageCrossZ: new THREE.BoxGeometry(0.11, 0.03, 0.34),
    agentBody: new THREE.BoxGeometry(0.56, 0.38, 0.5),
    agentHead: new THREE.BoxGeometry(0.46, 0.32, 0.36),
    agentWheel: new THREE.CylinderGeometry(0.14, 0.14, 0.12, 18),
    agentEye: new THREE.BoxGeometry(0.08, 0.065, 0.025),
    antenna: new THREE.CylinderGeometry(0.025, 0.025, 0.34, 8),
    glowRing: new THREE.TorusGeometry(0.46, 0.027, 10, 36),
    startPad: new THREE.CylinderGeometry(0.43, 0.43, 0.09, 32),
    flame: new THREE.ConeGeometry(0.12, 0.38, 9),
    /* Pirate specific */
    barrier: new THREE.BoxGeometry(0.86, 0.52, 0.86),
    barrierRock: new THREE.DodecahedronGeometry(0.28, 1),
    cannonBase: new THREE.BoxGeometry(0.5, 0.2, 0.5),
    cannonBarrel: new THREE.CylinderGeometry(0.08, 0.12, 0.55, 12),
    cannonBall: new THREE.SphereGeometry(0.08, 12, 8),
    fortressBase: new THREE.BoxGeometry(1.58, 0.92, 1.2),
    fortressUpper: new THREE.BoxGeometry(1.36, 0.76, 1.04),
    fortressRoof: new THREE.BoxGeometry(1.7, 0.15, 1.28),
    fortressDoor: new THREE.BoxGeometry(0.36, 0.44, 0.035),
    fortressWindow: new THREE.BoxGeometry(0.22, 0.17, 0.035),
    flagPole: new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8),
    flagCloth: new THREE.PlaneGeometry(0.5, 0.35),
    shipHull: new THREE.BoxGeometry(0.9, 0.3, 0.45),
    shipMast: new THREE.CylinderGeometry(0.025, 0.035, 0.7, 8),
    plank: new THREE.BoxGeometry(0.4, 0.04, 0.12)
  };

  /* Deniz dokusu (docs/deniz.png) - zemin karolari ve taban icin */
  const seaTexture = new THREE.TextureLoader().load("docs/deniz.png");
  seaTexture.wrapS = THREE.RepeatWrapping;
  seaTexture.wrapT = THREE.RepeatWrapping;
  seaTexture.colorSpace = THREE.SRGBColorSpace;

  /* ── Pirate Materials ── */
  const materials = {
    sand: new THREE.MeshStandardMaterial({ color: 0x1f5f82, roughness: 0.34, metalness: 0.25 }),
    sandAlt: new THREE.MeshStandardMaterial({ color: 0x247594, roughness: 0.3, metalness: 0.28 }),
    seaTile: new THREE.MeshStandardMaterial({ map: seaTexture, color: 0xeaf4fb, roughness: 0.5, metalness: 0.12 }),
    wallTile: new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.96 }),
    riskTile: new THREE.MeshStandardMaterial({ color: 0x3a1515, roughness: 0.9, emissive: 0x380808, emissiveIntensity: 0.38 }),
    rubbleTile: new THREE.MeshStandardMaterial({ color: 0x163d52, roughness: 0.4, metalness: 0.22 }),
    enemyTile: new THREE.MeshStandardMaterial({ color: 0x123445, roughness: 0.42, metalness: 0.2, emissive: 0x200505, emissiveIntensity: 0.18 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x5a5248, roughness: 0.92 }),
    rockDark: new THREE.MeshStandardMaterial({ color: 0x3a342e, roughness: 0.94 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8a6a3e, roughness: 0.88 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x5a4428, roughness: 0.9 }),
    woodLight: new THREE.MeshStandardMaterial({ color: 0xb89050, roughness: 0.85 }),
    riskGlow: new THREE.MeshBasicMaterial({ color: 0xff3a20, transparent: true, opacity: 0.34 }),
    riskLine: new THREE.LineBasicMaterial({ color: 0xff4a35, transparent: true, opacity: 0.78 }),
    route: new THREE.MeshBasicMaterial({ color: 0x00a8ff }),
    routeDot: new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x0097e6, emissiveIntensity: 2.1, roughness: 0.15 }),
    treasure: new THREE.MeshStandardMaterial({ color: 0xd4a020, roughness: 0.45, metalness: 0.4, emissive: 0x3a2800, emissiveIntensity: 0.3 }),
    treasureBand: new THREE.MeshStandardMaterial({ color: 0x5a4428, roughness: 0.62, metalness: 0.08 }),
    treasureGold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6, emissive: 0x8a6000, emissiveIntensity: 0.15 }),
    agent: new THREE.MeshStandardMaterial({
      color: 0x91a8b8,
      roughness: 0.32,
      metalness: 0.42,
      emissive: 0x12303a,
      emissiveIntensity: 0.35
    }),
    agentPanel: new THREE.MeshStandardMaterial({
      color: 0x0d151c,
      roughness: 0.34,
      metalness: 0.42,
      emissive: 0x064a59,
      emissiveIntensity: 0.28
    }),
    tire: new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.76 }),
    agentAccent: new THREE.MeshBasicMaterial({ color: 0x25d9ff }),
    fortressWall: new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.86 }),
    fortressTrim: new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.72, metalness: 0.05 }),
    fortressGlass: new THREE.MeshBasicMaterial({ color: 0x4a7088 }),
    fortressGlow: new THREE.MeshBasicMaterial({ color: 0xc9442e }),
    startGlow: new THREE.MeshBasicMaterial({ color: 0x25d9ff, transparent: true, opacity: 0.62 }),
    fire: new THREE.MeshBasicMaterial({ color: 0xff7b1a }),
    fireCore: new THREE.MeshBasicMaterial({ color: 0xffdf5a }),
    metal: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.7 }),
    cannonMetal: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.4, metalness: 0.8 }),
    flagRed: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: 0x1a4a6a, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.6 })
  };

  /* ── GLB Model Cache ── */
  const textureLoader = new THREE.TextureLoader();

  const glbLoader = new GLTFLoader();
  const modelCache = new Map();
  const MODEL_BASE = "assets/models/pirate/Models/GLB format/";

  function loadGLB(name) {
    if (modelCache.has(name)) return Promise.resolve(modelCache.get(name).clone());
    return new Promise((resolve) => {
      glbLoader.load(
        MODEL_BASE + name,
        (gltf) => {
          const model = gltf.scene;
          modelCache.set(name, model);
          resolve(model.clone());
        },
        undefined,
        () => resolve(null)
      );
    });
  }

  const interactiveTiles = [];
  const packageObjects = [];
  const enemyShips = new Map();
  let lastGridKey = "";
  let lastRouteKey = "";
  let lastStateText = "";
  let latestDetail = null;
  let packageIndexByCell = new Map();
  let agent = null;
  let waterSurface = null;
  let waterBase = null;

  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  agent = createAgent();
  effectRoot.add(agent);

  /* Paylasilan top gullesi (dusman gemiye ates edince ucar) */
  const cannonball = new THREE.Mesh(geometries.cannonBall, materials.metal);
  cannonball.scale.setScalar(1.3);
  cannonball.castShadow = true;
  cannonball.visible = false;
  cannonball.userData.active = false;
  effectRoot.add(cannonball);

  function sinkEnemy(cellKey, seconds) {
    const enemy = enemyShips.get(cellKey);
    if (enemy && !enemy.userData.sunk) {
      enemy.userData.sunk = true;
      enemy.userData.sinkStart = seconds;
      if (enemy.userData.fireGroup) enemy.userData.fireGroup.visible = true;
    }
  }

  function disposeObject(root) {
    while (root.children.length) {
      const child = root.children.pop();
      child.traverse((object) => {
        if (object.geometry && !Object.values(geometries).includes(object.geometry)) {
          object.geometry.dispose();
        }
      });
    }
  }

  function seeded(r, c, salt = 0) {
    const raw = Math.sin((r + 1) * 12.9898 + (c + 1) * 78.233 + salt * 39.425) * 43758.5453;
    return raw - Math.floor(raw);
  }

  function worldPosition(r, c, y = 0) {
    const rows = latestDetail ? latestDetail.grid.length : 12;
    const cols = latestDetail ? latestDetail.grid[0].length : 12;
    return new THREE.Vector3(
      (c - (cols - 1) / 2) * CELL,
      y,
      ((rows - 1) / 2 - r) * CELL
    );
  }

  function fitModelInsideCell(model, maxFootprint, yOffset = 0, maxScale = 1) {
    const bounds = new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    model.position.set(0, 0, 0);
    model.scale.setScalar(1);
    model.updateWorldMatrix(true, true);

    bounds.setFromObject(model);
    if (bounds.isEmpty()) return;

    bounds.getSize(size);
    bounds.getCenter(center);

    const footprint = Math.max(size.x, size.z, 0.001);
    const scale = Math.min(maxScale, maxFootprint / footprint);
    model.scale.setScalar(scale);
    model.position.set(
      -center.x * scale,
      -bounds.min.y * scale + yOffset,
      -center.z * scale
    );
  }

  function tileMaterial(tile, r, c) {
    if (tile === "#") return materials.wallTile;
    if (tile === "R") return materials.riskTile;
    if (tile === "E") return materials.rubbleTile;
    if (tile === "D") return materials.enemyTile;
    return materials.seaTile;
  }

  /* ── Agent (Pirate Ship Fallback) ── */
  function createAgent() {
    const group = new THREE.Group();

    const bodyGroup = new THREE.Group();

    // Procedural wooden boat fallback
    const hull = new THREE.Mesh(geometries.shipHull, materials.wood);
    hull.position.y = 0.25;
    hull.castShadow = true;
    hull.receiveShadow = true;

    const mast = new THREE.Mesh(geometries.shipMast, materials.woodDark);
    mast.position.set(0, 0.7, 0);
    mast.castShadow = true;

    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.45), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    sail.position.set(0, 0.75, 0.05);
    sail.castShadow = true;

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), materials.flagRed);
    flag.position.set(0.1, 1.0, 0);
    flag.rotation.y = Math.PI / 2;

    const light = new THREE.PointLight(0x25d9ff, 1.8, 4.5);
    light.position.set(0, 0.9, 0.2);

    bodyGroup.add(hull, mast, sail, flag, light);
    group.add(bodyGroup);
    group.scale.setScalar(1.55);
    group.userData.wheels = []; // Empty array to prevent iteration errors

    /* Muzzle flash (top tetiklenince gosterilir) - pruvada, gidis (dusman) yonune bakar */
    const muzzle = new THREE.Mesh(geometries.flame, materials.fireCore);
    muzzle.scale.setScalar(0.6);
    muzzle.position.set(0, 0.42, 0.5);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.visible = false;
    group.add(muzzle);
    group.userData.muzzle = muzzle;

    /* Robot yerine korsan gemisi modeli yukle */
    loadGLB("ship-pirate-medium.glb").then((model) => {
      if (!model) {
        canvas.dataset.robotModel = "fallback-ship";
        return;
      }
      const bounds = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(center);

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= bounds.min.y;
      model.scale.setScalar(0.72 / Math.max(size.x, size.z, 0.001));

      const loadedLight = new THREE.PointLight(0x25d9ff, 1.8, 4.5);
      loadedLight.position.set(0, 0.9, 0.2);

      group.remove(bodyGroup);
      if (group.userData.wheels) {
        group.userData.wheels.forEach((wheel) => {
          wheel.visible = false;
        });
      }
      if (group.userData.ring) group.userData.ring.visible = false;
      group.userData.shipModel = model;
      canvas.dataset.robotModel = "ship-pirate-medium-glb";
      group.add(model, loadedLight);
    });

    return group;
  }

  /* ── Treasure Chest ── */
  function createPackage() {
    const group = new THREE.Group();

    const procPackage = new THREE.Group();
    const box = new THREE.Mesh(geometries.packageBox, materials.treasure);
    box.position.y = 0.34;
    box.castShadow = true;
    box.receiveShadow = true;

    const bandX = new THREE.Mesh(geometries.packageBandX, materials.treasureBand);
    bandX.position.y = 0.58;

    const bandZ = new THREE.Mesh(geometries.packageBandZ, materials.treasureBand);
    bandZ.position.y = 0.59;

    const crossX = new THREE.Mesh(geometries.packageCrossX, materials.treasureGold);
    crossX.position.y = 0.625;

    const crossZ = new THREE.Mesh(geometries.packageCrossZ, materials.treasureGold);
    crossZ.position.y = 0.63;

    for (let i = 0; i < 3; i++) {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12),
        materials.treasureGold
      );
      coin.position.set(
        (Math.random() - 0.5) * 0.4,
        0.14 + i * 0.02,
        (Math.random() - 0.5) * 0.4
      );
      coin.rotation.x = Math.random() * 0.5;
      coin.rotation.z = Math.random() * 0.5;
      procPackage.add(coin);
    }

    const light = new THREE.PointLight(0xf5c542, 0.9, 2.3);
    light.position.y = 0.8;

    procPackage.add(box, bandX, bandZ, crossX, crossZ, light);
    group.add(procPackage);

    loadGLB("chest.glb").then((model) => {
      if (model) {
        group.remove(procPackage);
        model.scale.setScalar(0.72);
        model.position.set(0, 0, 0);
        model.rotation.y = Math.random() * Math.PI * 2;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model, light);
      }
    });

    return group;
  }
  /* ── Pirate Fortress (Goal) ── */
  function createFortress(r, c) {
    const group = new THREE.Group();
    const position = worldPosition(r, c);
    const angle = Math.atan2(-position.x, -position.z);

    function enableCastleShadows(root) {
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    function addBattlements(parent, y, z, width, count) {
      for (let i = 0; i < count; i += 1) {
        const x = -width / 2 + (width / Math.max(count - 1, 1)) * i;
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.15, 0.18), materials.fortressTrim);
        block.position.set(x, y, z);
        block.castShadow = true;
        block.receiveShadow = true;
        parent.add(block);
      }
    }

    const procFortress = new THREE.Group();
    procFortress.rotation.y = angle;

    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.9, 0.48), materials.fortressWall);
    wall.position.set(0, 0.54, 0.05);
    wall.castShadow = true;
    wall.receiveShadow = true;

    const leftTower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 1.32, 10), materials.fortressWall);
    leftTower.position.set(-0.62, 0.72, 0.03);
    leftTower.castShadow = true;
    leftTower.receiveShadow = true;

    const rightTower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 1.32, 10), materials.fortressWall);
    rightTower.position.set(0.62, 0.72, 0.03);
    rightTower.castShadow = true;
    rightTower.receiveShadow = true;

    const towerTopLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.18, 10), materials.fortressTrim);
    towerTopLeft.position.set(-0.62, 1.42, 0.03);
    towerTopLeft.castShadow = true;
    towerTopLeft.receiveShadow = true;

    const towerTopRight = towerTopLeft.clone();
    towerTopRight.position.x = 0.62;

    const upperWalk = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.18, 0.56), materials.fortressTrim);
    upperWalk.position.set(0, 1.08, 0.05);
    upperWalk.castShadow = true;
    upperWalk.receiveShadow = true;

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.05), materials.woodDark);
    door.position.set(0, 0.38, 0.31);

    const doorwayGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.64, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x8d45ff, transparent: true, opacity: 0.72 })
    );
    doorwayGlow.position.set(0, 0.4, 0.345);

    const entrancePlatform = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.58), materials.woodLight);
    entrancePlatform.position.set(0, 0.08, 0.78);
    entrancePlatform.castShadow = true;
    entrancePlatform.receiveShadow = true;

    const stepOne = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.18), materials.fortressTrim);
    stepOne.position.set(0, 0.12, 0.56);
    stepOne.castShadow = true;
    stepOne.receiveShadow = true;

    const stepTwo = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.18), materials.fortressTrim);
    stepTwo.position.set(0, 0.1, 1.0);
    stepTwo.castShadow = true;
    stepTwo.receiveShadow = true;

    const flagPole = new THREE.Mesh(geometries.flagPole, materials.woodDark);
    flagPole.position.set(0, 1.75, -0.07);

    const flagCloth = new THREE.Mesh(geometries.flagCloth, materials.flagRed);
    flagCloth.position.set(0.28, 1.97, -0.07);
    flagCloth.rotation.y = Math.PI / 2;

    const skullEmb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    skullEmb.position.set(0.28, 1.97, -0.05);

    const windowPositions = [
      [-0.62, 0.74, 0.35],
      [0.62, 0.74, 0.35]
    ];
    const windows = windowPositions.map(([x, y, z]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.22, 0.04), materials.fortressGlass);
      win.position.set(x, y, z);
      return win;
    });

    const torchLight1 = new THREE.PointLight(0xff6a16, 1.8, 3.5);
    torchLight1.position.set(-0.48, 0.8, 0.46);
    const torchLight2 = new THREE.PointLight(0xff6a16, 1.8, 3.5);
    torchLight2.position.set(0.48, 0.8, 0.46);

    const glow = new THREE.PointLight(0x8d45ff, 3.6, 4.8);
    glow.position.set(0, 0.95, 0.4);

    addBattlements(procFortress, 1.22, 0.31, 1.05, 5);

    procFortress.add(
      wall,
      leftTower,
      rightTower,
      towerTopLeft,
      towerTopRight,
      upperWalk,
      doorwayGlow,
      door,
      entrancePlatform,
      stepOne,
      stepTwo,
      flagPole,
      flagCloth,
      skullEmb,
      glow,
      torchLight1,
      torchLight2,
      ...windows
    );
    group.add(procFortress);

    loadGLB("castle-gate.glb").then((model) => {
      if (!model) return;

      const loadedFortress = new THREE.Group();
      loadedFortress.rotation.y = angle;
      enableCastleShadows(model);

      const bounds = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(center);
      model.position.sub(center);
      model.scale.setScalar(1.95 / Math.max(size.x, size.z, 0.001));
      model.rotation.y = Math.PI;
      model.updateWorldMatrix(true, true);

      const fittedBounds = new THREE.Box3().setFromObject(model);
      model.position.y += -fittedBounds.min.y + 0.03;
      model.position.z -= 0.08;

      const loadedBridge = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.62), materials.woodLight);
      loadedBridge.position.set(0, 0.09, 0.86);
      loadedBridge.castShadow = true;
      loadedBridge.receiveShadow = true;

      const loadedStep = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.07, 0.22), materials.fortressTrim);
      loadedStep.position.set(0, 0.13, 0.55);
      loadedStep.castShadow = true;
      loadedStep.receiveShadow = true;

      const portalGlow = new THREE.PointLight(0x9d4cff, 4.6, 5.2);
      portalGlow.position.set(0, 0.95, 0.4);

      const torchLeft = new THREE.PointLight(0xff7a1a, 1.6, 3.4);
      torchLeft.position.set(-0.55, 0.82, 0.48);
      const torchRight = new THREE.PointLight(0xff7a1a, 1.6, 3.4);
      torchRight.position.set(0.55, 0.82, 0.48);

      loadedFortress.add(model, loadedBridge, loadedStep, portalGlow, torchLeft, torchRight);
      group.remove(procFortress);
      group.add(loadedFortress);
    });

    return group;
  }

  /* ── Rock Barrier ── */
  function createBarrier(r, c) {
    const group = new THREE.Group();

    // Obstacles stay compact so they do not spill into walkable route cells.
    const categorySeed = seeded(r, c, 111);
    let category = "rocks";
    if (categorySeed < 0.35) {
      category = "rocks";
    } else if (categorySeed < 0.65) {
      category = "sandRocks";
    } else if (categorySeed < 0.8) {
      category = "cargo";
    } else {
      category = "ruins";
    }

    const procBarrier = new THREE.Group();
    const seed = seeded(r, c, 42);

    // Build procedural fallback based on category
    if (category === "rocks" || category === "sandRocks") {
      const rockCount = 2 + Math.floor(seed * 3);
      for (let i = 0; i < rockCount; i++) {
        const s = seeded(r, c, i * 7 + 3);
        const rockGeo = i % 2 === 0 ? geometries.barrierRock : geometries.rock;
        const rockMat = category === "rocks" ? (i % 3 === 0 ? materials.rockDark : materials.rock) : (i % 2 === 0 ? materials.sand : materials.wood);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(
          (seeded(r, c, i * 5 + 1) - 0.5) * 0.5,
          0.26 + s * 0.42,
          (seeded(r, c, i * 5 + 2) - 0.5) * 0.5
        );
        rock.rotation.set(s * 2, s * 3, s * 1.5);
        rock.scale.setScalar(0.76 + s * 0.6);
        rock.castShadow = true;
        rock.receiveShadow = true;
        procBarrier.add(rock);
      }
    } else if (category === "cargo") {
      const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), materials.woodDark);
      crate1.position.set(-0.18, 0.2, -0.1);
      crate1.rotation.y = 0.2;
      crate1.castShadow = true;
      crate1.receiveShadow = true;

      const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), materials.wood);
      crate2.position.set(0.18, 0.175, 0.1);
      crate2.rotation.y = -0.4;
      crate2.castShadow = true;
      crate2.receiveShadow = true;

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 12), materials.woodDark);
      barrel.position.set(0.0, 0.2, -0.15);
      barrel.castShadow = true;
      barrel.receiveShadow = true;

      procBarrier.add(crate1, crate2, barrel);
    } else if (category === "ruins") {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.58, 0.28), materials.fortressWall);
      wall.position.set(0, 0.29, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;

      const wallTrim = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.38), materials.fortressTrim);
      wallTrim.position.set(0, 0.59, 0);
      wallTrim.castShadow = true;

      procBarrier.add(wall, wallTrim);
    }

    group.add(procBarrier);

    // Select the GLB model based on category
    let modelName = "rocks-a.glb";
    let maxModelScale = 0.5;
    let modelFootprint = CELL * 0.72;
    let yOffset = 0.04;

    if (category === "rocks") {
      const rockModels = ["rocks-a.glb", "rocks-b.glb", "rocks-c.glb"];
      modelName = rockModels[Math.floor(seed * rockModels.length)];
      maxModelScale = 0.82;
      modelFootprint = CELL * 1.18;
      yOffset = 0.04;
    } else if (category === "sandRocks") {
      const sandRockModels = ["rocks-sand-a.glb", "rocks-sand-b.glb", "rocks-sand-c.glb"];
      modelName = sandRockModels[Math.floor(seed * sandRockModels.length)];
      maxModelScale = 0.82;
      modelFootprint = CELL * 1.18;
      yOffset = 0.04;
    } else if (category === "cargo") {
      const cargoModels = ["crate-bottles.glb", "crate.glb", "barrel.glb"];
      modelName = cargoModels[Math.floor(seed * cargoModels.length)];
      maxModelScale = 0.52;
      modelFootprint = CELL * 0.7;
      yOffset = 0.03;
    } else if (category === "ruins") {
      const ruinModels = ["castle-wall.glb", "structure-fence.glb", "structure-fence-sides.glb"];
      modelName = ruinModels[Math.floor(seed * ruinModels.length)];
      maxModelScale = 0.48;
      modelFootprint = CELL * 0.76;
      yOffset = 0.05;
    }

    loadGLB(modelName).then((model) => {
      if (model) {
        group.remove(procBarrier);
        model.rotation.y = seed * Math.PI * 2;
        fitModelInsideCell(model, modelFootprint, yOffset, maxModelScale);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model);
      }
    });

    return group;
  }

  /* ── Shipwreck (Rubble) ── */
  function createShipwreck(withFire = true) {
    const group = new THREE.Group();

    const procShip = new THREE.Group();
    const hull = new THREE.Mesh(geometries.shipHull, materials.woodDark);
    hull.position.set(0, 0.18, 0);
    hull.rotation.z = 0.2;
    hull.castShadow = true;
    hull.receiveShadow = true;
    procShip.add(hull);

    const mast = new THREE.Mesh(geometries.shipMast, materials.wood);
    mast.position.set(0.1, 0.45, 0);
    mast.rotation.z = 0.6;
    mast.castShadow = true;
    procShip.add(mast);

    for (let i = 0; i < 3; i++) {
      const plank = new THREE.Mesh(geometries.plank, materials.woodLight);
      plank.position.set(
        (Math.random() - 0.5) * 0.5,
        0.08,
        (Math.random() - 0.5) * 0.5
      );
      plank.rotation.set(0, Math.random() * Math.PI, Math.random() * 0.3);
      plank.castShadow = true;
      procShip.add(plank);
    }
    group.add(procShip);

    let fireElements = null;
    if (withFire) {
      fireElements = new THREE.Group();
      const flameOuter = new THREE.Mesh(geometries.flame, materials.fire);
      flameOuter.position.set(0.05, 0.42, 0.02);
      flameOuter.rotation.y = 0.4;

      const flameCore = new THREE.Mesh(geometries.flame, materials.fireCore);
      flameCore.position.set(0.05, 0.38, 0.02);
      flameCore.scale.setScalar(0.58);

      const fireLight = new THREE.PointLight(0xff6a16, 1.4, 3);
      fireLight.position.set(0.05, 0.58, 0.02);
      fireElements.add(flameOuter, flameCore, fireLight);
      group.userData.fire = flameOuter;
      group.add(fireElements);
    }

    loadGLB("ship-wreck.glb").then((model) => {
      if (model) {
        group.remove(procShip);
        model.scale.setScalar(0.24);
        model.position.set(0, 0.05, 0);
        model.rotation.y = Math.PI / 4;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model);
        if (fireElements) {
          fireElements.position.set(0, 0.1, 0);
        }
      }
    });

    return group;
  }

  /* ── Enemy Ship (Dusman Gemisi) ── */
  function createEnemyShip(r, c) {
    const group = new THREE.Group();

    /* Procedural fallback gemi (GLB yuklenince kaldirilir) */
    const procShip = new THREE.Group();
    const hull = new THREE.Mesh(geometries.shipHull, materials.woodDark);
    hull.position.set(0, 0.2, 0);
    hull.castShadow = true;
    hull.receiveShadow = true;
    procShip.add(hull);
    const mast = new THREE.Mesh(geometries.shipMast, materials.wood);
    mast.position.set(0, 0.55, 0);
    mast.castShadow = true;
    procShip.add(mast);
    const sail = new THREE.Mesh(geometries.flagCloth, materials.flagRed);
    sail.position.set(0, 0.62, 0.04);
    procShip.add(sail);
    group.add(procShip);

    /* Gizli alev (gemi batinca gosterilir) */
    const fireElements = new THREE.Group();
    const flameOuter = new THREE.Mesh(geometries.flame, materials.fire);
    flameOuter.position.set(0, 0.5, 0);
    const flameCore = new THREE.Mesh(geometries.flame, materials.fireCore);
    flameCore.position.set(0, 0.46, 0);
    flameCore.scale.setScalar(0.58);
    const fireLight = new THREE.PointLight(0xff6a16, 1.4, 3);
    fireLight.position.set(0, 0.72, 0);
    fireElements.add(flameOuter, flameCore, fireLight);
    fireElements.visible = false;
    group.add(fireElements);

    group.userData.enemyCell = `${r},${c}`;
    group.userData.sunk = false;
    group.userData.sinkStart = undefined;
    group.userData.fireGroup = fireElements;
    group.userData.fireLight = fireLight;
    group.userData.flame = flameOuter;
    group.userData.baseY = 0;
    group.userData.bob = seeded(r, c, 21) * Math.PI * 2;

    loadGLB("ship-small.glb").then((model) => {
      if (model) {
        group.remove(procShip);
        model.scale.setScalar(0.26);
        model.position.set(0, 0.06, 0);
        model.rotation.y = seeded(r, c, 12) * Math.PI * 2;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model);
      }
    });

    return group;
  }

  /* ── Cannon Risk Zone ── */
  function createRiskZone() {
    const group = new THREE.Group();
    const plate = new THREE.Mesh(geometries.riskPlate, materials.riskGlow);
    plate.position.y = 0.095;
    group.add(plate);

    const procCannon = new THREE.Group();
    const cannonBase = new THREE.Mesh(geometries.cannonBase, materials.wood);
    cannonBase.position.y = 0.16;
    cannonBase.castShadow = true;
    procCannon.add(cannonBase);

    const barrel = new THREE.Mesh(geometries.cannonBarrel, materials.cannonMetal);
    barrel.position.set(0, 0.32, 0.15);
    barrel.rotation.x = -Math.PI / 6;
    barrel.castShadow = true;
    procCannon.add(barrel);

    for (let i = 0; i < 3; i++) {
      const ball = new THREE.Mesh(geometries.cannonBall, materials.cannonMetal);
      ball.position.set(-0.15 + i * 0.12, 0.1, -0.18);
      ball.castShadow = true;
      procCannon.add(ball);
    }
    procCannon.scale.setScalar(1.32);
    group.add(procCannon);

    const half = CELL * 0.43;
    const step = (half * 2) / 4;
    const points = [];
    for (let i = 0; i <= 4; i += 1) {
      const p = -half + step * i;
      points.push(-half, 0.13, p, half, 0.13, p);
      points.push(p, 0.13, -half, p, 0.13, half);
    }
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(points, 3)),
      materials.riskLine
    );
    group.add(grid);

    const light = new THREE.PointLight(0xff2418, 0.7, 2.8);
    light.position.y = 0.45;
    group.add(light);

    loadGLB("cannon.glb").then((model) => {
      if (model) {
        group.remove(procCannon);
        model.scale.setScalar(0.68);
        model.position.set(0, 0.08, 0);
        model.rotation.y = Math.PI;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model);
      }
    });

    return group;
  }

  /* ── Pirate Flag Start Pad ── */
  function createStartPad() {
    const group = new THREE.Group();
    const pad = new THREE.Mesh(geometries.startPad, materials.startGlow);
    pad.position.y = 0.13;
    group.add(pad);

    const procFlag = new THREE.Group();
    const pole = new THREE.Mesh(geometries.flagPole, materials.wood);
    pole.position.set(0.3, 0.7, 0.3);
    procFlag.add(pole);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2ea87a, side: THREE.DoubleSide, roughness: 0.7 })
    );
    flag.position.set(0.48, 1.15, 0.3);
    flag.rotation.y = Math.PI / 2;
    procFlag.add(flag);

    const anchorVert = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.25, 0.04),
      materials.metal
    );
    anchorVert.position.set(-0.3, 0.22, -0.3);
    procFlag.add(anchorVert);

    const anchorHorz = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.04),
      materials.metal
    );
    anchorHorz.position.set(-0.3, 0.12, -0.3);
    procFlag.add(anchorHorz);
    group.add(procFlag);

    const ring = new THREE.Mesh(geometries.glowRing, materials.startGlow);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.18;
    group.userData.ring = ring;
    group.add(ring);

    loadGLB("flag-pirate.glb").then((model) => {
      if (model) {
        group.remove(procFlag);
        model.scale.setScalar(0.42);
        model.position.set(0, 0.08, 0);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(model);
      }
    });

    return group;
  }

  function addScatteredDebris(root, r, c, tile) {
    if (tile !== "#" && tile !== "E") return;
    const s = seeded(r, c, 1);
    if (s < 0.9) return;

    const items = ["bottle.glb", "tool-shovel.glb", "cannon-ball.glb"];
    const idx = Math.floor(seeded(r, c, 2) * items.length);
    const itemName = items[idx];

    loadGLB(itemName).then((model) => {
      if (model) {
        const offset = new THREE.Vector3(
          (seeded(r, c, 3) - 0.5) * 0.6,
          0.05,
          (seeded(r, c, 4) - 0.5) * 0.6
        );
        model.position.copy(worldPosition(r, c)).add(offset);
        
        let scale = 0.22 + seeded(r, c, 5) * 0.08;
        if (itemName === "bottle.glb") scale *= 0.6;
        if (itemName === "tool-shovel.glb") scale *= 0.9;
        if (itemName === "cannon-ball.glb") scale *= 0.45;

        model.scale.setScalar(scale);
        model.rotation.y = seeded(r, c, 6) * Math.PI * 2;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        root.add(model);
      }
    });
  }

  /* ── Build the terrain ── */
  function buildTerrain(gridRows) {
    canvas.dataset.sceneTerrain = String(gridRows.length);
    disposeObject(terrainRoot);
    interactiveTiles.length = 0;
    packageObjects.length = 0;
    enemyShips.clear();
    packageIndexByCell = new Map();

    const rows = gridRows.length;
    const cols = gridRows[0].length;

    /* Cevre kumsali (geminin gezmedigi alan) - acik kum tonu */
    const oceanGeo = new THREE.BoxGeometry(cols * CELL + 3, 0.34, rows * CELL + 3);
    const ocean = new THREE.Mesh(
      oceanGeo,
      new THREE.MeshStandardMaterial({ color: 0xcbb083, roughness: 0.95, metalness: 0.02 })
    );
    ocean.position.y = -0.28;
    ocean.receiveShadow = true;
    terrainRoot.add(ocean);

    /* Island base -> karolarin etrafindaki acik kum rim */
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(cols * CELL + 1.05, 0.34, rows * CELL + 1.05),
      new THREE.MeshStandardMaterial({ color: 0xe3cb97, roughness: 0.94, metalness: 0.02 })
    );
    base.position.y = -0.22;
    base.receiveShadow = true;
    terrainRoot.add(base);

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(cols * CELL + 1.22, 0.32, rows * CELL + 1.22),
      new THREE.MeshStandardMaterial({ color: 0xb89a62, roughness: 0.9, metalness: 0.02 })
    );
    edge.position.y = -0.44;
    edge.receiveShadow = true;
    terrainRoot.add(edge);

    let packageIndex = 0;
    for (let r = 0; r < gridRows.length; r += 1) {
      const row = gridRows[r];
      for (let c = 0; c < row.length; c += 1) {
        const tile = row[c];
        const position = worldPosition(r, c);
        const tileMesh = new THREE.Mesh(geometries.tile, tileMaterial(tile, r, c));
        tileMesh.position.copy(position);
        tileMesh.receiveShadow = true;
        tileMesh.userData = { r, c, tile };
        terrainRoot.add(tileMesh);
        interactiveTiles.push(tileMesh);

        addScatteredDebris(terrainRoot, r, c, tile);

        if (tile === "#") {
          const seed = seeded(r, c, 77);
          if (seed < 0.04) {
            const block = createShipwreck(false);
            block.position.copy(worldPosition(r, c));
            terrainRoot.add(block);
          } else {
            const block = createBarrier(r, c);
            block.position.copy(worldPosition(r, c));
            terrainRoot.add(block);
          }
        } else if (tile === "R") {
          const risk = createRiskZone();
          risk.position.copy(worldPosition(r, c));
          terrainRoot.add(risk);
        } else if (tile === "E") {
          const wreck = createShipwreck(true);
          wreck.position.copy(worldPosition(r, c));
          terrainRoot.add(wreck);
        } else if (tile === "D") {
          const enemy = createEnemyShip(r, c);
          enemy.position.copy(worldPosition(r, c));
          enemy.userData.baseY = enemy.position.y;
          enemyShips.set(`${r},${c}`, enemy);
          terrainRoot.add(enemy);
        } else if (tile === "P") {
          const chest = createPackage();
          chest.position.copy(worldPosition(r, c));
          chest.userData.packageIndex = packageIndex;
          packageObjects.push(chest);
          packageIndexByCell.set(`${r},${c}`, packageIndex);
          packageIndex += 1;
          terrainRoot.add(chest);
        } else if (tile === "H") {
          const fortress = createFortress(r, c);
          fortress.position.copy(worldPosition(r, c));
          terrainRoot.add(fortress);
        } else if (tile === "S") {
          const start = createStartPad();
          start.position.copy(worldPosition(r, c));
          terrainRoot.add(start);
        }
      }
    }

    /* Hareketli deniz yuzeyi (karolarin uzerinde dalgalanan yari saydam su) */
    const waterGeo = new THREE.PlaneGeometry(cols * CELL, rows * CELL, cols * 2, rows * 2);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(
      waterGeo,
      new THREE.MeshStandardMaterial({
        color: 0x2f8fc4,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
        metalness: 0.45,
        flatShading: true
      })
    );
    water.position.set(0, 0.09, 0);
    water.renderOrder = 2;
    terrainRoot.add(water);
    waterSurface = water;
    waterBase = Float32Array.from(waterGeo.attributes.position.array);

    /* Grid overlay */
    const gridHelper = new THREE.GridHelper(cols * CELL, cols, 0x8a7a5a, 0x5a4a3a);
    gridHelper.position.y = 0.075;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.28;
    terrainRoot.add(gridHelper);

    /* Load off-board decorative GLB models asynchronously */
    loadDecorations(gridRows);
  }

  /* ── Decorative GLB models ── */
  async function loadDecorations(gridRows) {
    const rows = gridRows.length;
    const cols = gridRows[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = gridRows[r][c];
        if (tile !== ".") continue;
        const s = seeded(r, c, 99);
        const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;

        if (isEdge && s >= 0.88) {
          const boat = await loadGLB("boat-row-small.glb");
          if (boat) {
            const pos = worldPosition(r, c);
            if (r === 0) pos.z += CELL * 0.95;
            if (r === rows - 1) pos.z -= CELL * 0.95;
            if (c === 0) pos.x -= CELL * 0.95;
            if (c === cols - 1) pos.x += CELL * 0.95;
            pos.y = -0.02;

            boat.position.copy(pos);
            boat.scale.setScalar(0.7);
            boat.rotation.y = Math.atan2(-pos.x, -pos.z) + Math.PI / 2;
            boat.rotation.x = Math.sin(r + c) * 0.05;

            boat.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            terrainRoot.add(boat);
          }
        }
      }
    }
  }

  function createRouteSegment(a, b) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    const segment = new THREE.Mesh(geometries.routeSegment, materials.route);
    segment.position.set((a.x + b.x) / 2, 0.16, (a.z + b.z) / 2);
    segment.scale.x = Math.max(0.1, length);
    segment.rotation.y = -Math.atan2(dz, dx);
    return segment;
  }

  function buildRoute(result) {
    disposeObject(routeRoot);
    if (!result || !result.success || !result.path.length) return;

    const points = result.path.map((node) => worldPosition(node.r, node.c, 0.18));

    for (let i = 0; i < points.length - 1; i += 1) {
      const segment = createRouteSegment(points[i], points[i + 1]);
      segment.userData.routePulseOffset = i * 0.04;
      routeRoot.add(segment);
    }

    for (let i = 0; i < points.length; i += 2) {
      const dot = new THREE.Mesh(geometries.routeDot, materials.routeDot);
      dot.position.copy(points[i]);
      dot.userData.routePulseOffset = i * 0.08;
      routeRoot.add(dot);
    }
  }

  function currentNode(detail) {
    if (detail.result && detail.result.path.length > 0) {
      return detail.result.path[Math.min(detail.pathIndex, detail.result.path.length - 1)];
    }
    for (let r = 0; r < detail.grid.length; r += 1) {
      const c = detail.grid[r].indexOf("S");
      if (c !== -1) return { r, c, mask: 0 };
    }
    return { r: 0, c: 0, mask: 0 };
  }

  function agentWorldPosition(node) {
    const target = worldPosition(node.r, node.c, 0.18);
    return target;
  }

  function updateAgent(detail) {
    const node = currentNode(detail);
    const target = agentWorldPosition(node);
    
    const isFirstLoad = !agent.userData.targetPosition || detail.pathIndex === 0;
    agent.userData.targetPosition = target;
    agent.userData.baseY = target.y;

    const path = detail.result && detail.result.path ? detail.result.path : [];
    if (detail.pathIndex + 1 < path.length) {
      const next = path[detail.pathIndex + 1];
      const nextPosition = agentWorldPosition(next);
      const angle = Math.atan2(nextPosition.x - target.x, nextPosition.z - target.z);
      agent.userData.targetRotation = angle;
    }

    if (isFirstLoad) {
      agent.position.copy(target);
      if (agent.userData.targetRotation !== undefined) {
        agent.rotation.y = agent.userData.targetRotation;
      } else {
        agent.rotation.y = 0;
      }
    }

    const mask = node.mask || 0;
    for (const pack of packageObjects) {
      const bit = 1 << pack.userData.packageIndex;
      pack.visible = (mask & bit) === 0;
    }

    /* Dusman gemileri: bir adim once ates, gulle varinca batar (D karolari) */
    if (enemyShips.size > 0) {
      const now = performance.now() / 1000;

      if (detail.pathIndex === 0) {
        enemyShips.forEach((enemy) => {
          enemy.userData.sunk = false;
          enemy.userData.sinkStart = undefined;
          enemy.userData.targeted = false;
          if (enemy.userData.fireGroup) enemy.userData.fireGroup.visible = false;
        });
        cannonball.userData.active = false;
        cannonball.visible = false;
      }

      /* Gecilmis dusmanlari (rota ortasindan yuklenme vb.) animasyonsuz batir */
      for (let i = 0; i <= Math.min(detail.pathIndex, path.length - 1); i += 1) {
        const pnode = path[i];
        if (!pnode || pnode.tile !== "D") continue;
        const enemy = enemyShips.get(`${pnode.r},${pnode.c}`);
        if (enemy && !enemy.userData.sunk && !enemy.userData.targeted) {
          enemy.userData.sunk = true;
          enemy.userData.sinkStart = now;
          if (enemy.userData.fireGroup) enemy.userData.fireGroup.visible = true;
        }
      }

      /* Bir adim once: bir sonraki karo dusman gemisi ise simdi ates et */
      const nextNode = path[detail.pathIndex + 1];
      if (nextNode && nextNode.tile === "D") {
        const cellKey = `${nextNode.r},${nextNode.c}`;
        const enemy = enemyShips.get(cellKey);
        if (enemy && !enemy.userData.targeted && !enemy.userData.sunk) {
          enemy.userData.targeted = true;
          agent.userData.firing = now;

          /* Onceki gulle hala ucuyorsa onceki hedefi hemen batir (tek gulle paylasimi) */
          if (cannonball.userData.active && cannonball.userData.enemyCell) {
            sinkEnemy(cannonball.userData.enemyCell, now);
          }

          const from = agentWorldPosition(path[detail.pathIndex]);
          from.y += 0.32;
          const to = enemy.position.clone();
          to.y += 0.4;
          cannonball.userData = { active: true, from, to, startTime: now, duration: 0.4, enemyCell: cellKey };
          cannonball.position.copy(from);
          cannonball.visible = true;
        }
      }
    }
  }

  function renderFromDetail(detail) {
    if (!detail || !detail.grid || !detail.grid.length) return;
    latestDetail = detail;
    const gridKey = detail.grid.join("|");
    const routeKey = detail.result && detail.result.success
      ? detail.result.path.map((node) => `${node.r},${node.c}`).join("|")
      : "";

    if (gridKey !== lastGridKey) {
      buildTerrain(detail.grid);
      lastGridKey = gridKey;
      buildRoute(detail.result);
      lastRouteKey = routeKey;
    } else if (routeKey !== lastRouteKey) {
      buildRoute(detail.result);
      lastRouteKey = routeKey;
    }

    updateAgent(detail);
  }

  function resizeRenderer() {
    const width = shell.clientWidth;
    const height = shell.clientHeight;
    if (width < 10 || height < 10) return false;

    const canvasWidth = canvas.width / renderer.getPixelRatio();
    const canvasHeight = canvas.height / renderer.getPixelRatio();
    if (Math.abs(canvasWidth - width) > 1 || Math.abs(canvasHeight - height) > 1) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (camera.aspect < 0.9) {
        camera.fov = 84;
        cameraRadius = 35.5;
      } else {
        camera.fov = 48;
        cameraRadius = 21.75;
      }
      camera.updateProjectionMatrix();
      updateCameraPosition();
    }
    window.__rescue3dDebug = {
      width,
      height,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      pixelRatio: renderer.getPixelRatio()
    };
    return true;
  }

  function selectedBrush() {
    const selected = document.querySelector("input[name='brush']:checked");
    return selected ? selected.value : ".";
  }

  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;

  function handlePointerDown(event) {
    isDragging = true;
    hasMoved = false;
    startX = event.clientX;
    startY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (Math.hypot(dx, dy) > 4) {
      hasMoved = true;
    }

    startX = event.clientX;
    startY = event.clientY;

    cameraAngleTheta -= dx * 0.005;
    cameraAnglePhi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraAnglePhi + dy * 0.005));
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    isDragging = false;
    canvas.releasePointerCapture(event.pointerId);

    if (!hasMoved) {
      if (!window.AkilliKurtarmaApp) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveTiles, false)[0];
      if (!hit) return;
      const { r, c } = hit.object.userData;
      window.AkilliKurtarmaApp.setCell(r, c, selectedBrush());
    }
  }

  function handlePointerCancel(event) {
    isDragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function readStateNode() {
    const stateNode = document.getElementById("gameStateData");
    if (!stateNode) return false;
    const text = stateNode.textContent.trim();
    if (!text || text === "{}" || text === lastStateText) return false;

    try {
      const detail = JSON.parse(text);
      lastStateText = text;
      resizeRenderer();
      renderFromDetail(detail);
      return true;
    } catch (error) {
      canvas.dataset.sceneError = error.message;
      return false;
    }
  }

  function animate(time) {
    requestAnimationFrame(animate);
    const canRender = resizeRenderer();
    if (!canRender) return;

    const seconds = time * 0.001;

    // Smooth position lerp
    if (agent.userData.targetPosition) {
      agent.position.x = THREE.MathUtils.lerp(agent.position.x, agent.userData.targetPosition.x, 0.12);
      agent.position.z = THREE.MathUtils.lerp(agent.position.z, agent.userData.targetPosition.z, 0.12);
      agent.userData.baseY = THREE.MathUtils.lerp(agent.userData.baseY || 0.22, agent.userData.targetPosition.y, 0.12);
    }
    agent.position.y = (agent.userData.baseY || 0.22) + Math.sin(seconds * 4.2) * 0.035;

    // Smooth rotation lerp (handling angle wrapping)
    if (agent.userData.targetRotation !== undefined) {
      let diff = agent.userData.targetRotation - agent.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      agent.rotation.y += diff * 0.12;
    }
    const isMoving = agent.userData.targetPosition && 
      agent.position.distanceToSquared(agent.userData.targetPosition) > 0.005;

    if (agent.userData.mixer) {
      const deltaTime = Math.min(0.1, (time - (animate.lastTime || time)) * 0.001);
      agent.userData.mixer.update(deltaTime);

      const idleAction = agent.userData.idleAction;
      const runAction = agent.userData.runAction;
      if (idleAction && runAction) {
        if (isMoving) {
          if (idleAction.weight > 0 && !runAction.isRunning()) {
            runAction.reset().play();
            idleAction.crossFadeTo(runAction, 0.25, true);
          }
        } else {
          if (runAction.weight > 0 && !idleAction.isRunning()) {
            idleAction.reset().play();
            runAction.crossFadeTo(idleAction, 0.25, true);
          }
        }
      }
    } else {
      if (isMoving) {
        const walkSpeed = 12.0;
        const angleRange = 0.45;
        const cycle = Math.sin(seconds * walkSpeed);

        if (agent.userData.leftArm) agent.userData.leftArm.rotation.x = cycle * angleRange;
        if (agent.userData.rightArm) agent.userData.rightArm.rotation.x = -cycle * angleRange;
        if (agent.userData.leftLeg) agent.userData.leftLeg.rotation.x = -cycle * angleRange;
        if (agent.userData.rightLeg) agent.userData.rightLeg.rotation.x = cycle * angleRange;
      } else {
        const idleFactor = 0.15;
        if (agent.userData.leftArm) agent.userData.leftArm.rotation.x = THREE.MathUtils.lerp(agent.userData.leftArm.rotation.x, 0, idleFactor);
        if (agent.userData.rightArm) agent.userData.rightArm.rotation.x = THREE.MathUtils.lerp(agent.userData.rightArm.rotation.x, 0, idleFactor);
        if (agent.userData.leftLeg) agent.userData.leftLeg.rotation.x = THREE.MathUtils.lerp(agent.userData.leftLeg.rotation.x, 0, idleFactor);
        if (agent.userData.rightLeg) agent.userData.rightLeg.rotation.x = THREE.MathUtils.lerp(agent.userData.rightLeg.rotation.x, 0, idleFactor);
      }
    }
    animate.lastTime = time;

    if (agent.userData.ring) agent.userData.ring.rotation.z = seconds * 1.85;
    if (agent.userData.wheels) {
      agent.userData.wheels.forEach((wheel) => {
        wheel.rotation.x = seconds * 5.2;
        wheel.rotation.z = Math.PI / 2;
      });
    }

    /* Gemi yelken/dalga hareketi + namlu flash */
    if (agent.userData.shipModel) {
      agent.userData.shipModel.rotation.z = Math.sin(seconds * 1.6) * 0.05;
      agent.userData.shipModel.rotation.x = Math.sin(seconds * 1.1) * 0.035;
    }
    if (agent.userData.muzzle) {
      const fired = agent.userData.firing;
      if (fired !== undefined && seconds - fired < 0.45) {
        agent.userData.muzzle.visible = true;
        agent.userData.muzzle.scale.setScalar(0.5 + Math.abs(Math.sin(seconds * 40)) * 0.4);
      } else {
        agent.userData.muzzle.visible = false;
      }
    }

    /* Route pulse */
    routeRoot.children.forEach((child) => {
      if (child.userData.routePulseOffset !== undefined) {
        const scale = 1 + Math.sin(seconds * 4 + child.userData.routePulseOffset) * 0.12;
        if (child.geometry === geometries.routeSegment) {
          child.material.opacity = 0.92;
        } else {
          child.scale.setScalar(scale);
        }
      }
    });

    /* Fire and ring animations */
    terrainRoot.traverse((child) => {
      if (child.userData.fire) {
        child.userData.fire.scale.y = 0.86 + Math.sin(seconds * 8.5) * 0.14;
      }
      if (child.userData.ring) {
        child.userData.ring.rotation.z = -seconds * 1.2;
      }
    });

    /* Hareketli deniz dalgalari */
    if (waterSurface && waterBase) {
      const pos = waterSurface.geometry.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < arr.length; i += 3) {
        const bx = waterBase[i];
        const bz = waterBase[i + 2];
        arr[i + 1] = Math.sin(bx * 1.6 + seconds * 1.7) * 0.06
                   + Math.sin(bz * 2.2 + seconds * 1.15) * 0.045;
      }
      pos.needsUpdate = true;
      waterSurface.geometry.computeVertexNormals();
    }

    /* Top gullesi ucusu -> inince hedef dusmani batir */
    if (cannonball.userData.active) {
      const u = cannonball.userData;
      const t = Math.min(1, (seconds - u.startTime) / u.duration);
      cannonball.position.lerpVectors(u.from, u.to, t);
      cannonball.position.y += Math.sin(t * Math.PI) * 0.45;
      if (t >= 1) {
        cannonball.visible = false;
        u.active = false;
        sinkEnemy(u.enemyCell, seconds);
      }
    }

    /* Dusman gemisi batma + alev animasyonu */
    enemyShips.forEach((enemy) => {
      if (enemy.userData.sunk) {
        const start = enemy.userData.sinkStart;
        const t = start !== undefined ? Math.min(1, (seconds - start) / 2.2) : 1;
        enemy.position.y = (enemy.userData.baseY || 0) - t * 0.34;
        enemy.rotation.z = t * 0.5;
        if (enemy.userData.flame) {
          enemy.userData.flame.scale.y = 0.86 + Math.sin(seconds * 8.5) * 0.18;
        }
        if (enemy.userData.fireLight) {
          enemy.userData.fireLight.intensity = 1.4 * (1 - t * 0.45);
        }
      } else {
        enemy.position.y = enemy.userData.baseY || 0;
        enemy.rotation.z = Math.sin(seconds * 1.4 + (enemy.userData.bob || 0)) * 0.04;
      }
    });

    updateCameraPosition();
    renderer.render(scene, camera);
  }

  window.addEventListener("rescue:render", (event) => {
    resizeRenderer();
    renderFromDetail(event.detail);
  });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("resize", resizeRenderer);

  setTimeout(() => {
    resizeRenderer();
    if (readStateNode()) {
      return;
    }
    if (window.AkilliKurtarmaApp) {
      renderFromDetail(window.AkilliKurtarmaApp.getState());
    } else if (window.AkilliKurtarma && window.AkilliKurtarma.MAP_PRESETS) {
      renderFromDetail({
        grid: window.AkilliKurtarma.MAP_PRESETS[0].rows,
        result: null,
        pathIndex: 0,
        presetId: window.AkilliKurtarma.MAP_PRESETS[0].id,
        presetTitle: window.AkilliKurtarma.MAP_PRESETS[0].title
      });
    }
  }, 0);

  setInterval(() => {
    readStateNode();
  }, 160);

  canvas.dataset.sceneBottom = "ready";
  requestAnimationFrame(animate);
}

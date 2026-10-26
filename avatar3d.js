(() => {
  const canvas = document.getElementById("avatarCanvas");
  const stage = document.querySelector(".avatar-stage");
  const status = document.getElementById("introStatus");
  const THREE = window.THREE;

  if (!canvas || !stage || !THREE) {
    if (status) status.textContent = "The 3D introduction is unavailable in this browser.";
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power"
    });
  } catch {
    if (status) status.textContent = "The 3D introduction is unavailable in this browser.";
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 60);
  camera.position.set(0, 2.15, 8.7);
  camera.lookAt(0, 1.92, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  scene.add(new THREE.HemisphereLight(0xfff8ed, 0x71847b, 2.2));

  const keyLight = new THREE.DirectionalLight(0xffead7, 2.8);
  keyLight.position.set(-3.5, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xb5d2c3, 1.5);
  rimLight.position.set(4, 3, -3);
  scene.add(rimLight);

  const reference = document.querySelector("#avatarReference");
  if (!reference?.complete || !reference.naturalWidth) {
    if (status) status.textContent = "The avatar image could not be loaded.";
    return;
  }

  const avatar = new THREE.Group();
  const sourceWidth = reference.naturalWidth;
  const sourceHeight = reference.naturalHeight;
  const planeHeight = 4.14;
  const hipLine = Math.round(sourceHeight * 0.47);
  const overlapHeight = 48;

  const createBodyLayer = (upper) => {
    const layer = document.createElement("canvas");
    layer.width = sourceWidth;
    layer.height = sourceHeight;
    const context = layer.getContext("2d");

    const sourceY = upper ? 0 : Math.max(0, hipLine - overlapHeight);
    const sourceEnd = upper ? Math.min(hipLine + overlapHeight, sourceHeight) : sourceHeight;
    context.drawImage(reference, 0, sourceY, sourceWidth, sourceEnd - sourceY, 0, sourceY, sourceWidth, sourceEnd - sourceY);
    return layer;
  };

  const createTexture = (layer) => {
    const texture = new THREE.CanvasTexture(layer);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  };

  const planeWidth = planeHeight * (sourceWidth / sourceHeight);
  const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const upperBody = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({ map: createTexture(createBodyLayer(true)), transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  upperBody.position.set(0, planeHeight / 2, 0.002);
  avatar.add(upperBody);

  const lowerBody = new THREE.Group();
  const hipOffset = (0.5 - hipLine / sourceHeight) * planeHeight;
  lowerBody.position.y = planeHeight / 2 + hipOffset;
  const legLayer = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({ map: createTexture(createBodyLayer(false)), transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  legLayer.position.set(0, -hipOffset, 0.004);
  lowerBody.add(legLayer);
  avatar.add(lowerBody);
  scene.add(avatar);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 40),
    new THREE.MeshBasicMaterial({ color: 0x40584c, transparent: true, opacity: 0.1, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.015;
  ground.scale.set(1.05, 0.3, 1);
  scene.add(ground);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let arrivalStart = performance.now();
  let speaking = false;
  let walking = true;

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 330 ? 10 : 8.7;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  const renderFrame = (now) => {
    const progress = reducedMotion || !walking ? 1 : Math.min((now - arrivalStart) / 1500, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    avatar.position.set(0.9 * (1 - eased), 0, -2.5 * (1 - eased));
    avatar.scale.setScalar(0.58 + 0.42 * eased);

    const walk = speaking
      ? Math.sin(now * 0.008)
      : walking && progress < 1
        ? Math.sin(now * 0.014) * (1 - progress)
        : 0;
    lowerBody.rotation.x = walk * 0.4;
    lowerBody.rotation.z = walk * 0.07;
    avatar.position.y = Math.abs(walk) * 0.055;
    avatar.rotation.y = (1 - eased) * 0.12 + (speaking ? Math.sin(now * 0.002) * 0.018 : 0);

    renderer.render(scene, camera);

    if (progress === 1) {
      walking = false;
    }

    if (progress === 1 && !speaking) {
      renderer.setAnimationLoop(null);
    }
  };

  renderer.setAnimationLoop(renderFrame);

  window.avatarScene = {
    setSpeaking(value) {
      speaking = value;
      if (speaking) {
        walking = !reducedMotion;
        arrivalStart = performance.now();
        renderer.setAnimationLoop(renderFrame);
      } else {
        walking = false;
        renderFrame(performance.now());
        renderer.setAnimationLoop(null);
      }
    }
  };

  window.addEventListener("beforeunload", () => {
    resizeObserver.disconnect();
    renderer.setAnimationLoop(null);
  }, { once: true });
})();
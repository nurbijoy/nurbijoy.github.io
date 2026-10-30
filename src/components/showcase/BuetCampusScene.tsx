import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { campusGeometry, campusPlaces, type CampusPlace } from '@/data/buetCampus'
import { campusArchitecture } from '@/data/buetCampusArchitecture'
import { campusRandom, campusRingBounds, campusSeed, campusWorldPoint, distanceToCampusSegment, pointInCampusBuilding, pointInCampusRing, type GroundPoint } from '@/lib/buetCampus3d'
import './BuetCampusScene.css'

export interface CampusCameraCommand {
  kind: 'reset' | 'zoom-in' | 'zoom-out' | 'focus' | 'rotate-left' | 'rotate-right'
  placeId?: string
  sequence: number
}

export interface CampusSceneProps {
  places: readonly CampusPlace[]
  selectedId: string | null
  hoveredId: string | null
  labels: boolean
  cameraCommand: CampusCameraCommand
  lighting: 'day' | 'evening'
  mode: 'orbit' | 'walk'
  onSelect: (place: CampusPlace) => void
  onViewChange?: (value: { zoom: number; heading: number }) => void
  onError: () => void
}

type Building = typeof campusGeometry.buildings[number]
type Facade = 'brick' | 'concrete' | 'glass' | 'ece' | 'eme' | 'civil' | 'architecture'
interface WorldBuilding {
  source: Building
  points: GroundPoint[]
  holes: GroundPoint[][]
  bounds: ReturnType<typeof campusRingBounds>
  height: number
  place?: CampusPlace
}
interface SceneController {
  update: () => void
  command: (command: CampusCameraCommand) => void
  setWalkInput: (key: string, down: boolean) => void
  dispose: () => void
}

const CATEGORY_COLORS = { academic: '#327765', residential: '#a86e42', facilities: '#397f9b', landmark: '#9c813d' }
const INITIAL_TARGET = new THREE.Vector3(35, 0, -10)
const INITIAL_POSITION = new THREE.Vector3(445, 620, 740)
const DEFAULT_DISTANCE = INITIAL_POSITION.distanceTo(INITIAL_TARGET)
const INITIAL_DIRECTION = INITIAL_POSITION.clone().sub(INITIAL_TARGET).normalize()
const INITIAL_FORWARD = INITIAL_TARGET.clone().sub(INITIAL_POSITION).normalize()
const INITIAL_RIGHT = INITIAL_FORWARD.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
const OVERVIEW_HALF_WIDTH = Math.max(...campusPlaces.map((place) => {
  const [x, z] = campusWorldPoint(place.coordinates)
  return Math.abs(new THREE.Vector3(x, 0, z).sub(INITIAL_TARGET).dot(INITIAL_RIGHT))
})) + 35
const clamp = THREE.MathUtils.clamp

function overviewPosition(aspect: number) {
  const horizontalFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(43) / 2) * Math.max(aspect, .1))
  const distance = Math.max(DEFAULT_DISTANCE, OVERVIEW_HALF_WIDTH * 1.12 / Math.tan(horizontalFov / 2))
  return INITIAL_TARGET.clone().addScaledVector(INITIAL_DIRECTION, distance)
}

function buildingHeight(building: Building) {
  const record = campusArchitecture[building.id]
  return clamp(record?.height ?? ((record?.levels ?? building.levels ?? 3) * 3.45), 3.5, 80)
}

function facadeStyle(building: Building, place?: CampusPlace): Facade {
  if (place?.id === 'ece') return 'ece'
  if (place?.id === 'mechanical') return 'eme'
  if (place?.id === 'civil') return 'civil'
  if (place?.id === 'architecture') return 'architecture'
  return campusArchitecture[building.id]?.material ?? (place?.category === 'residential' ? 'brick' : 'concrete')
}

function makeShape(points: readonly GroundPoint[], holes: readonly (readonly GroundPoint[])[] = []) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)))
  shape.holes = holes.map((ring) => new THREE.Path(ring.map(([x, z]) => new THREE.Vector2(x, -z))))
  return shape
}

function flatGeometry(points: readonly GroundPoint[], holes: readonly (readonly GroundPoint[])[] = [], y = .1) {
  const geometry = new THREE.ShapeGeometry(makeShape(points, holes))
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, y, 0)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) / 22, position.getZ(i) / 22)
  return geometry
}

function createTexture(kind: Facade | 'roof' | 'grass' | 'asphalt', emissive = false) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const random = campusRandom(campusSeed(kind))
  if (kind === 'grass' || kind === 'asphalt' || kind === 'roof') {
    const base = kind === 'grass' ? '#8a9a68' : kind === 'asphalt' ? '#717675' : '#c0bbad'
    ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = random() > .5 ? '#ffffff18' : '#25221c15'
      const size = kind === 'grass' ? 1 + random() * 3 : 1
      ctx.fillRect(random() * 128, random() * 128, size, size)
    }
    if (kind === 'roof') {
      ctx.strokeStyle = '#8d8b7b45'; ctx.lineWidth = 1
      ctx.strokeRect(0, 0, 128, 128); ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, 128); ctx.stroke()
    }
  } else {
    const backgrounds: Record<Facade, string> = { brick: '#af7157', concrete: '#d5ceba', glass: '#567b84', ece: '#ddd8bf', eme: '#a3634c', civil: '#c99a8c', architecture: '#747e79' }
    ctx.fillStyle = emissive ? '#000' : backgrounds[kind]
    ctx.fillRect(0, 0, 128, 128)
    if (!emissive && (kind === 'brick' || kind === 'eme')) {
      ctx.strokeStyle = '#dec2a358'; ctx.lineWidth = 1
      for (let y = 0; y < 128; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke(); for (let x = (y % 18 ? -12 : 0); x < 128; x += 25) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9); ctx.stroke() } }
    }
    const windowX = kind === 'ece' ? 4 : kind === 'glass' ? 2 : 20
    const windowY = kind === 'architecture' ? 23 : 25
    const windowW = kind === 'ece' ? 120 : kind === 'glass' ? 124 : 87
    const windowH = kind === 'glass' ? 120 : kind === 'architecture' ? 68 : 58
    ctx.fillStyle = emissive ? '#e4be77' : kind === 'architecture' ? '#233934' : '#294751'
    ctx.fillRect(windowX, windowY, windowW, windowH)
    if (!emissive) {
      const reflection = ctx.createLinearGradient(0, windowY, 0, windowY + windowH)
      reflection.addColorStop(0, '#b3d4d46b'); reflection.addColorStop(.5, '#77999b1f'); reflection.addColorStop(1, '#132c3b26')
      ctx.fillStyle = reflection; ctx.fillRect(windowX, windowY, windowW, windowH)
      ctx.strokeStyle = '#b3b9ad'; ctx.lineWidth = 3
      for (let x = windowX + windowW / 3; x < windowX + windowW; x += windowW / 3) { ctx.beginPath(); ctx.moveTo(x, windowY); ctx.lineTo(x, windowY + windowH); ctx.stroke() }
      ctx.fillStyle = kind === 'eme' || kind === 'architecture' ? '#e4dfce' : '#c5c1ae'
      ctx.fillRect(0, 113, 128, 11)
      if (kind === 'eme') { ctx.fillRect(0, 0, 9, 128); ctx.fillRect(119, 0, 9, 128); ctx.fillRect(0, 0, 128, 12) }
      if (kind === 'architecture') {
        ctx.strokeStyle = '#e7e6d7'; ctx.lineWidth = 8; ctx.strokeRect(14, 17, 99, 80)
        ctx.lineWidth = 2
        for (let x = 23; x < 107; x += 9) { ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, 94); ctx.stroke() }
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function extrudedGeometry(building: WorldBuilding) {
  const geometry = new THREE.ExtrudeGeometry(makeShape(building.points, building.holes), { depth: building.height, steps: 1, bevelEnabled: false, curveSegments: 1 })
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (const group of geometry.groups) {
    for (let i = group.start; i < group.start + group.count; i += 3) {
      const isSide = group.materialIndex === 1
      const xSpan = Math.max(position.getX(i), position.getX(i + 1), position.getX(i + 2)) - Math.min(position.getX(i), position.getX(i + 1), position.getX(i + 2))
      const ySpan = Math.max(position.getY(i), position.getY(i + 1), position.getY(i + 2)) - Math.min(position.getY(i), position.getY(i + 1), position.getY(i + 2))
      for (let j = i; j < i + 3; j++) uv.setXY(j, (isSide ? xSpan > ySpan ? position.getX(j) : position.getY(j) : position.getX(j)) / (isSide ? 3.6 : 8), (isSide ? position.getZ(j) : position.getY(j)) / (isSide ? 3.45 : 8))
    }
  }
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

/** Extract non-indexed cap/wall batches so the surrounding city needs only a few draw calls. */
function geometryPart(geometry: THREE.BufferGeometry, materialIndex: number) {
  const part = new THREE.BufferGeometry()
  for (const name of ['position', 'normal', 'uv']) {
    const source = geometry.getAttribute(name)
    const values: number[] = []
    for (const group of geometry.groups.filter((entry) => entry.materialIndex === materialIndex)) {
      for (let i = group.start * source.itemSize; i < (group.start + group.count) * source.itemSize; i++) values.push(source.array[i])
    }
    part.setAttribute(name, new THREE.Float32BufferAttribute(values, source.itemSize))
  }
  return part
}

function roadRibbon(points: readonly GroundPoint[], width: number, y: number) {
  const vertices: number[] = []
  const uvs: number[] = []
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (length < .01) continue
    const nx = -(b[1] - a[1]) / length * width / 2, nz = (b[0] - a[0]) / length * width / 2
    const corners = [[a[0] + nx, y, a[1] + nz], [b[0] + nx, y, b[1] + nz], [b[0] - nx, y, b[1] - nz], [a[0] - nx, y, a[1] - nz]]
    for (const index of [0, 1, 2, 0, 2, 3]) { vertices.push(...corners[index]); uvs.push(corners[index][0] / 10, corners[index][2] / 10) }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  return geometry
}

function initializeScene(host: HTMLDivElement, labelLayer: HTMLDivElement, latest: { current: CampusSceneProps }): SceneController {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = host.clientWidth < 650
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.domElement.className = 'buet-scene-canvas'
  renderer.domElement.tabIndex = 0
  renderer.domElement.setAttribute('aria-label', '3D campus. Drag to orbit, scroll to zoom; use arrow keys to pan. In walking mode use W A S D and drag to look.')
  host.prepend(renderer.domElement)

  const scene = new THREE.Scene()
  const initialAspect = Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1)
  const camera = new THREE.PerspectiveCamera(43, initialAspect, .3, 6000)
  camera.position.copy(overviewPosition(initialAspect))
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(INITIAL_TARGET)
  controls.enableDamping = !reducedMotion
  controls.dampingFactor = .12
  controls.minDistance = 28
  controls.maxDistance = 5500
  controls.maxTargetRadius = 720
  controls.maxPolarAngle = Math.PI / 2 - .035
  controls.minPolarAngle = .08
  controls.screenSpacePanning = false
  controls.zoomSpeed = .8
  controls.rotateSpeed = .65
  controls.panSpeed = .85
  controls.listenToKeyEvents(renderer.domElement)
  controls.update()

  const hemisphere = new THREE.HemisphereLight(0xd9e9f4, 0x8a805e, 2.1)
  scene.add(hemisphere)
  const sun = new THREE.DirectionalLight(0xfff2d5, 3.0)
  sun.position.set(-300, 500, 250)
  sun.castShadow = true
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -580, right: 580, top: 480, bottom: -480, near: 5, far: 1500 })
  sun.shadow.normalBias = .35
  sun.shadow.bias = -.00015
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xc2d8e0, .35)
  fill.position.set(300, 150, -400); scene.add(fill)

  const resources: { geometries: Set<THREE.BufferGeometry>; materials: Set<THREE.Material>; textures: Set<THREE.Texture> } = { geometries: new Set(), materials: new Set(), textures: new Set() }
  const keepGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => { resources.geometries.add(geometry); return geometry }
  const keepMaterial = <T extends THREE.Material>(material: T): T => { resources.materials.add(material); return material }
  const keepTexture = (texture: THREE.Texture) => { resources.textures.add(texture); return texture }
  const roofTexture = keepTexture(createTexture('roof'))
  const grassTexture = keepTexture(createTexture('grass'))
  const roadTexture = keepTexture(createTexture('asphalt'))
  const roofMaterial = keepMaterial(new THREE.MeshStandardMaterial({ map: roofTexture, color: '#e0dac9', roughness: .96 }))
  const facadeMaterials = new Map<Facade, THREE.MeshStandardMaterial>()
  for (const kind of ['brick', 'concrete', 'glass', 'ece', 'eme', 'civil', 'architecture'] as const) {
    facadeMaterials.set(kind, keepMaterial(new THREE.MeshStandardMaterial({ map: keepTexture(createTexture(kind)), emissiveMap: keepTexture(createTexture(kind, true)), emissive: '#ffc67b', emissiveIntensity: 0, color: '#ffffff', roughness: kind === 'glass' ? .4 : .82, metalness: kind === 'glass' ? .2 : .03 })))
  }
  const grassMaterial = keepMaterial(new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 1, color: '#bdc99a', side: THREE.DoubleSide }))
  const roadMaterial = keepMaterial(new THREE.MeshStandardMaterial({ map: roadTexture, roughness: .95, side: THREE.DoubleSide }))
  const pavementMaterial = keepMaterial(new THREE.MeshStandardMaterial({ color: '#c4bfb0', roughness: .95, side: THREE.DoubleSide }))
  const markingMaterial = keepMaterial(new THREE.MeshStandardMaterial({ color: '#e4e4cf', roughness: .85, side: THREE.DoubleSide }))
  const waterMaterial = keepMaterial(new THREE.MeshStandardMaterial({ color: '#5f8b87', roughness: .24, metalness: .2, side: THREE.DoubleSide }))
  const groundMaterial = keepMaterial(new THREE.MeshStandardMaterial({ color: '#b4b6a2', roughness: 1 }))
  const ground = new THREE.Mesh(keepGeometry(new THREE.PlaneGeometry(2500, 2300)), groundMaterial)
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.04; ground.receiveShadow = true; scene.add(ground)

  const placeByBuilding = new Map(campusPlaces.flatMap((place) => place.buildingIds.map((id) => [id, place] as const)))
  const placeByGreen = new Map(campusPlaces.flatMap((place) => (place.greenIds ?? []).map((id) => [id, place] as const)))
  const worldBuildings: WorldBuilding[] = campusGeometry.buildings.map((source) => {
    const points = source.points.map(campusWorldPoint)
    return { source, points, holes: (source.holes ?? []).map((ring) => ring.map(campusWorldPoint)), bounds: campusRingBounds(points), height: buildingHeight(source), place: placeByBuilding.get(source.id) }
  })
  const isBlocked = (x: number, z: number) => worldBuildings.some((building) => x >= building.bounds.minX - .65 && x <= building.bounds.maxX + .65 && z >= building.bounds.minZ - .65 && z <= building.bounds.maxZ + .65 && (
    pointInCampusBuilding([x, z], building.points, building.holes)
    || building.points.some((point, i) => i > 0 && distanceToCampusSegment([x, z], building.points[i - 1], point) < .65)))

  const pickables: THREE.Object3D[] = []
  const occluders: THREE.Object3D[] = []
  const namedMeshes = new Map<string, THREE.Mesh[]>()
  const cityBatches = new Map<string, THREE.BufferGeometry[]>()
  const decorationMatrices: THREE.Matrix4[] = []
  const tankMatrices: THREE.Matrix4[] = []
  const parapetMatrices: THREE.Matrix4[] = []
  const matrixObject = new THREE.Object3D()
  for (const building of worldBuildings) {
    const style = facadeStyle(building.source, building.place)
    const geometry = extrudedGeometry(building)
    if (building.place) {
      keepGeometry(geometry)
      const roof = keepMaterial(roofMaterial.clone())
      const facade = keepMaterial(facadeMaterials.get(style)!.clone())
      const mesh = new THREE.Mesh(geometry, [roof, facade])
      mesh.castShadow = mesh.receiveShadow = true; mesh.userData.placeId = building.place.id
      scene.add(mesh); pickables.push(mesh); occluders.push(mesh)
      const meshes = namedMeshes.get(building.place.id) ?? []; meshes.push(mesh); namedMeshes.set(building.place.id, meshes)
      const edges = new THREE.LineSegments(keepGeometry(new THREE.EdgesGeometry(geometry, 25)), keepMaterial(new THREE.LineBasicMaterial({ color: '#514d3b', transparent: true, opacity: .18 })))
      scene.add(edges)
      for (const ring of [building.points, ...building.holes]) {
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1], b = ring[i]
          const length = Math.hypot(b[0] - a[0], b[1] - a[1])
          if (length < 1) continue
          matrixObject.position.set((a[0] + b[0]) / 2, building.height + .28, (a[1] + b[1]) / 2)
          matrixObject.rotation.set(0, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0)
          matrixObject.scale.set(length, .56, .3); matrixObject.updateMatrix(); parapetMatrices.push(matrixObject.matrix.clone())
        }
      }
      // Photo-informed facade cues. These modules are representative, rather than a measured elevation.
      const longestEdge = building.points.slice(1).map((point, i) => ({ a: building.points[i], b: point, length: Math.hypot(point[0] - building.points[i][0], point[1] - building.points[i][1]) })).sort((a, b) => b.length - a.length)[0]
      if (longestEdge && longestEdge.length > 15) {
        const { a, b, length } = longestEdge
        const dx = (b[0] - a[0]) / length, dz = (b[1] - a[1]) / length
        let nx = -dz, nz = dx
        const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2
        if (pointInCampusRing([mx + nx * .3, mz + nz * .3], building.points)) { nx = -nx; nz = -nz }
        const angle = Math.atan2(dz, dx)
        if (style === 'ece') {
          const width = Math.min(length * .28, 24), height = building.height - .8
          const glassGeometry = keepGeometry(new THREE.PlaneGeometry(width, height))
          const uv = glassGeometry.getAttribute('uv')
          for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * width / 3.6, uv.getY(i) * height / 3.45)
          const glassMaterial = keepMaterial(facadeMaterials.get('glass')!.clone()); glassMaterial.side = THREE.DoubleSide
          const glass = new THREE.Mesh(glassGeometry, glassMaterial)
          glass.rotation.y = -angle; glass.position.set(mx + nx * .18, height / 2 + .25, mz + nz * .18)
          glass.userData.placeId = building.place.id; scene.add(glass); pickables.push(glass)
          for (const sign of [-1, 1]) {
            matrixObject.position.set(mx + dx * width / 2 * sign + nx * .25, height / 2, mz + dz * width / 2 * sign + nz * .25)
            matrixObject.rotation.set(0, -angle, 0); matrixObject.scale.set(.5, height, .65); matrixObject.updateMatrix(); parapetMatrices.push(matrixObject.matrix.clone())
          }
        } else if (style === 'civil') {
          for (let distance = 3; distance < length - 2; distance += 3.6) {
            matrixObject.position.set(a[0] + dx * distance + nx * .6, building.height - 3.2, a[1] + dz * distance + nz * .6)
            matrixObject.rotation.set(0, -angle, .36); matrixObject.scale.set(.24, 4.8, 1.05); matrixObject.updateMatrix(); parapetMatrices.push(matrixObject.matrix.clone())
          }
        } else if (style === 'architecture') {
          for (let floor = 1; floor < building.height / 3.45; floor++) {
            matrixObject.position.set(mx + nx * .55, floor * 3.45 + 2.45, mz + nz * .55)
            matrixObject.rotation.set(0, -angle, 0); matrixObject.scale.set(length, .15, 1.3); matrixObject.updateMatrix(); parapetMatrices.push(matrixObject.matrix.clone())
          }
        }
      }
    } else {
      for (const index of [0, 1]) {
        const key = `${style}:${index}`
        const batch = cityBatches.get(key) ?? []
        batch.push(geometryPart(geometry, index)); cityBatches.set(key, batch)
      }
      geometry.dispose()
    }
    // Small service blocks and water tanks make roof scale legible; placements are illustrative.
    const random = campusRandom(campusSeed(building.source.id))
    const count = building.place ? 3 : random() > .65 ? 1 : 0
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.lerp(building.bounds.minX + 2, building.bounds.maxX - 2, random())
      const z = THREE.MathUtils.lerp(building.bounds.minZ + 2, building.bounds.maxZ - 2, random())
      if (!pointInCampusBuilding([x, z], building.points, building.holes)) continue
      matrixObject.position.set(x, building.height + .9, z); matrixObject.rotation.set(0, random() * Math.PI, 0)
      matrixObject.scale.set(2 + random() * 2, 1.8, 2 + random() * 2); matrixObject.updateMatrix()
      decorationMatrices.push(matrixObject.matrix.clone())
      if (i === 0 && building.height > 8) { matrixObject.position.set(x + 1, building.height + 2.7, z); matrixObject.scale.set(1.1, 1.8, 1.1); matrixObject.updateMatrix(); tankMatrices.push(matrixObject.matrix.clone()) }
    }
  }
  for (const [key, parts] of cityBatches) {
    const [style, index] = key.split(':') as [Facade, string]
    const geometry = mergeGeometries(parts, false)
    parts.forEach((part) => part.dispose())
    if (!geometry) continue
    const material = keepMaterial((index === '0' ? roofMaterial : facadeMaterials.get(style)!).clone())
    material.color.multiplyScalar(.88)
    const mesh = new THREE.Mesh(keepGeometry(geometry), material)
    mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); occluders.push(mesh)
  }
  const addInstances = (geometry: THREE.BufferGeometry, material: THREE.Material, matrices: THREE.Matrix4[], shadows = true) => {
    const mesh = new THREE.InstancedMesh(keepGeometry(geometry), material, matrices.length)
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix))
    mesh.castShadow = shadows; mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh)
    return mesh
  }
  addInstances(new THREE.BoxGeometry(1, 1, 1), keepMaterial(new THREE.MeshStandardMaterial({ color: '#a9aaa1', roughness: .85 })), decorationMatrices)
  addInstances(new THREE.CylinderGeometry(1, 1, 1, 10), keepMaterial(new THREE.MeshStandardMaterial({ color: '#434a46', roughness: .8 })), tankMatrices)
  addInstances(new THREE.BoxGeometry(1, 1, 1), keepMaterial(new THREE.MeshStandardMaterial({ color: '#d8d4c5', roughness: .92 })), parapetMatrices)

  const roadBatches: THREE.BufferGeometry[] = [], pavementBatches: THREE.BufferGeometry[] = [], markingBatches: THREE.BufferGeometry[] = []
  const namedGreens = new Map<string, THREE.Mesh>()
  const worldRoads = campusGeometry.roads.map((road) => ({ ...road, world: road.points.map(campusWorldPoint) }))
  for (const road of worldRoads) {
    const footpath = ['footway', 'path', 'steps'].includes(road.kind)
    const width = footpath ? 2 : road.kind === 'secondary' ? 11 : road.kind === 'tertiary' ? 9 : road.kind === 'service' ? 4 : 6
    pavementBatches.push(roadRibbon(road.world, width + (footpath ? .3 : 1.1), .04))
    if (!footpath) roadBatches.push(roadRibbon(road.world, width, .065))
    if (width >= 9) {
      for (let i = 1; i < road.world.length; i++) {
        const a = road.world[i - 1], b = road.world[i], length = Math.hypot(b[0] - a[0], b[1] - a[1])
        for (let distance = 3; distance < length - 3; distance += 9) {
          const t1 = distance / length, t2 = Math.min(distance + 3.5, length) / length
          markingBatches.push(roadRibbon([[THREE.MathUtils.lerp(a[0], b[0], t1), THREE.MathUtils.lerp(a[1], b[1], t1)], [THREE.MathUtils.lerp(a[0], b[0], t2), THREE.MathUtils.lerp(a[1], b[1], t2)]], .16, .09))
        }
      }
    }
  }
  for (const [parts, material] of [[pavementBatches, pavementMaterial], [roadBatches, roadMaterial], [markingBatches, markingMaterial]] as const) {
    const geometry = mergeGeometries(parts, false); parts.forEach((part) => part.dispose())
    if (geometry) { const mesh = new THREE.Mesh(keepGeometry(geometry), material); mesh.receiveShadow = true; scene.add(mesh) }
  }
  const treePositions: { x: number; z: number; size: number }[] = []
  for (const green of campusGeometry.greens) {
    const points = green.points.map(campusWorldPoint)
    const water = green.kind === 'water'
    const place = placeByGreen.get(green.id)
    const material = water ? waterMaterial : place ? keepMaterial(grassMaterial.clone()) : grassMaterial
    const mesh = new THREE.Mesh(keepGeometry(flatGeometry(points, [], water ? -.02 : .1)), material)
    mesh.receiveShadow = true; scene.add(mesh)
    if (place) namedGreens.set(place.id, mesh)
    if (water) continue
    const bounds = campusRingBounds(points)
    const random = campusRandom(campusSeed(green.id))
    const area = (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ)
    const woodland = ['forest', 'wood', 'garden'].includes(green.kind)
    const targetCount = Math.min(woodland ? 65 : 20, Math.floor(area / (woodland ? 130 : 380)))
    for (let attempt = 0, accepted = 0; attempt < targetCount * 15 && accepted < targetCount && treePositions.length < 420; attempt++) {
      const x = THREE.MathUtils.lerp(bounds.minX, bounds.maxX, random()), z = THREE.MathUtils.lerp(bounds.minZ, bounds.maxZ, random())
      if (!pointInCampusRing([x, z], points) || isBlocked(x, z)) continue
      if (!woodland && points.every((point, i) => i === 0 || distanceToCampusSegment([x, z], points[i - 1], point) > 7)) continue
      if (worldRoads.some((road) => road.world.some((point, i) => i > 0 && distanceToCampusSegment([x, z], road.world[i - 1], point) < 3))) continue
      if (treePositions.some((point) => Math.hypot(x - point.x, z - point.z) < 5)) continue
      treePositions.push({ x, z, size: .75 + random() * .65 }); accepted++
    }
    if (green.id === 'way/97207659') {
      const cx = (bounds.minX + bounds.maxX) / 2, cz = (bounds.minZ + bounds.maxZ) / 2
      const width = Math.min(64, (bounds.maxX - bounds.minX) * .7), length = Math.min(100, (bounds.maxZ - bounds.minZ) * .75)
      const ring: GroundPoint[] = [[cx - width / 2, cz - length / 2], [cx + width / 2, cz - length / 2], [cx + width / 2, cz + length / 2], [cx - width / 2, cz + length / 2], [cx - width / 2, cz - length / 2]]
      scene.add(new THREE.Mesh(keepGeometry(roadRibbon(ring, .18, .14)), markingMaterial))
      scene.add(new THREE.Mesh(keepGeometry(roadRibbon([[cx - width / 2, cz], [cx + width / 2, cz]], .18, .14)), markingMaterial))
      const circle = new THREE.Mesh(keepGeometry(new THREE.RingGeometry(9.05, 9.23, 48)), markingMaterial)
      circle.rotation.x = -Math.PI / 2; circle.position.set(cx, .14, cz); scene.add(circle)
      for (const end of [-1, 1]) {
        const z = cz + end * length / 2
        const goalBox: GroundPoint[] = [[cx - 16.5, z], [cx - 16.5, z - end * 16.5], [cx + 16.5, z - end * 16.5], [cx + 16.5, z]]
        scene.add(new THREE.Mesh(keepGeometry(roadRibbon(goalBox, .18, .14)), markingMaterial))
      }
    }
  }
  const trunkMatrices: THREE.Matrix4[] = [], crownMatrices: THREE.Matrix4[] = []
  for (const tree of treePositions) {
    matrixObject.rotation.set(0, 0, 0)
    matrixObject.position.set(tree.x, tree.size * 2.2, tree.z); matrixObject.scale.set(.43 * tree.size, 4.4 * tree.size, .43 * tree.size); matrixObject.updateMatrix(); trunkMatrices.push(matrixObject.matrix.clone())
    matrixObject.position.set(tree.x, tree.size * 6.2, tree.z); matrixObject.scale.set(3.3 * tree.size, 4.1 * tree.size, 3.1 * tree.size); matrixObject.updateMatrix(); crownMatrices.push(matrixObject.matrix.clone())
  }
  addInstances(new THREE.CylinderGeometry(1, 1.2, 1, 6), keepMaterial(new THREE.MeshStandardMaterial({ color: '#75674b', roughness: 1 })), trunkMatrices)
  const crowns = addInstances(new THREE.IcosahedronGeometry(1, 2), keepMaterial(new THREE.MeshStandardMaterial({ color: '#607b42', roughness: .96 })), crownMatrices)
  const treeRandom = campusRandom(1971)
  treePositions.forEach((_, i) => crowns.setColorAt(i, new THREE.Color().setHSL(.22 + treeRandom() * .08, .24 + treeRandom() * .12, .28 + treeRandom() * .13)))

  // Landmark markers remain real 3D objects, so they also respect perspective and depth.
  const markerGeometry = keepGeometry(new THREE.SphereGeometry(1.8, 10, 8))
  const markerObjects = new Map<string, THREE.Mesh>()
  const labelEntries = campusPlaces.map((place, index) => {
    const [x, z] = campusWorldPoint(place.coordinates)
    const height = Math.max(0, ...worldBuildings.filter((building) => building.place?.id === place.id).map((building) => building.height))
    const position = new THREE.Vector3(x, height + 3.8, z)
    const marker = new THREE.Mesh(markerGeometry, keepMaterial(new THREE.MeshStandardMaterial({ color: CATEGORY_COLORS[place.category], emissive: CATEGORY_COLORS[place.category], emissiveIntensity: .12, roughness: .5 })))
    marker.position.copy(position); marker.userData.placeId = place.id; scene.add(marker); pickables.push(marker); markerObjects.set(place.id, marker)
    const button = document.createElement('button')
    button.className = `buet-scene-label buet-scene-label-${place.category}`
    button.type = 'button'; button.setAttribute('aria-label', `Explore ${place.name}`)
    button.style.setProperty('--scene-place-color', CATEGORY_COLORS[place.category])
    const number = document.createElement('span'); number.className = 'buet-scene-label-number'; number.textContent = String(index + 1).padStart(2, '0')
    const title = document.createElement('span'); title.className = 'buet-scene-label-name'; title.textContent = place.shortName
    button.append(number, title); button.addEventListener('click', () => latest.current.onSelect(place)); labelLayer.append(button)
    return { place, button, position, width: Math.min(220, 35 + place.shortName.length * 6.2) }
  })

  let disposed = false, frame = 0, visible = true, dirty = true, settleFrames = 0
  let currentMode: CampusSceneProps['mode'] = 'orbit'
  let lastLighting = ''
  let lastTime = 0, lastLabelTime = 0, lastViewTime = 0, lastRenderTime = 0, renderedFrames = 0
  let renderFailed = false
  let yaw = 0, pitch = 0
  let drag: { x: number; y: number; moved: number; id: number } | null = null
  let transition: { start: number; from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; target: THREE.Vector3 } | null = null
  let orbitSnapshot = { position: INITIAL_POSITION.clone(), target: INITIAL_TARGET.clone() }
  const keys = new Set<string>()
  const raycaster = new THREE.Raycaster()
  const vector = new THREE.Vector3()
  const pickVector = new THREE.Vector2()
  const worldForward = new THREE.Vector3()

  const invalidate = () => { dirty = true; settleFrames = reducedMotion ? 1 : 35 }
  const flushOrbitInertia = () => {
    const position = camera.position.clone(), target = controls.target.clone()
    const damping = controls.enableDamping
    // OrbitControls has no public clear-delta method. A non-damped update consumes its deltas;
    // restore the requested position afterwards so an old drag cannot distort a new focus.
    controls.enableDamping = false; controls.update(); controls.enableDamping = damping
    camera.position.copy(position); controls.target.copy(target); controls.update()
  }
  let overviewInteracted = false
  const onControls = () => { overviewInteracted = true; transition = null; invalidate() }
  controls.addEventListener('start', onControls)
  controls.addEventListener('change', invalidate)
  const safeGroundPosition = (place?: CampusPlace) => {
    const origin = place ? campusWorldPoint(place.coordinates) : campusWorldPoint([90.39185, 23.72615])
    for (let radius = 10; radius < 90; radius += 6) {
      for (let step = 0; step < 16; step++) {
        const angle = step / 16 * Math.PI * 2
        const x = origin[0] + Math.sin(angle) * radius, z = origin[1] + Math.cos(angle) * radius
        // Start outside an exterior ring, so a courtyard without mapped doors cannot trap the visitor.
        if (!isBlocked(x, z) && !worldBuildings.some((building) => x >= building.bounds.minX && x <= building.bounds.maxX && z >= building.bounds.minZ && z <= building.bounds.maxZ && pointInCampusRing([x, z], building.points))) return new THREE.Vector3(x, 2, z)
      }
    }
    return new THREE.Vector3(55, 2, 20)
  }
  const aimWalk = () => { camera.rotation.set(pitch, yaw, 0, 'YXZ'); camera.updateMatrixWorld() }
  const update = () => {
    const props = latest.current
    if (props.mode !== currentMode) {
      transition = null; keys.clear()
      if (props.mode === 'walk') {
        flushOrbitInertia()
        orbitSnapshot = { position: camera.position.clone(), target: controls.target.clone() }
        const place = campusPlaces.find((entry) => entry.id === props.selectedId)
        camera.position.copy(safeGroundPosition(place)); yaw = 0; pitch = .02; aimWalk()
      } else { camera.position.copy(orbitSnapshot.position); controls.target.copy(orbitSnapshot.target); flushOrbitInertia(); controls.update() }
      currentMode = props.mode; controls.enabled = props.mode === 'orbit'
      renderer.domElement.classList.toggle('is-walking', props.mode === 'walk')
    }
    if (props.lighting !== lastLighting) {
      lastLighting = props.lighting
      const evening = props.lighting === 'evening'
      scene.background = new THREE.Color(evening ? '#354852' : '#dce6e3')
      scene.fog = new THREE.Fog(evening ? '#566268' : '#dce6d9', 950, 2300)
      hemisphere.color.set(evening ? '#7d9daf' : '#d9e9f4'); hemisphere.intensity = evening ? .95 : 2.1
      sun.color.set(evening ? '#ffc18b' : '#fff2d5'); sun.intensity = evening ? 1.5 : 3
      sun.position.set(evening ? -450 : -300, evening ? 170 : 500, evening ? 160 : 250)
      fill.intensity = evening ? .15 : .35
      renderer.toneMappingExposure = evening ? 1.12 : 1.12
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of materials) if (material instanceof THREE.MeshStandardMaterial && material.emissiveMap) material.emissiveIntensity = evening ? .64 : 0
      })
      renderer.shadowMap.needsUpdate = true
    }
    const visibleIds = new Set(props.places.map((place) => place.id))
    for (const [id, meshes] of namedMeshes) {
      const active = id === props.selectedId || id === props.hoveredId
      for (const mesh of meshes) for (const material of mesh.material as THREE.MeshStandardMaterial[]) {
        material.color.set(active ? '#e5f6e4' : visibleIds.has(id) ? '#ffffff' : '#a5ada1')
        if (material === (mesh.material as THREE.MeshStandardMaterial[])[0]) { material.emissive.set(active ? '#3e765b' : '#000000'); material.emissiveIntensity = active ? .26 : 0 }
      }
    }
    for (const [id, mesh] of namedGreens) {
      const material = mesh.material as THREE.MeshStandardMaterial
      material.color.set(id === props.selectedId || id === props.hoveredId ? '#dedb98' : '#bdc99a')
    }
    for (const entry of labelEntries) {
      entry.button.classList.toggle('is-selected', entry.place.id === props.selectedId)
      entry.button.setAttribute('aria-pressed', String(entry.place.id === props.selectedId))
      entry.button.hidden = !props.labels || !visibleIds.has(entry.place.id)
      const marker = markerObjects.get(entry.place.id)!
      marker.visible = visibleIds.has(entry.place.id)
      marker.scale.setScalar(entry.place.id === props.selectedId ? 1.5 : 1)
    }
    invalidate()
  }
  const animateCamera = (position: THREE.Vector3, target: THREE.Vector3) => {
    flushOrbitInertia()
    if (reducedMotion) { camera.position.copy(position); controls.target.copy(target); controls.update() }
    else transition = { start: performance.now(), from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), target }
    invalidate()
  }
  const command = (request: CampusCameraCommand) => {
    if (request.kind === 'reset') overviewInteracted = false
    else overviewInteracted = true
    if (currentMode === 'walk') {
      if (request.kind === 'reset' || request.kind === 'focus') {
        const place = campusPlaces.find((item) => item.id === request.placeId)
        camera.position.copy(safeGroundPosition(place))
        if (place) { const [x, z] = campusWorldPoint(place.coordinates); yaw = Math.atan2(camera.position.x - x, camera.position.z - z) } else yaw = 0
        pitch = .02; aimWalk()
      } else if (request.kind.startsWith('rotate')) { yaw += request.kind === 'rotate-left' ? .32 : -.32; aimWalk() }
      else {
        const direction = request.kind === 'zoom-in' ? 6 : -6
        const x = camera.position.x - Math.sin(yaw) * direction, z = camera.position.z - Math.cos(yaw) * direction
        if (!isBlocked(x, z)) camera.position.set(x, 2, z)
      }
      invalidate(); return
    }
    if (request.kind === 'reset') animateCamera(overviewPosition(camera.aspect), INITIAL_TARGET.clone())
    else if (request.kind === 'focus' && request.placeId) {
      const place = campusPlaces.find((item) => item.id === request.placeId)
      if (!place) return
      const [x, z] = campusWorldPoint(place.coordinates)
      const models = worldBuildings.filter((building) => building.place?.id === place.id)
      const height = Math.max(8, ...models.map((building) => building.height))
      const span = Math.max(45, ...models.map((building) => Math.max(building.bounds.maxX - building.bounds.minX, building.bounds.maxZ - building.bounds.minZ)))
      const target = new THREE.Vector3(x, height * .3, z)
      const direction = camera.position.clone().sub(controls.target)
      if (Math.hypot(direction.x, direction.z) < .01) direction.set(.6, 0, 1)
      direction.y = Math.hypot(direction.x, direction.z) * 1.05; direction.normalize()
      const horizontalFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect)
      const distance = Math.max(span * 2.65 + height, span / (2 * Math.tan(horizontalFov / 2)) * 1.5 + height)
      animateCamera(target.clone().addScaledVector(direction, clamp(distance, 135, 420)), target)
    } else {
      const offset = camera.position.clone().sub(controls.target)
      if (request.kind === 'rotate-left' || request.kind === 'rotate-right') offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, request.kind === 'rotate-left' ? .35 : -.35)
      else offset.multiplyScalar(request.kind === 'zoom-in' ? .77 : 1.3)
      offset.clampLength(controls.minDistance, controls.maxDistance)
      animateCamera(controls.target.clone().add(offset), controls.target.clone())
    }
  }
  const zoomWithWheel = (deltaY: number) => {
    overviewInteracted = true
    transition = null
    flushOrbitInertia()
    const offset = camera.position.clone().sub(controls.target)
      .multiplyScalar(Math.exp(deltaY * .0007))
      .clampLength(controls.minDistance, controls.maxDistance)
    camera.position.copy(controls.target).add(offset)
    controls.update(); invalidate()
  }
  const handleWheel = (event: WheelEvent) => {
    // OrbitControls handles wheel input over the canvas itself. This catches labels
    // and any wheel event it declines while an orbit gesture is active.
    if (event.defaultPrevented) return
    event.preventDefault()
    const deltaY = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? host.clientHeight : 1)
    if (currentMode === 'walk') command({ kind: deltaY < 0 ? 'zoom-in' : 'zoom-out', sequence: 0 })
    else zoomWithWheel(deltaY)
  }

  const updateLabels = () => {
    const props = latest.current
    const width = host.clientWidth, height = host.clientHeight
    const occupied: { x: number; y: number; w: number; h: number }[] = []
    const visibleIds = new Set(props.places.map((place) => place.id))
    const candidates = [...labelEntries].sort((a, b) => Number(b.place.id === props.selectedId || b.place.id === props.hoveredId) - Number(a.place.id === props.selectedId || a.place.id === props.hoveredId) || a.position.distanceToSquared(camera.position) - b.position.distanceToSquared(camera.position))
    for (const entry of candidates) {
      const active = entry.place.id === props.selectedId || entry.place.id === props.hoveredId
      if (!props.labels || !visibleIds.has(entry.place.id)) { entry.button.style.display = 'none'; continue }
      vector.copy(entry.position).project(camera)
      const x = (vector.x * .5 + .5) * width, y = (-vector.y * .5 + .5) * height
      if (vector.z < -1 || vector.z > 1 || x < 4 || x > width - 4 || y < 4 || y > height - 4) { entry.button.style.display = 'none'; continue }
      const labelWidth = entry.width, labelHeight = 29
      const options = [
        { box: { x: x + 14, y: y - labelHeight / 2, w: labelWidth, h: labelHeight }, transform: 'translate(14px,-50%)' },
        { box: { x: x - labelWidth - 14, y: y - labelHeight / 2, w: labelWidth, h: labelHeight }, transform: 'translate(calc(-100% - 14px),-50%)' },
        { box: { x: x + 14, y: y - labelHeight - 12, w: labelWidth, h: labelHeight }, transform: 'translate(14px,calc(-100% - 12px))' },
        { box: { x: x - labelWidth - 14, y: y - labelHeight - 12, w: labelWidth, h: labelHeight }, transform: 'translate(calc(-100% - 14px),calc(-100% - 12px))' },
        { box: { x: x + 14, y: y + 12, w: labelWidth, h: labelHeight }, transform: 'translate(14px,12px)' },
        { box: { x: x - labelWidth - 14, y: y + 12, w: labelWidth, h: labelHeight }, transform: 'translate(calc(-100% - 14px),12px)' },
        { box: { x: x - labelWidth / 2, y: y - labelHeight - 14, w: labelWidth, h: labelHeight }, transform: 'translate(-50%,calc(-100% - 14px))' },
        { box: { x: x - labelWidth / 2, y: y + 14, w: labelWidth, h: labelHeight }, transform: 'translate(-50%,14px)' },
      ]
      const score = (box: typeof options[number]['box']) => {
        const outside = Math.max(0, 8 - box.x) + Math.max(0, box.x + box.w - (width - 8))
          + Math.max(0, 8 - box.y) + Math.max(0, box.y + box.h - (height - 8))
        const overlap = occupied.reduce((total, other) => total
          + Math.max(0, Math.min(box.x + box.w + 4, other.x + other.w) - Math.max(box.x - 4, other.x))
          * Math.max(0, Math.min(box.y + box.h + 4, other.y + other.h) - Math.max(box.y - 4, other.y)), 0)
        return outside * 10000 + overlap
      }
      const placement = options.find((option) => score(option.box) === 0)
        ?? options.reduce((best, option) => score(option.box) < score(best.box) ? option : best)
      occupied.push(placement.box)
      entry.button.style.display = ''
      entry.button.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) ${placement.transform}`
      entry.button.style.zIndex = active ? '20' : String(15 - Math.min(occupied.length, 14))
    }
  }
  const pickPlace = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect()
    pickVector.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pickVector, camera); raycaster.far = 2000
    const hit = raycaster.intersectObjects(pickables, false)[0]
    const place = hit && campusPlaces.find((entry) => entry.id === hit.object.userData.placeId)
    if (place && latest.current.places.some((entry) => entry.id === place.id)) latest.current.onSelect(place)
  }
  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    renderer.domElement.focus({ preventScroll: true })
    drag = { x: event.clientX, y: event.clientY, moved: 0, id: event.pointerId }
    if (currentMode === 'walk') renderer.domElement.setPointerCapture(event.pointerId)
  }
  const pointerMove = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = event.clientX; drag.y = event.clientY
    if (currentMode === 'walk') { yaw -= dx * .004; pitch = clamp(pitch - dy * .003, -.95, .95); aimWalk(); invalidate() }
  }
  const pointerUp = (event: PointerEvent) => {
    if (drag?.id === event.pointerId && drag.moved < 6) pickPlace(event)
    drag = null
  }
  const keyDown = (event: KeyboardEvent) => {
    if (currentMode !== 'walk' || !['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(event.code)) return
    event.preventDefault(); keys.add(event.code); invalidate()
  }
  const keyUp = (event: KeyboardEvent) => keys.delete(event.code)
  const clearKeys = () => { keys.clear(); drag = null }
  renderer.domElement.addEventListener('pointerdown', pointerDown)
  renderer.domElement.addEventListener('pointermove', pointerMove)
  renderer.domElement.addEventListener('pointerup', pointerUp)
  renderer.domElement.addEventListener('pointercancel', clearKeys)
  renderer.domElement.addEventListener('keydown', keyDown)
  host.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('keyup', keyUp)
  window.addEventListener('blur', clearKeys)
  const contextLost = (event: Event) => { event.preventDefault(); latest.current.onError() }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  const paintImmediately = () => {
    if (disposed || renderFailed) return
    camera.updateMatrixWorld()
    try { renderer.render(scene, camera); updateLabels() } catch (error) {
      renderer.domElement.dataset.sceneError = String(error); renderFailed = true; latest.current.onError()
    }
  }
  const resize = new ResizeObserver(() => {
    if (host.clientWidth < 1 || host.clientHeight < 1) { invalidate(); return }
    const width = host.clientWidth, height = host.clientHeight
    renderer.setSize(width, height, false); camera.aspect = width / height
    if (!overviewInteracted && currentMode === 'orbit') {
      camera.position.copy(overviewPosition(camera.aspect)); controls.target.copy(INITIAL_TARGET)
    }
    camera.updateProjectionMatrix(); controls.update(); invalidate()
    // setSize clears the canvas; repaint immediately even before an intersection/visibility event.
    paintImmediately()
  })
  resize.observe(host)
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) clearKeys(); invalidate() }, { rootMargin: '80px' })
  intersection.observe(host)
  const visibility = () => { if (document.hidden) clearKeys(); invalidate() }
  document.addEventListener('visibilitychange', visibility)

  const animate = (time: number) => {
    if (disposed) return
    frame = requestAnimationFrame(animate)
    const delta = Math.min((time - lastTime) / 1000 || .016, .05); lastTime = time
    const rect = host.getBoundingClientRect()
    const actuallyVisible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    renderer.domElement.dataset.sceneVisibility = `${visible}/${actuallyVisible}/${document.visibilityState}`
    if (renderFailed || ((!visible && !actuallyVisible) || document.hidden)) return
    const walking = currentMode === 'walk' && keys.size > 0
    if (walking) {
      const forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))
      const strafe = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
      const speed = delta * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 12 : 5)
      const magnitude = Math.max(1, Math.hypot(forward, strafe))
      const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) / magnitude * speed
      const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) / magnitude * speed
      const x = clamp(camera.position.x + dx, -530, 510), z = clamp(camera.position.z + dz, -430, 335)
      if (!isBlocked(x, camera.position.z)) camera.position.x = x
      if (!isBlocked(camera.position.x, z)) camera.position.z = z
      aimWalk(); dirty = true
    }
    if (transition) {
      const progress = clamp((time - transition.start) / 850, 0, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      camera.position.lerpVectors(transition.from, transition.to, eased)
      controls.target.lerpVectors(transition.fromTarget, transition.target, eased)
      controls.update(); dirty = true
      if (progress === 1) transition = null
    } else if (currentMode === 'orbit' && settleFrames > 0) { controls.update(); settleFrames-- }
    // Keep a low-frequency refresh while idle: capture/resize and tab compositors can discard
    // a WebGL presentation buffer without generating a controls change event.
    if (!dirty && !walking && !transition && time - lastRenderTime < 250) return
    const finite = [...camera.position.toArray(), ...camera.quaternion.toArray(), ...controls.target.toArray(), camera.aspect].every(Number.isFinite)
    if (!finite || camera.position.length() > 4000 || camera.aspect <= 0) {
      transition = null; camera.position.copy(INITIAL_POSITION); controls.target.copy(INITIAL_TARGET)
      camera.aspect = Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1)
      camera.updateProjectionMatrix(); controls.update()
    }
    camera.updateMatrixWorld()
    try { renderer.render(scene, camera) } catch (error) {
      renderer.domElement.dataset.sceneError = String(error); renderFailed = true; latest.current.onError(); return
    }
    lastRenderTime = time; renderedFrames++
    renderer.domElement.dataset.sceneCamera = camera.position.toArray().map((value) => value.toFixed(2)).join(',')
    renderer.domElement.dataset.sceneTarget = controls.target.toArray().map((value) => value.toFixed(2)).join(',')
    renderer.domElement.dataset.sceneQuaternion = camera.quaternion.toArray().map((value) => value.toFixed(3)).join(',')
    renderer.domElement.dataset.sceneFrames = String(renderedFrames)
    renderer.domElement.dataset.sceneDrawCalls = String(renderer.info.render.calls)
    renderer.domElement.dataset.sceneTriangles = String(renderer.info.render.triangles)
    if (time - lastLabelTime > 85 || settleFrames === 0) { updateLabels(); lastLabelTime = time }
    if (time - lastViewTime > 100) {
      camera.getWorldDirection(worldForward)
      const heading = (Math.atan2(worldForward.x, -worldForward.z) * 180 / Math.PI + 360) % 360
      latest.current.onViewChange?.({ zoom: currentMode === 'orbit' ? DEFAULT_DISTANCE / camera.position.distanceTo(controls.target) : 1, heading })
      lastViewTime = time
    }
    dirty = false
  }
  update(); renderer.shadowMap.needsUpdate = true
  renderer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1), false)
  camera.aspect = Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1); camera.updateProjectionMatrix()
  paintImmediately()
  frame = requestAnimationFrame(animate)

  return {
    update, command,
    setWalkInput: (key, down) => { if (down) keys.add(key); else keys.delete(key); invalidate() },
    dispose: () => {
      disposed = true; cancelAnimationFrame(frame); controls.dispose(); resize.disconnect(); intersection.disconnect()
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove); renderer.domElement.removeEventListener('pointerup', pointerUp)
      renderer.domElement.removeEventListener('pointercancel', clearKeys); renderer.domElement.removeEventListener('keydown', keyDown); renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      host.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keyup', keyUp); window.removeEventListener('blur', clearKeys); document.removeEventListener('visibilitychange', visibility)
      resources.geometries.forEach((geometry) => geometry.dispose()); resources.materials.forEach((material) => material.dispose()); resources.textures.forEach((texture) => texture.dispose())
      scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); labelLayer.replaceChildren()
    },
  }
}

/** Local, real WebGL campus reconstruction. Geometry is geographical; unrecorded facade details are illustrative. */
export function BuetCampusScene(props: CampusSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SceneController | null>(null)
  const latest = useRef(props)
  latest.current = props
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hostRef.current || !labelRef.current) return
    try {
      const controller = initializeScene(hostRef.current, labelRef.current, latest)
      controllerRef.current = controller; setReady(true)
      return () => { controller.dispose(); controllerRef.current = null }
    } catch { latest.current.onError() }
  }, [])
  useEffect(() => { controllerRef.current?.update() }, [props.places, props.selectedId, props.hoveredId, props.labels, props.lighting, props.mode])
  useEffect(() => { controllerRef.current?.command(props.cameraCommand) }, [props.cameraCommand])

  return <div className={`buet-scene ${props.mode === 'walk' ? 'is-walk-mode' : ''}`} ref={hostRef}>
    <div className="buet-scene-labels" ref={labelRef} aria-label="Places in the 3D view" />
    {!ready && <div className="buet-scene-loading" role="status">Building the campus…</div>}
    {props.mode === 'walk' && <div className="buet-scene-walk-pad" aria-label="Walking controls">
      {([['KeyW', '↑', 'Walk forward'], ['KeyA', '←', 'Walk left'], ['KeyS', '↓', 'Walk backward'], ['KeyD', '→', 'Walk right']] as const).map(([key, arrow, label]) => <button key={key} type="button" aria-label={label} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); controllerRef.current?.setWalkInput(key, true) }} onPointerUp={() => controllerRef.current?.setWalkInput(key, false)} onPointerCancel={() => controllerRef.current?.setWalkInput(key, false)} onLostPointerCapture={() => controllerRef.current?.setWalkInput(key, false)} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); controllerRef.current?.setWalkInput(key, true) } }} onKeyUp={() => controllerRef.current?.setWalkInput(key, false)} onBlur={() => controllerRef.current?.setWalkInput(key, false)}>{arrow}</button>)}
    </div>}
  </div>
}

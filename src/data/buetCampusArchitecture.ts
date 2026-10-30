/**
 * Public-source architectural cues for the campus scene, keyed by OSM footprint id.
 * No metric height here is surveyed. `levels` is an OSM tag except the official
 * five-storey library and the explicitly labelled two-storey visual estimate for
 * OAB. A renderer that multiplies storeys by a typical floor height creates an
 * approximation. Materials mean dominant exterior appearance, not a structural
 * survey. Photos establish facade cues only and may predate renovations.
 * Building footprints remain © OpenStreetMap contributors (ODbL 1.0).
 */
export interface CampusArchitecture {
  height?: number
  levels?: number
  material: 'brick' | 'concrete' | 'glass'
  roof?: 'flat' | 'pitched'
  note?: string
  sourceUrl?: string
}

export const campusArchitecture: Record<string, CampusArchitecture> = {
  "way/96797010": {
    "levels": 11,
    "material": "concrete",
    "roof": "flat",
    "note": "OSM maps 11 levels; this is not a measured height. The 2018 reference shows cream/off-white concrete wings, narrow dark horizontal window bands, a broad central dark-glass curtain wall, and curved glazed vertical stair/lift bays. Rendered proportions are approximate.",
    "sourceUrl": "https://www.openstreetmap.org/way/96797010"
  },
  "way/96796998": {
    "levels": 6,
    "material": "concrete",
    "roof": "flat",
    "note": "OSM maps 6 levels; this is not a measured height. The 2006 reference shows salmon/pink concrete, red-brick infill panels, deep horizontal shading bands, and closely spaced slanting pale sun fins at an upper level. Older photography may not show current paint.",
    "sourceUrl": "https://www.openstreetmap.org/way/96796998"
  },
  "way/96797005": {
    "levels": 6,
    "material": "brick",
    "roof": "flat",
    "note": "OSM maps 6 levels; this is not a measured height. The photo shows red-brick infill within a strong white concrete grid, repetitive recessed rectangular window bays, and a broad pale central circulation bay.",
    "sourceUrl": "https://www.openstreetmap.org/way/96797005"
  },
  "way/1194017615": {
    "levels": 5,
    "material": "concrete",
    "roof": "flat",
    "note": "OSM maps 5 levels; this is not a measured height. The 2018 reference shows gray concrete structure with projecting pale square sun-shading screens formed by horizontal slats and deep dark recesses. A plain brick treatment would miss this photographed facade.",
    "sourceUrl": "https://www.openstreetmap.org/way/1194017615"
  },
  "way/96797002": {
    "levels": 2,
    "material": "concrete",
    "roof": "flat",
    "note": "Two visible storeys are inferred from an older exterior photograph, not a surveyed or OSM level count. Warm cream painted concrete/plaster, deep rectangular openings, a low entrance canopy on narrow columns, and a restrained horizontal silhouette. Courtyards follow the OSM multipolygon.",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Old_Academic_Building_at_the_Bangladesh_University_of_Engineering_and_Technology.jpg"
  },
  "way/1528516219": {
    "levels": 5,
    "material": "concrete",
    "roof": "flat",
    "note": "The official BUET Library location page describes a five-storey building; no metric height is supplied. The 2021 photo shows off-white concrete walls, dark rectangular windows, deep recesses, and horizontal floor bands.",
    "sourceUrl": "https://lib.buet.ac.bd/home/index.php/ppage/com/Location"
  },
  "way/96797022": {
    "levels": 3,
    "material": "brick",
    "roof": "flat",
    "note": "OSM maps 3 levels; this is not a measured height. The older front-elevation photo shows a lower heritage wing with red exposed-brick piers and arches, white/cream wall panels, and an upper open veranda. Whole-footprint massing is simplified; the photo does not establish that all wings have the same height.",
    "sourceUrl": "https://www.openstreetmap.org/way/96797022"
  }
}

export interface CampusArchitectureReference {
  buildingId: string
  label: string
  path: string
  sourceUrl: string
  author: string
  license: string
  licenseUrl: string
  year: number
}

/** Openly licensed reference photos, delivered as Wikimedia 960px thumbnails. */
export const campusArchitectureReferences: readonly CampusArchitectureReference[] = [
  {
    "buildingId": "way/96797010",
    "label": "ECE Building",
    "path": "/maps/buet/ece-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:ECE_Building.jpg",
    "author": "Wiki Ruhan",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "year": 2018
  },
  {
    "buildingId": "way/1194017615",
    "label": "Architecture Building",
    "path": "/maps/buet/architecture-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Architecture_building_.jpg",
    "author": "Wiki Ruhan",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "year": 2018
  },
  {
    "buildingId": "way/96797005",
    "label": "Mechanical / EME Building",
    "path": "/maps/buet/mechanical-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:BUET_EME_Building.jpg",
    "author": "Ashique Mahmud Rupam (photo credit in file description); uploaded by Ragib",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "year": 2003
  },
  {
    "buildingId": "way/96796998",
    "label": "Civil Engineering Building",
    "path": "/maps/buet/civil-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Civil_Engineering_Building_of_BUET_seen_from_EME_Building.JPG",
    "author": "Raiyan Kamal",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
    "year": 2006
  },
  {
    "buildingId": "way/96797002",
    "label": "Old Academic Building",
    "path": "/maps/buet/oab-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Old_Academic_Building_at_the_Bangladesh_University_of_Engineering_and_Technology.jpg",
    "author": "Azfar-adib",
    "license": "Public domain dedication",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Old_Academic_Building_at_the_Bangladesh_University_of_Engineering_and_Technology.jpg",
    "year": 2006
  },
  {
    "buildingId": "way/1528516219",
    "label": "Central Library",
    "path": "/maps/buet/library-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Library_Building,_BUET.jpg",
    "author": "Ankan Ghosh Dastider / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "year": 2021
  },
  {
    "buildingId": "way/96797022",
    "label": "Registrar Building",
    "path": "/maps/buet/registrar-reference.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Registrar_Building_BUET_1.A.M.R.jpg",
    "author": "A.M.R.",
    "license": "CC BY 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.5/",
    "year": 2006
  }
]

/**
 * BUET campus explorer: a local OpenStreetMap snapshot and curated public landmarks.
 * Coordinates and footprints are WGS84 [longitude, latitude]. This is an orientation
 * map, not a surveyed site plan; POIs are representative points, not entrances.
 * Geometry retrieved 30 October 2026 via the OpenStreetMap v0.6 map API.
 * Map data © OpenStreetMap contributors, available under ODbL 1.0:
 * https://www.openstreetmap.org/copyright
 */
import geometryJson from './buetCampusGeometry.json?raw'

export type CampusCategory = 'academic' | 'residential' | 'facilities' | 'landmark'
export type CampusCoordinate = readonly [number, number]

export interface CampusPlace {
  id: string
  name: string
  shortName: string
  nameBn: string
  category: CampusCategory
  description: string
  coordinates: CampusCoordinate
  aliases: readonly string[]
  sourceUrl: string
  buildingIds: readonly string[]
}

export interface CampusGeometry {
  bounds: { west: number; south: number; east: number; north: number }
  source: string
  sourceUrl: string
  retrievedAt: string
  buildings: { id: string; points: CampusCoordinate[]; name?: string; levels?: number; holes?: CampusCoordinate[][] }[]
  roads: { id: string; points: CampusCoordinate[]; kind: string; name?: string }[]
  greens: { id: string; points: CampusCoordinate[]; kind: string; name?: string }[]
}

export const campusGeometry = JSON.parse(geometryJson) as CampusGeometry

export const campusPlaces: readonly CampusPlace[] = [
  {
    "id": "library",
    "name": "BUET Central Library",
    "shortName": "Central Library",
    "nameBn": "কেন্দ্রীয় গ্রন্থাগার",
    "category": "facilities",
    "description": "The university’s central library, close to the main academic buildings. Explore its collections, reading rooms and research resources.",
    "coordinates": [
      90.3911333,
      23.7270419
    ],
    "aliases": [
      "library",
      "central library",
      "লাইব্রেরি",
      "গ্রন্থাগার"
    ],
    "sourceUrl": "https://lib.buet.ac.bd/home/index.php/ppage/com/Location",
    "buildingIds": [
      "way/1528516219"
    ]
  },
  {
    "id": "ece",
    "name": "Electrical & Computer Engineering Building",
    "shortName": "ECE Building",
    "nameBn": "ইসিই ভবন",
    "category": "academic",
    "description": "The West Palashi academic hub for CSE, EEE and BME. The building stands west of the main campus, across Palashi Road.",
    "coordinates": [
      90.3885509,
      23.7266681
    ],
    "aliases": [
      "CSE",
      "EEE",
      "BME",
      "IICT",
      "electrical",
      "computer science",
      "biomedical",
      "ইসিই",
      "সিএসই"
    ],
    "sourceUrl": "https://cse.buet.ac.bd/home/contact",
    "buildingIds": [
      "way/96797010"
    ]
  },
  {
    "id": "civil",
    "name": "Dr. Jamilur Reza Choudhury Civil Engineering Building",
    "shortName": "Civil Engineering",
    "nameBn": "সিভিল ইঞ্জিনিয়ারিং ভবন",
    "category": "academic",
    "description": "The Civil Engineering building in the main academic area, east of the library and auditorium.",
    "coordinates": [
      90.3925698,
      23.7265136
    ],
    "aliases": [
      "CE",
      "civil",
      "JRC",
      "জামিলুর রেজা চৌধুরী",
      "সিভিল"
    ],
    "sourceUrl": "https://ce.buet.ac.bd/",
    "buildingIds": [
      "way/96796998"
    ]
  },
  {
    "id": "mechanical",
    "name": "Mechanical Engineering Building",
    "shortName": "Mechanical Engineering",
    "nameBn": "মেকানিক্যাল ইঞ্জিনিয়ারিং ভবন",
    "category": "academic",
    "description": "The Mechanical Engineering complex, also commonly called the EME Building, beside the Civil Engineering building.",
    "coordinates": [
      90.3925329,
      23.7259578
    ],
    "aliases": [
      "ME",
      "EME",
      "IPE",
      "mechanical",
      "মেকানিক্যাল",
      "ইএমই"
    ],
    "sourceUrl": "https://ipe.buet.ac.bd/index.php/library",
    "buildingIds": [
      "way/96797005",
      "way/97207373"
    ]
  },
  {
    "id": "oab",
    "name": "Old Academic Building",
    "shortName": "Old Academic Building",
    "nameBn": "পুরাতন একাডেমিক ভবন",
    "category": "academic",
    "description": "A major academic building in the older campus, north of the main engineering buildings.",
    "coordinates": [
      90.3929025,
      23.7277858
    ],
    "aliases": [
      "OAB",
      "old academic",
      "PMRE",
      "পুরাতন"
    ],
    "sourceUrl": "https://pmre.buet.ac.bd/library",
    "buildingIds": [
      "way/96797002"
    ]
  },
  {
    "id": "architecture",
    "name": "Architecture Building",
    "shortName": "Architecture",
    "nameBn": "স্থাপত্য ভবন",
    "category": "academic",
    "description": "The Department of Architecture on BUET’s East Campus, immediately north of the Central Library.",
    "coordinates": [
      90.3911089,
      23.7275015
    ],
    "aliases": [
      "Arch",
      "architecture",
      "স্থাপত্য",
      "আর্কি"
    ],
    "sourceUrl": "https://arch.buet.ac.bd/contact",
    "buildingIds": [
      "way/1194017615"
    ]
  },
  {
    "id": "urp",
    "name": "Urban & Regional Planning Building",
    "shortName": "URP Building",
    "nameBn": "নগর ও অঞ্চল পরিকল্পনা ভবন",
    "category": "academic",
    "description": "The Urban and Regional Planning building near Architecture in the northern academic cluster.",
    "coordinates": [
      90.3914313,
      23.7277181
    ],
    "aliases": [
      "URP",
      "urban",
      "planning",
      "নগর"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797001",
    "buildingIds": [
      "way/96797001"
    ]
  },
  {
    "id": "itn",
    "name": "ITN-BUET",
    "shortName": "ITN-BUET",
    "nameBn": "আইটিএন-বুয়েট",
    "category": "academic",
    "description": "The ITN-BUET building at the northern edge of the main academic cluster.",
    "coordinates": [
      90.3917784,
      23.7279819
    ],
    "aliases": [
      "ITN",
      "ITN-BUET",
      "international training network"
    ],
    "sourceUrl": "https://itn.buet.ac.bd/web/",
    "buildingIds": [
      "way/96797009"
    ]
  },
  {
    "id": "auditorium",
    "name": "BUET Auditorium",
    "shortName": "Auditorium",
    "nameBn": "বুয়েট অডিটোরিয়াম",
    "category": "facilities",
    "description": "The campus auditorium, beside the central cafeteria and close to the Shaheed Minar.",
    "coordinates": [
      90.3915212,
      23.7265018
    ],
    "aliases": [
      "auditorium",
      "central auditorium",
      "অডিটোরিয়াম"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/1528516220",
    "buildingIds": [
      "way/1528516220"
    ]
  },
  {
    "id": "cafeteria",
    "name": "BUET Central Cafeteria",
    "shortName": "Central Cafeteria",
    "nameBn": "কেন্দ্রীয় ক্যাফেটেরিয়া",
    "category": "facilities",
    "description": "The central cafeteria in the main campus, south of the library and west of the auditorium.",
    "coordinates": [
      90.3911839,
      23.7267083
    ],
    "aliases": [
      "cafe",
      "canteen",
      "food",
      "ক্যাফে",
      "ক্যান্টিন"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797026",
    "buildingIds": [
      "way/96797026"
    ]
  },
  {
    "id": "health",
    "name": "BUET Health Complex",
    "shortName": "Health Complex",
    "nameBn": "স্বাস্থ্য কমপ্লেক্স",
    "category": "facilities",
    "description": "The university health complex near the northern end of the main academic area.",
    "coordinates": [
      90.3924224,
      23.7279236
    ],
    "aliases": [
      "medical",
      "clinic",
      "health",
      "মেডিকেল",
      "স্বাস্থ্য"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797015",
    "buildingIds": [
      "way/96797015"
    ]
  },
  {
    "id": "registrar",
    "name": "BUET Registrar Building",
    "shortName": "Registrar Building",
    "nameBn": "রেজিস্ট্রার ভবন",
    "category": "facilities",
    "description": "The university registrar building in the eastern part of the main campus.",
    "coordinates": [
      90.3935213,
      23.7259584
    ],
    "aliases": [
      "registrar",
      "administration",
      "admin",
      "রেজিস্ট্রার"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797022",
    "buildingIds": [
      "way/96797022"
    ]
  },
  {
    "id": "dsw",
    "name": "Directorate of Students’ Welfare",
    "shortName": "Students’ Welfare",
    "nameBn": "ছাত্রকল্যাণ পরিদপ্তর",
    "category": "facilities",
    "description": "The DSW office supports student welfare, campus activities and residential hall services.",
    "coordinates": [
      90.3940452,
      23.7251351
    ],
    "aliases": [
      "DSW",
      "student welfare",
      "ছাত্রকল্যাণ"
    ],
    "sourceUrl": "https://dsw.buet.ac.bd/",
    "buildingIds": [
      "way/97207376"
    ]
  },
  {
    "id": "playground",
    "name": "BUET Central Playground",
    "shortName": "Central Playground",
    "nameBn": "কেন্দ্রীয় খেলার মাঠ",
    "category": "landmark",
    "description": "The large open sports ground on the eastern side of campus.",
    "coordinates": [
      90.3944565,
      23.7258905
    ],
    "aliases": [
      "field",
      "sports",
      "playground",
      "মাঠ",
      "খেলার মাঠ"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/97207659",
    "buildingIds": []
  },
  {
    "id": "shaheed-minar",
    "name": "BUET Shaheed Minar",
    "shortName": "Shaheed Minar",
    "nameBn": "বুয়েট শহীদ মিনার",
    "category": "landmark",
    "description": "The campus memorial south of the auditorium and near the main engineering buildings.",
    "coordinates": [
      90.3918607,
      23.7261287
    ],
    "aliases": [
      "shahid minar",
      "memorial",
      "শহীদ মিনার"
    ],
    "sourceUrl": "https://www.openstreetmap.org/node/1119027966",
    "buildingIds": []
  },
  {
    "id": "titumir",
    "name": "Titumir Hall",
    "shortName": "Titumir Hall",
    "nameBn": "তিতুমীর হল",
    "category": "residential",
    "description": "A BUET residential hall southwest of the main academic area, with a Liberation War memorial in its central courtyard.",
    "coordinates": [
      90.3915,
      23.7255278
    ],
    "aliases": [
      "TTH",
      "Titumir",
      "তিতুমীর"
    ],
    "sourceUrl": "https://titumirhall.buet.ac.bd/contact",
    "buildingIds": []
  },
  {
    "id": "suhrawardy",
    "name": "Suhrawardy Hall",
    "shortName": "Suhrawardy Hall",
    "nameBn": "সোহরাওয়ার্দী হল",
    "category": "residential",
    "description": "A BUET residential hall between Palashi Road and the central campus facilities.",
    "coordinates": [
      90.3897246,
      23.7264045
    ],
    "aliases": [
      "SH",
      "Suhrawardy",
      "Sohrawardy",
      "সোহরাওয়ার্দী"
    ],
    "sourceUrl": "https://www.openstreetmap.org/node/830037031",
    "buildingIds": []
  },
  {
    "id": "sher-e-bangla",
    "name": "Sher-e-Bangla Hall",
    "shortName": "Sher-e-Bangla Hall",
    "nameBn": "শেরে বাংলা হল",
    "category": "residential",
    "description": "A BUET residential hall southwest of the library and auditorium area.",
    "coordinates": [
      90.3905006,
      23.7257365
    ],
    "aliases": [
      "SBH",
      "Sher e Bangla",
      "Sher-e-Bangla",
      "শেরে বাংলা"
    ],
    "sourceUrl": "https://www.openstreetmap.org/node/830039614",
    "buildingIds": []
  },
  {
    "id": "ahsanullah",
    "name": "Ahsanullah Hall",
    "shortName": "Ahsanullah Hall",
    "nameBn": "আহসানউল্লাহ হল",
    "category": "residential",
    "description": "A BUET residential hall south of the Mechanical Engineering complex.",
    "coordinates": [
      90.3929088,
      23.7247603
    ],
    "aliases": [
      "AH",
      "Ahsan Ullah",
      "Ahsanullah",
      "আহসানউল্লাহ"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797023",
    "buildingIds": [
      "way/96797023"
    ]
  },
  {
    "id": "shahid-smrity",
    "name": "Shahid Smrity Hall",
    "shortName": "Shahid Smrity Hall",
    "nameBn": "শহীদ স্মৃতি হল",
    "category": "residential",
    "description": "A residential hall complex in the southeastern part of the BUET campus.",
    "coordinates": [
      90.39383,
      23.72429
    ],
    "aliases": [
      "SS",
      "Shahid Smriti",
      "Shaheed Smriti",
      "শহীদ স্মৃতি"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/235414273",
    "buildingIds": [
      "way/235414272",
      "way/235414273",
      "way/235414274",
      "way/235414275"
    ]
  },
  {
    "id": "gymnasium",
    "name": "BUET Gymnasium",
    "shortName": "Gymnasium",
    "nameBn": "বুয়েট জিমনেসিয়াম",
    "category": "facilities",
    "description": "The campus gymnasium in the residential area southwest of the main academic buildings.",
    "coordinates": [
      90.3906568,
      23.7250043
    ],
    "aliases": [
      "gym",
      "sports hall",
      "জিমনেসিয়াম"
    ],
    "sourceUrl": "https://www.openstreetmap.org/way/96797018",
    "buildingIds": [
      "way/96797018"
    ]
  }
]

export const campusTour: readonly string[] = [
  'library', 'architecture', 'oab', 'civil', 'mechanical', 'shaheed-minar', 'auditorium', 'ece',
]

export const campusSources: readonly { label: string; url: string }[] = [
  { label: 'Map data © OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' },
  { label: 'BUET campus location & academic areas', url: 'https://cse.buet.ac.bd/public/docs/studies/CSE_BUET_UG_Course_Calendar_2016.pdf' },
  { label: 'BUET Central Library', url: 'https://lib.buet.ac.bd/home/index.php/ppage/com/Location' },
  { label: 'CSE · ECE Building', url: 'https://cse.buet.ac.bd/home/contact' },
  { label: 'BUET Architecture · East Campus', url: 'https://arch.buet.ac.bd/contact' },
]

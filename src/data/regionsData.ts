import { DisasterState, DisasterCity, Zone, Shelter, Asset, AlertItem } from '../types';
import {
  INITIAL_ZONES,
  INITIAL_SHELTERS,
  INITIAL_ASSETS,
  INITIAL_ALERTS,
  formatLiveTimestamp,
} from './seedData';

// Visakhapatnam Flood Hotspots
const VIZAG_HOTSPOTS = [
  { id: 'hs-1', name: 'HB Colony Low-Lying Storm Drain', lat: 17.7315, lng: 83.306, radius: 600, severity: 'High' },
  { id: 'hs-2', name: 'NAD Junction Underpass Storm Sump', lat: 17.7385, lng: 83.2295, radius: 700, severity: 'Critical' },
  { id: 'hs-3', name: 'Bheemili Beach Road Sea Erosion Zone', lat: 17.8898, lng: 83.436, radius: 800, severity: 'Extreme' },
  { id: 'hs-4', name: 'Gajuwaka Industrial Culvert Stream', lat: 17.6892, lng: 83.2182, radius: 500, severity: 'High' },
];

const RAW_DISASTER_REGIONS: DisasterState[] = [
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    country: 'India',
    cities: [
      {
        id: 'visakhapatnam',
        name: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        country: 'India',
        center: { lat: 17.7285, lng: 83.2885 },
        zoom: 12,
        primaryHazard: 'Bay of Bengal Cyclone & Coastal Surge',
        currentAdvisory: 'CYC-STAGE 3: SEVERE COASTAL ADVISORY',
        advisorySeverity: 'critical',
        readinessScore: 78,
        zones: INITIAL_ZONES,
        shelters: INITIAL_SHELTERS,
        assets: INITIAL_ASSETS,
        hotspots: VIZAG_HOTSPOTS,
        alerts: INITIAL_ALERTS,
      },
      {
        id: 'vijayawada',
        name: 'Vijayawada',
        state: 'Andhra Pradesh',
        country: 'India',
        center: { lat: 16.5062, lng: 80.648 },
        zoom: 12,
        primaryHazard: 'Krishna River Basin Flood & Urban Sump Overflow',
        currentAdvisory: 'FLOOD ALERT: PRAKASAM BARRAGE SPATE RELEASE',
        advisorySeverity: 'critical',
        readinessScore: 82,
        zones: [
          {
            id: 'vja-z1',
            number: 1,
            name: 'Prakasam Barrage & Riverfront',
            readinessScore: 86,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Sri N. Koteswara Rao, EE',
            officerContact: '+91 94401 31001',
            officerRole: 'Executive Engineer (Water Resources)',
            coordinates: [16.5065, 80.605],
            populationAtRisk: 42000,
            shelterCount: 3,
            assetCount: 5,
            deptBreakdown: {},
          },
          {
            id: 'vja-z2',
            number: 2,
            name: 'One Town & Durga Ghat Lowlands',
            readinessScore: 71,
            status: 'pending',
            pendingTaskCount: 5,
            officerName: 'Smt. P. Annapurna',
            officerContact: '+91 94401 31002',
            officerRole: 'Zonal Commissioner (Circle 1)',
            coordinates: [16.518, 80.612],
            populationAtRisk: 68000,
            shelterCount: 4,
            assetCount: 4,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'vja-s1',
            name: 'Indira Gandhi Municipal Stadium Relief Camp',
            zoneId: 'vja-z1',
            zoneName: 'Prakasam Barrage & Riverfront',
            capacity: 3000,
            currentOccupancy: 450,
            status: 'operational',
            coordinates: [16.504, 80.648],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Sri M. Raghava Rao (Admin)',
            contactPhone: '+91 98480 32101',
          },
          {
            id: 'vja-s2',
            name: 'Andhra Loyola Indoor Multipurpose Shelter',
            zoneId: 'vja-z2',
            zoneName: 'One Town & Durga Ghat Lowlands',
            capacity: 2200,
            currentOccupancy: 280,
            status: 'operational',
            coordinates: [16.516, 80.665],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Rev. Fr. Principal',
            contactPhone: '+91 98480 32102',
          },
        ],
        assets: [
          {
            id: 'vja-a1',
            qrId: 'VJA-PUMP-901',
            name: '120HP Dewatering Pump (Prakasam Sluice)',
            type: 'de-watering-pump',
            status: 'ready',
            department: 'Water Resources',
            zoneId: 'vja-z1',
            zoneName: 'Prakasam Barrage',
            location: 'Prakasam Barrage Sluice Channel',
            coordinates: [16.5065, 80.605],
            fuelLevel: 92,
            operatorName: 'R. Veerabhadram',
            operatorContact: '+91 94401 90111',
            lastMaintenance: formatLiveTimestamp(40),
            qrCodeUrl: '',
          },
          {
            id: 'vja-a2',
            qrId: 'VJA-BOAT-10',
            name: 'NDRF Motorized Inflatable Boat Fleet #10',
            type: 'rescue-boat',
            status: 'ready',
            department: 'NDRF 10th Battalion',
            zoneId: 'vja-z2',
            zoneName: 'One Town & Durga Ghat Lowlands',
            location: 'Ferry Ghat Staging Point',
            coordinates: [16.523, 80.589],
            fuelLevel: 100,
            operatorName: 'Sub-Inspector Anoop Kumar',
            operatorContact: '+91 94401 90112',
            lastMaintenance: formatLiveTimestamp(15),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'vja-hs1', name: 'Prakasam Barrage Downstream Flood Sump', lat: 16.505, lng: 80.608, radius: 750, severity: 'Critical' },
          { id: 'vja-hs2', name: 'Eluru Canal Low Embankment Breach Point', lat: 16.519, lng: 80.671, radius: 550, severity: 'High' },
        ],
        alerts: [
          {
            id: 'vja-alt1',
            title: 'Prakasam Barrage Inflow Surge',
            description: 'Inflow exceeding 4.2 lakh cusecs from Munneru and upstream reservoirs. 70 spillway gates opened.',
            zoneId: 'vja-z1',
            zoneName: 'Prakasam Barrage',
            severity: 'critical',
            resolved: false,
            department: 'Water Resources',
            createdAt: formatLiveTimestamp(18),
          },
        ],
      },
      {
        id: 'tirupati',
        name: 'Tirupati',
        state: 'Andhra Pradesh',
        country: 'India',
        center: { lat: 13.6288, lng: 79.4192 },
        zoom: 12,
        primaryHazard: 'Seshachalam Hills Flash Floods & Hill Stream Spate',
        currentAdvisory: 'FLASH FLOOD WATCH: HILL RUNOFF ELEVATED',
        advisorySeverity: 'warning',
        readinessScore: 88,
        zones: [
          {
            id: 'tpt-z1',
            number: 1,
            name: 'Alipiri Hill Gateway & Ghat Road',
            readinessScore: 92,
            status: 'ready',
            pendingTaskCount: 1,
            officerName: 'Sri D. Murali Krishna',
            officerContact: '+91 94401 32001',
            officerRole: 'TTD Vigilance & Disaster Officer',
            coordinates: [13.649, 79.398],
            populationAtRisk: 25000,
            shelterCount: 3,
            assetCount: 4,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'tpt-s1',
            name: 'Srinivasa Sports Complex Cyclone Shelter',
            zoneId: 'tpt-z1',
            zoneName: 'Alipiri Hill Gateway',
            capacity: 2500,
            currentOccupancy: 210,
            status: 'operational',
            coordinates: [13.639, 79.412],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Sri P. Srinivasulu',
            contactPhone: '+91 98480 33001',
          },
        ],
        assets: [
          {
            id: 'tpt-a1',
            qrId: 'TPT-GEN-501',
            name: '200kVA Heavy Genset (Alipiri Relief Hub)',
            type: 'generator',
            status: 'ready',
            department: 'APSPDCL & TTD',
            zoneId: 'tpt-z1',
            zoneName: 'Alipiri Gateway',
            location: 'Alipiri Staging Area',
            coordinates: [13.649, 79.398],
            fuelLevel: 95,
            operatorName: 'K. Subrahmanyam',
            operatorContact: '+91 94401 33111',
            lastMaintenance: formatLiveTimestamp(55),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'tpt-hs1', name: 'Kapila Theertham Hill Stream Overflow', lat: 13.652, lng: 79.415, radius: 450, severity: 'High' },
        ],
        alerts: [
          {
            id: 'tpt-alt1',
            title: 'Seshachalam Hill Water Inflow Advisory',
            description: 'Check dam levels in Seshachalam forest reaching 90% capacity. Forest patrol teams on high alert.',
            zoneId: 'tpt-z1',
            zoneName: 'Alipiri Hill Gateway',
            severity: 'warning',
            resolved: false,
            department: 'Disaster Cell',
            createdAt: formatLiveTimestamp(30),
          },
        ],
      },
      {
        id: 'kakinada',
        name: 'Kakinada',
        state: 'Andhra Pradesh',
        country: 'India',
        center: { lat: 16.9891, lng: 82.2475 },
        zoom: 12,
        primaryHazard: 'Coastal Surge & Bay of Bengal Tidal Landfall',
        currentAdvisory: 'HIGH SEAS WATCH: 4.2M COASTAL SWELLS',
        advisorySeverity: 'warning',
        readinessScore: 81,
        zones: [
          {
            id: 'kkd-z1',
            number: 1,
            name: 'Deepwater Port & Harbor Anchorage',
            readinessScore: 83,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Capt. S. Narayana',
            officerContact: '+91 94401 34001',
            officerRole: 'Port Conservator',
            coordinates: [16.995, 82.285],
            populationAtRisk: 18000,
            shelterCount: 2,
            assetCount: 4,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'kkd-s1',
            name: 'Kakinada Port Cyclone Center',
            zoneId: 'kkd-z1',
            zoneName: 'Deepwater Port',
            capacity: 2000,
            currentOccupancy: 310,
            status: 'operational',
            coordinates: [16.985, 82.258],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Sri V. Krishna Rao',
            contactPhone: '+91 98480 34101',
          },
        ],
        assets: [
          {
            id: 'kkd-a1',
            qrId: 'KKD-BOAT-02',
            name: 'Coastal Rescue Fast Patrol Craft',
            type: 'rescue-boat',
            status: 'ready',
            department: 'Coast Guard Auxiliary',
            zoneId: 'kkd-z1',
            zoneName: 'Deepwater Port',
            location: 'Kakinada Berth No. 3',
            coordinates: [16.995, 82.285],
            fuelLevel: 98,
            operatorName: 'Cdr. P. Mohan',
            operatorContact: '+91 94401 34201',
            lastMaintenance: formatLiveTimestamp(10),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'kkd-hs1', name: 'Hope Island Tidal Overwash Sector', lat: 16.972, lng: 82.345, radius: 800, severity: 'High' },
        ],
        alerts: [
          {
            id: 'kkd-alt1',
            title: 'Tidal Swell Advisory',
            description: 'Tidal surge of 4.2m expected along Kakinada coast during high tide window. Fishermen warned against venture.',
            zoneId: 'kkd-z1',
            zoneName: 'Deepwater Port',
            severity: 'warning',
            resolved: false,
            department: 'Marine Safety',
            createdAt: formatLiveTimestamp(25),
          },
        ],
      },
    ],
  },
  {
    id: 'odisha',
    name: 'Odisha',
    country: 'India',
    cities: [
      {
        id: 'puri',
        name: 'Puri',
        state: 'Odisha',
        country: 'India',
        center: { lat: 19.8135, lng: 85.8312 },
        zoom: 12,
        primaryHazard: 'Severe Bay of Bengal Cyclone Landfall & Sand Dune Breaches',
        currentAdvisory: 'CYCLONE RED ALERT: LANDFALL FORECAST 120 KM/H',
        advisorySeverity: 'critical',
        readinessScore: 84,
        zones: [
          {
            id: 'pri-z1',
            number: 1,
            name: 'Sea Beach & Swargadwar Coastal Sector',
            readinessScore: 88,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Sri Subrat Samal, OAS',
            officerContact: '+91 94370 10001',
            officerRole: 'Sub-Collector & Incident Commander',
            coordinates: [19.798, 85.815],
            populationAtRisk: 48000,
            shelterCount: 5,
            assetCount: 6,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'pri-s1',
            name: 'Puri Zilla School Multipurpose Cyclone Shelter',
            zoneId: 'pri-z1',
            zoneName: 'Sea Beach & Swargadwar',
            capacity: 3500,
            currentOccupancy: 980,
            status: 'operational',
            coordinates: [19.801, 85.818],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Sri B. C. Panda (Headmaster)',
            contactPhone: '+91 94371 22001',
          },
        ],
        assets: [
          {
            id: 'pri-a1',
            qrId: 'ODRAF-PURI-01',
            name: 'ODRAF High-Speed Storm Rescue Craft',
            type: 'rescue-boat',
            status: 'ready',
            department: 'ODRAF Command',
            zoneId: 'pri-z1',
            zoneName: 'Sea Beach Sector',
            location: 'Swargadwar Staging Post',
            coordinates: [19.798, 85.815],
            fuelLevel: 100,
            operatorName: 'Inspector Pratap Jena',
            operatorContact: '+91 94370 55101',
            lastMaintenance: formatLiveTimestamp(10),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'pri-hs1', name: 'Swargadwar Seafront Breaching Line', lat: 19.796, lng: 85.814, radius: 700, severity: 'Extreme' },
        ],
        alerts: [
          {
            id: 'pri-alt1',
            title: 'Severe Cyclone Landfall Alert',
            description: 'Eye of cyclonic system 140km offshore. Wind gusts up to 135 km/h predicted. Evacuation of coastal 500m completed.',
            zoneId: 'pri-z1',
            zoneName: 'Sea Beach Sector',
            severity: 'critical',
            resolved: false,
            department: 'Disaster Cell',
            createdAt: formatLiveTimestamp(12),
          },
        ],
      },
      {
        id: 'bhubaneswar',
        name: 'Bhubaneswar',
        state: 'Odisha',
        country: 'India',
        center: { lat: 20.2961, lng: 85.8245 },
        zoom: 12,
        primaryHazard: 'Urban Flooding & Gale Wind Fallen Tree Obstructions',
        currentAdvisory: 'HIGH GUST WARNING: GALE FORCE 85 KM/H',
        advisorySeverity: 'warning',
        readinessScore: 87,
        zones: [
          {
            id: 'bbsr-z1',
            number: 1,
            name: 'Patia & Infocity IT Corridor',
            readinessScore: 91,
            status: 'ready',
            pendingTaskCount: 1,
            officerName: 'Sri A. K. Pradhan',
            officerContact: '+91 94370 20001',
            officerRole: 'BMC Zonal Deputy Commissioner',
            coordinates: [20.355, 85.818],
            populationAtRisk: 75000,
            shelterCount: 4,
            assetCount: 5,
            deptBreakdown: {},
          },
          {
            id: 'bbsr-z2',
            number: 2,
            name: 'Master Canteen & Railway Station Basin',
            readinessScore: 84,
            status: 'ready',
            pendingTaskCount: 3,
            officerName: 'Er. S. Mishra',
            officerContact: '+91 94370 20002',
            officerRole: 'Drainage Division Executive',
            coordinates: [20.268, 85.839],
            populationAtRisk: 52000,
            shelterCount: 3,
            assetCount: 4,
            deptBreakdown: {},
          },
        ],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'paradip',
        name: 'Paradip',
        state: 'Odisha',
        country: 'India',
        center: { lat: 20.3164, lng: 86.6114 },
        zoom: 12,
        primaryHazard: 'Deep Sea Port Cyclone Surge & Petroleum Terminal Containment',
        currentAdvisory: 'PORT DANGER SIGNAL 10: ALL OPERATIONS SUSPENDED',
        advisorySeverity: 'critical',
        readinessScore: 86,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'cuttack',
        name: 'Cuttack',
        state: 'Odisha',
        country: 'India',
        center: { lat: 20.4625, lng: 85.8828 },
        zoom: 12,
        primaryHazard: 'Mahanadi & Kathajodi River Embankment High Water Level',
        currentAdvisory: 'RIVER FLOOD ADVISORY: EMBANKMENT PATROL ACTIVE',
        advisorySeverity: 'warning',
        readinessScore: 80,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    country: 'India',
    cities: [
      {
        id: 'chennai',
        name: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        center: { lat: 13.0827, lng: 80.2707 },
        zoom: 12,
        primaryHazard: 'Northeast Monsoon Cloudburst & Adyar/Cooum River Overflow',
        currentAdvisory: 'RED ALERT: ADYAR BASIN INFLOW REACHES CRITICAL THRESHOLD',
        advisorySeverity: 'critical',
        readinessScore: 85,
        zones: [
          {
            id: 'chn-z1',
            number: 1,
            name: 'Marina Beach & Santhome Coastal Sector',
            readinessScore: 89,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Thiru K. Balasubramanian, IAS',
            officerContact: '+91 94440 11001',
            officerRole: 'GCC Regional Deputy Commissioner',
            coordinates: [13.048, 80.281],
            populationAtRisk: 55000,
            shelterCount: 4,
            assetCount: 5,
            deptBreakdown: {},
          },
          {
            id: 'chn-z2',
            number: 2,
            name: 'Velachery & Madipakkam Low-Lying Sump',
            readinessScore: 69,
            status: 'critical',
            pendingTaskCount: 8,
            officerName: 'Er. R. Sivakumar',
            officerContact: '+91 94440 11002',
            officerRole: 'Superintending Engineer (SWD)',
            coordinates: [12.981, 80.218],
            populationAtRisk: 88000,
            shelterCount: 6,
            assetCount: 8,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'chn-s1',
            name: 'Jawaharlal Nehru Indoor Stadium Cyclone Shelter',
            zoneId: 'chn-z1',
            zoneName: 'Marina Coastal Sector',
            capacity: 4500,
            currentOccupancy: 850,
            status: 'operational',
            coordinates: [13.085, 80.275],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Thiru S. Rajendran',
            contactPhone: '+91 98400 12001',
          },
        ],
        assets: [
          {
            id: 'chn-a1',
            qrId: 'GCC-PUMP-401',
            name: 'Heavy 150HP High-Discharge Dewatering Pump',
            type: 'de-watering-pump',
            status: 'ready',
            department: 'Greater Chennai Corporation',
            zoneId: 'chn-z2',
            zoneName: 'Velachery',
            location: 'Velachery Lake Surplus Channel',
            coordinates: [12.981, 80.218],
            fuelLevel: 94,
            operatorName: 'A. Murugan',
            operatorContact: '+91 94440 88101',
            lastMaintenance: formatLiveTimestamp(20),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'chn-hs1', name: 'Velachery 100-Ft Road Inundation Sump', lat: 12.979, lng: 80.219, radius: 850, severity: 'Critical' },
        ],
        alerts: [
          {
            id: 'chn-alt1',
            title: 'Extreme Precipitation Cloudburst',
            description: '180mm rain recorded in southern Chennai within 6 hours. Chembarambakkam reservoir release set to 8,000 cusecs.',
            zoneId: 'chn-z2',
            zoneName: 'Velachery',
            severity: 'critical',
            resolved: false,
            department: 'Water Resources',
            createdAt: formatLiveTimestamp(8),
          },
        ],
      },
      {
        id: 'cuddalore',
        name: 'Cuddalore',
        state: 'Tamil Nadu',
        country: 'India',
        center: { lat: 11.748, lng: 79.7714 },
        zoom: 12,
        primaryHazard: 'Cyclone Landfall Vulnerability & Pennaiyar River Spate',
        currentAdvisory: 'LANDFALL WATCH: EMERGENCY RELIEF STATIONS MANNED',
        advisorySeverity: 'warning',
        readinessScore: 82,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'coimbatore',
        name: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        center: { lat: 11.0168, lng: 76.9558 },
        zoom: 12,
        primaryHazard: 'Western Ghats Flash Floods & Noyyal River Surge',
        currentAdvisory: 'GATKARI BASIN ALERT: FLASH FLOOD RUNOFF',
        advisorySeverity: 'info',
        readinessScore: 89,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    country: 'India',
    cities: [
      {
        id: 'mumbai',
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        center: { lat: 19.076, lng: 72.8777 },
        zoom: 12,
        primaryHazard: 'High Tide 4.8m Coastal Inundation & Mithi River Spate',
        currentAdvisory: 'HIGH TIDE DANGER: 4.88M TIDAL SURGE AT 14:15 IST',
        advisorySeverity: 'critical',
        readinessScore: 86,
        zones: [
          {
            id: 'mum-z1',
            number: 1,
            name: 'Colaba, Marine Drive & Fort Coastal',
            readinessScore: 91,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Shri Makarand Deshmukh, IAS',
            officerContact: '+91 98200 11001',
            officerRole: 'MCGM Ward A Commissioner',
            coordinates: [18.922, 72.828],
            populationAtRisk: 65000,
            shelterCount: 4,
            assetCount: 6,
            deptBreakdown: {},
          },
          {
            id: 'mum-z2',
            number: 2,
            name: 'Kurla, BKC & Mithi River Basin',
            readinessScore: 67,
            status: 'critical',
            pendingTaskCount: 9,
            officerName: 'Er. Sandeep Patil',
            officerContact: '+91 98200 11002',
            officerRole: 'Mithi River Project Lead',
            coordinates: [19.065, 72.882],
            populationAtRisk: 140000,
            shelterCount: 6,
            assetCount: 10,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'mum-s1',
            name: 'Bandra Kurla Complex Disaster Relief Center',
            zoneId: 'mum-z2',
            zoneName: 'Kurla & Mithi River Basin',
            capacity: 5000,
            currentOccupancy: 1200,
            status: 'operational',
            coordinates: [19.068, 72.871],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Shri R. V. Kadam',
            contactPhone: '+91 98200 44001',
          },
        ],
        assets: [
          {
            id: 'mum-a1',
            qrId: 'MCGM-PUMP-88',
            name: 'Cleveland Bunder Heavy Outfall Storm Pump',
            type: 'de-watering-pump',
            status: 'ready',
            department: 'MCGM Storm Water Drains',
            zoneId: 'mum-z2',
            zoneName: 'Kurla, BKC & Mithi River Basin',
            location: 'Worli Outfall Basin',
            coordinates: [19.015, 72.818],
            fuelLevel: 96,
            operatorName: 'D. Shirodkar',
            operatorContact: '+91 98200 88201',
            lastMaintenance: formatLiveTimestamp(15),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'mum-hs1', name: 'Mithi River Kranti Nagar Overflow', lat: 19.072, lng: 72.885, radius: 900, severity: 'Critical' },
        ],
        alerts: [
          {
            id: 'mum-alt1',
            title: 'High Tide & Inundation Sump Sluice Gates',
            description: 'High tide peak of 4.88m coincided with 65mm/hr rain. Flood gates at Britannia and Lovegrove operational.',
            zoneId: 'mum-z2',
            zoneName: 'Kurla & Mithi River',
            severity: 'critical',
            resolved: false,
            department: 'Disaster Cell',
            createdAt: formatLiveTimestamp(5),
          },
        ],
      },
      {
        id: 'pune',
        name: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        center: { lat: 18.5204, lng: 73.8567 },
        zoom: 12,
        primaryHazard: 'Khadakwasla Dam Water Release & Mutha River Spate',
        currentAdvisory: 'DAM SPILLWAY WARNING: 35,000 CUSECS DISCHARGE',
        advisorySeverity: 'warning',
        readinessScore: 88,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'ratnagiri',
        name: 'Ratnagiri',
        state: 'Maharashtra',
        country: 'India',
        center: { lat: 16.9902, lng: 73.312 },
        zoom: 12,
        primaryHazard: 'Konkan Coast Storm Surges & Western Ghat Landslides',
        currentAdvisory: 'COASTAL STORM GALE WARNING: 80 KM/H',
        advisorySeverity: 'warning',
        readinessScore: 83,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    country: 'India',
    cities: [
      {
        id: 'wayanad',
        name: 'Wayanad',
        state: 'Kerala',
        country: 'India',
        center: { lat: 11.6854, lng: 76.132 },
        zoom: 12,
        primaryHazard: 'Hill Landslides, Mudslides & Flash Mountain Floods',
        currentAdvisory: 'LANDSLIDE RED PROTOCOL: HIGH VULNERABILITY ZONES EVACUATED',
        advisorySeverity: 'critical',
        readinessScore: 87,
        zones: [
          {
            id: 'wyd-z1',
            number: 1,
            name: 'Meppadi-Chooralmala Hill Hazard Sector',
            readinessScore: 92,
            status: 'ready',
            pendingTaskCount: 2,
            officerName: 'Smt. Anju Mathew, IAS',
            officerContact: '+91 94470 12001',
            officerRole: 'District Collector & Incident Lead',
            coordinates: [11.545, 76.128],
            populationAtRisk: 18000,
            shelterCount: 6,
            assetCount: 8,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'wyd-s1',
            name: 'Meppadi Government Higher Secondary Relief Camp',
            zoneId: 'wyd-z1',
            zoneName: 'Meppadi-Chooralmala',
            capacity: 2500,
            currentOccupancy: 640,
            status: 'operational',
            coordinates: [11.552, 76.125],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'Sri K. V. Joseph',
            contactPhone: '+91 94470 99001',
          },
        ],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'kochi',
        name: 'Kochi',
        state: 'Kerala',
        country: 'India',
        center: { lat: 9.9312, lng: 76.2673 },
        zoom: 12,
        primaryHazard: 'Periyar River Spillway Surge & Coastal Lagoon Flooding',
        currentAdvisory: 'PERIYAR BASIN ORANGE ALERT: LOWLAND WARNING',
        advisorySeverity: 'warning',
        readinessScore: 84,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    country: 'India',
    cities: [
      {
        id: 'kolkata',
        name: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        center: { lat: 22.5726, lng: 88.3639 },
        zoom: 12,
        primaryHazard: 'Hooghly River Tidal Bore & Sundarbans Cyclone Inflow',
        currentAdvisory: 'CYCLONIC STORM WATCH: HOOGHLY BORE INFLOW',
        advisorySeverity: 'warning',
        readinessScore: 83,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'digha',
        name: 'Digha',
        state: 'West Bengal',
        country: 'India',
        center: { lat: 21.6266, lng: 87.5074 },
        zoom: 12,
        primaryHazard: 'Sea Wall Erosion & Extreme Tidal Surge',
        currentAdvisory: 'TIDAL SURGE ALERT: SEA EMBANKMENT REINFORCED',
        advisorySeverity: 'critical',
        readinessScore: 81,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    country: 'India',
    cities: [
      {
        id: 'kutch',
        name: 'Kutch & Kandla',
        state: 'Gujarat',
        country: 'India',
        center: { lat: 23.0033, lng: 70.2185 },
        zoom: 12,
        primaryHazard: 'Arabian Sea Severe Cyclone Landfall & Port Sump Alert',
        currentAdvisory: 'CYCLONE SIGNAL 9: COMPLETE PORT ANCHORAGE EVACUATION',
        advisorySeverity: 'critical',
        readinessScore: 85,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'ahmedabad',
        name: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        center: { lat: 23.0225, lng: 72.5714 },
        zoom: 12,
        primaryHazard: 'Sabarmati River Discharge & Urban Inundation',
        currentAdvisory: 'RIVERFRONT WATCH: SLUICE GATES REGULATED',
        advisorySeverity: 'info',
        readinessScore: 88,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'florida-usa',
    name: 'Florida (USA)',
    country: 'United States',
    cities: [
      {
        id: 'miami',
        name: 'Miami',
        state: 'Florida (USA)',
        country: 'United States',
        center: { lat: 25.7617, lng: -80.1918 },
        zoom: 12,
        primaryHazard: 'Atlantic Category 4 Hurricane & King Tide Tidal Flooding',
        currentAdvisory: 'HURRICANE WARNING: MANDATORY EVACUATION ZONE A & B',
        advisorySeverity: 'critical',
        readinessScore: 91,
        zones: [
          {
            id: 'mia-z1',
            number: 1,
            name: 'Miami Beach Barrier Island & South Beach',
            readinessScore: 94,
            status: 'ready',
            pendingTaskCount: 1,
            officerName: 'Chief Marcus Vance',
            officerContact: '+1 (305) 555-0199',
            officerRole: 'Emergency Operations Director',
            coordinates: [25.7907, -80.13],
            populationAtRisk: 82000,
            shelterCount: 6,
            assetCount: 12,
            deptBreakdown: {},
          },
          {
            id: 'mia-z2',
            number: 2,
            name: 'Downtown Miami & Brickell Financial District',
            readinessScore: 88,
            status: 'ready',
            pendingTaskCount: 3,
            officerName: 'Director Elena Gomez',
            officerContact: '+1 (305) 555-0144',
            officerRole: 'City Flood Mitigation Marshal',
            coordinates: [25.7617, -80.1918],
            populationAtRisk: 110000,
            shelterCount: 8,
            assetCount: 15,
            deptBreakdown: {},
          },
        ],
        shelters: [
          {
            id: 'mia-s1',
            name: 'Miami Beach Convention Center Hurricane Shelter',
            zoneId: 'mia-z1',
            zoneName: 'Miami Beach',
            capacity: 6500,
            currentOccupancy: 1850,
            status: 'operational',
            coordinates: [25.794, -80.133],
            foodWaterStatus: 'Adequate',
            medicalSupport: true,
            generatorBackup: true,
            contactPerson: 'David Miller (FEMA Lead)',
            contactPhone: '+1 (305) 555-8822',
          },
        ],
        assets: [
          {
            id: 'mia-a1',
            qrId: 'FEMA-PUMP-X1',
            name: 'Hydraulic Mobile Flood Pump (24-inch discharge)',
            type: 'de-watering-pump',
            status: 'ready',
            department: 'Miami-Dade Stormwater',
            zoneId: 'mia-z2',
            zoneName: 'Brickell',
            location: 'Biscayne Bay Floodwall Station',
            coordinates: [25.758, -80.19],
            fuelLevel: 98,
            operatorName: 'Jason Hernandez',
            operatorContact: '+1 (305) 555-4321',
            lastMaintenance: formatLiveTimestamp(10),
            qrCodeUrl: '',
          },
        ],
        hotspots: [
          { id: 'mia-hs1', name: 'Biscayne Bay Tidal Storm Surge Inundation Sump', lat: 25.765, lng: -80.188, radius: 1100, severity: 'Extreme' },
        ],
        alerts: [
          {
            id: 'mia-alt1',
            title: 'Hurricane Storm Surge Cat 4 Warning',
            description: 'Major Hurricane tracking northwest with sustained winds of 145 mph. 9-13 ft storm surge forecast along Biscayne Bay.',
            zoneId: 'mia-z1',
            zoneName: 'Miami Beach',
            severity: 'critical',
            resolved: false,
            department: 'NOAA / FEMA',
            createdAt: formatLiveTimestamp(6),
          },
        ],
      },
      {
        id: 'tampa',
        name: 'Tampa',
        state: 'Florida (USA)',
        country: 'United States',
        center: { lat: 27.9506, lng: -82.4572 },
        zoom: 12,
        primaryHazard: 'Tampa Bay 12-15ft Storm Surge & Coastal Bay Inundation',
        currentAdvisory: 'STORM SURGE WARNING: LIFE-THREATENING FLOODING PREDICTED',
        advisorySeverity: 'critical',
        readinessScore: 89,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    cities: [
      {
        id: 'tokyo',
        name: 'Tokyo',
        state: 'Tokyo',
        country: 'Japan',
        center: { lat: 35.6762, lng: 139.6503 },
        zoom: 12,
        primaryHazard: 'Pacific Super Typhoon Surge & Metropolitan Seismic Readiness',
        currentAdvisory: 'TYPHOON ALERT LEVEL 4: SUMIDA RIVER FLOOD GATES SHUT',
        advisorySeverity: 'warning',
        readinessScore: 95,
        zones: [
          {
            id: 'tky-z1',
            number: 1,
            name: 'Tokyo Bay Coastal Gate & Odaiba Waterfront',
            readinessScore: 98,
            status: 'ready',
            pendingTaskCount: 0,
            officerName: 'Kenji Sato',
            officerContact: '+81 3-5321-1111',
            officerRole: 'Disaster Prevention Bureau Director',
            coordinates: [35.629, 139.776],
            populationAtRisk: 120000,
            shelterCount: 12,
            assetCount: 20,
            deptBreakdown: {},
          },
        ],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'philippines',
    name: 'Metro Manila',
    country: 'Philippines',
    cities: [
      {
        id: 'manila',
        name: 'Manila',
        state: 'Metro Manila',
        country: 'Philippines',
        center: { lat: 14.5995, lng: 120.9842 },
        zoom: 12,
        primaryHazard: 'Pacific Super Typhoon & Manila Bay Coastal Flooding',
        currentAdvisory: 'TYPHOON SIGNAL NO. 3: STORM SURGE ALERT IN MANILA BAY',
        advisorySeverity: 'critical',
        readinessScore: 81,
        zones: [
          {
            id: 'mnl-z1',
            number: 1,
            name: 'Roxas Boulevard & Manila Bay Coastal Sump',
            readinessScore: 82,
            status: 'ready',
            pendingTaskCount: 3,
            officerName: 'Col. Fernando Ramos',
            officerContact: '+63 2-8527-1111',
            officerRole: 'MDRRMC Operations Head',
            coordinates: [14.576, 120.981],
            populationAtRisk: 95000,
            shelterCount: 6,
            assetCount: 8,
            deptBreakdown: {},
          },
        ],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
];

const ADDITIONAL_GLOBAL_REGIONS: DisasterState[] = [
  {
    id: 'karnataka',
    name: 'Karnataka',
    country: 'India',
    cities: [
      {
        id: 'bengaluru',
        name: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 12,
        primaryHazard: 'Urban Storm Inundation & Bellandur Lake Spillway Overflow',
        currentAdvisory: 'URBAN FLOOD ALERT: HIGH RAINFALL RUNOFF MONITORING',
        advisorySeverity: 'warning',
        readinessScore: 84,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'mangaluru',
        name: 'Mangaluru',
        state: 'Karnataka',
        country: 'India',
        center: { lat: 12.9141, lng: 74.856 },
        zoom: 12,
        primaryHazard: 'Arabian Sea Coastal Surge & Netravati River Flood Warning',
        currentAdvisory: 'COASTAL STORM WARNING: HIGH SURGE ALERT ON HARBOR',
        advisorySeverity: 'critical',
        readinessScore: 81,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    country: 'India',
    cities: [
      {
        id: 'new-delhi',
        name: 'New Delhi',
        state: 'Delhi NCR',
        country: 'India',
        center: { lat: 28.6139, lng: 77.209 },
        zoom: 12,
        primaryHazard: 'Yamuna River Overflow & Low-Lying Floodplain Inundation',
        currentAdvisory: 'YAMUNA SPATE WATCH: WATER LEVEL CROSSES DANGER MARK (205.53m)',
        advisorySeverity: 'critical',
        readinessScore: 86,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'california-usa',
    name: 'California',
    country: 'United States',
    cities: [
      {
        id: 'los-angeles',
        name: 'Los Angeles',
        state: 'California',
        country: 'United States',
        center: { lat: 34.0522, lng: -118.2437 },
        zoom: 12,
        primaryHazard: 'Atmospheric River Storm & Pacific Coastal Debris Flows',
        currentAdvisory: 'ATMOSPHERIC RIVER ALERT: FLASH FLOOD WATCH & HILLSIDE EVACUATION',
        advisorySeverity: 'critical',
        readinessScore: 92,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'san-francisco',
        name: 'San Francisco',
        state: 'California',
        country: 'United States',
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        primaryHazard: 'San Francisco Bay King Tide Storm Surge & Seismic Flood Gate Alert',
        currentAdvisory: 'BAY SURGE ADVISORY: EMBARCADERO PUMP STATIONS ENGAGED',
        advisorySeverity: 'warning',
        readinessScore: 94,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'texas-usa',
    name: 'Texas',
    country: 'United States',
    cities: [
      {
        id: 'houston',
        name: 'Houston',
        state: 'Texas',
        country: 'United States',
        center: { lat: 29.7604, lng: -95.3698 },
        zoom: 12,
        primaryHazard: 'Gulf Coast Severe Hurricane & Buffalo Bayou Surge Overflow',
        currentAdvisory: 'HURRICANE WATCH: BUFFALO BAYOU FLOOD GATES MONITORED',
        advisorySeverity: 'critical',
        readinessScore: 89,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'galveston',
        name: 'Galveston',
        state: 'Texas',
        country: 'United States',
        center: { lat: 29.3013, lng: -94.7977 },
        zoom: 12,
        primaryHazard: 'Gulf of Mexico Category 4 Storm Surge & Seawall Inundation',
        currentAdvisory: 'COASTAL STORM WARNING: BARRIER ISLAND HIGH SURGE ALERT',
        advisorySeverity: 'critical',
        readinessScore: 86,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'new-york-usa',
    name: 'New York',
    country: 'United States',
    cities: [
      {
        id: 'new-york-city',
        name: 'New York City',
        state: 'New York',
        country: 'United States',
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
        primaryHazard: 'Atlantic Nor’easter Surge & Lower Manhattan Subway Inundation',
        currentAdvisory: 'STORM SURGE WARNING: LOWER MANHATTAN FLOOD GATES CLOSED',
        advisorySeverity: 'critical',
        readinessScore: 93,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'louisiana-usa',
    name: 'Louisiana',
    country: 'United States',
    cities: [
      {
        id: 'new-orleans',
        name: 'New Orleans',
        state: 'Louisiana',
        country: 'United States',
        center: { lat: 29.9511, lng: -90.0715 },
        zoom: 12,
        primaryHazard: 'Mississippi River Surge & Lake Pontchartrain Levee Breach Risk',
        currentAdvisory: 'PUMP STATION WATCH: 24/7 LEVEE OVERFLOW PATROL ACTIVATED',
        advisorySeverity: 'critical',
        readinessScore: 88,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'osaka-japan',
    name: 'Osaka',
    country: 'Japan',
    cities: [
      {
        id: 'osaka',
        name: 'Osaka',
        state: 'Osaka',
        country: 'Japan',
        center: { lat: 34.6937, lng: 135.5023 },
        zoom: 12,
        primaryHazard: 'Osaka Bay Super Typhoon Surge & Yodo River Flood Defenses',
        currentAdvisory: 'TYPHOON WARNING: UNDERGROUND SUMP GATES DEPLOYED',
        advisorySeverity: 'warning',
        readinessScore: 96,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'central-visayas-ph',
    name: 'Central Visayas',
    country: 'Philippines',
    cities: [
      {
        id: 'cebu-city',
        name: 'Cebu City',
        state: 'Central Visayas',
        country: 'Philippines',
        center: { lat: 10.3157, lng: 123.8854 },
        zoom: 12,
        primaryHazard: 'Visayan Sea Typhoon Surge & Coastal Inundation Corridor',
        currentAdvisory: 'TYPHOON SIGNAL NO. 2: MARITIME TRAFFIC SUSPENDED',
        advisorySeverity: 'critical',
        readinessScore: 82,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'greater-london-uk',
    name: 'Greater London',
    country: 'United Kingdom',
    cities: [
      {
        id: 'london',
        name: 'London',
        state: 'Greater London',
        country: 'United Kingdom',
        center: { lat: 51.5074, lng: -0.1278 },
        zoom: 12,
        primaryHazard: 'North Sea Tidal Surge & River Thames Estuary Spill',
        currentAdvisory: 'THAMES BARRIER CLOSED: FLOOD RISK LEVEL 3 DEFENSE ENGAGED',
        advisorySeverity: 'warning',
        readinessScore: 95,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'queensland-au',
    name: 'Queensland',
    country: 'Australia',
    cities: [
      {
        id: 'brisbane',
        name: 'Brisbane',
        state: 'Queensland',
        country: 'Australia',
        center: { lat: -27.4698, lng: 153.0251 },
        zoom: 12,
        primaryHazard: 'Brisbane River Extreme Flash Flooding & Coral Sea Tropical Low',
        currentAdvisory: 'MAJOR FLOOD WARNING: WIVENHOE DAM REGULATED SPURT',
        advisorySeverity: 'critical',
        readinessScore: 90,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'cairns',
        name: 'Cairns',
        state: 'Queensland',
        country: 'Australia',
        center: { lat: -16.9186, lng: 145.7781 },
        zoom: 12,
        primaryHazard: 'Coral Sea Category 4 Tropical Cyclone Coastal Strike',
        currentAdvisory: 'CYCLONE EMERGENCY: TRINITY INLET EVACUATION IN FORCE',
        advisorySeverity: 'critical',
        readinessScore: 88,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'nsw-au',
    name: 'New South Wales',
    country: 'Australia',
    cities: [
      {
        id: 'sydney',
        name: 'Sydney',
        state: 'New South Wales',
        country: 'Australia',
        center: { lat: -33.8688, lng: 151.2093 },
        zoom: 12,
        primaryHazard: 'East Coast Low Severe Maritime Gale & Hawkesbury River Flooding',
        currentAdvisory: 'EAST COAST LOW: SEVERE WEATHER & FLASH FLOOD WATCH',
        advisorySeverity: 'warning',
        readinessScore: 92,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'bc-canada',
    name: 'British Columbia',
    country: 'Canada',
    cities: [
      {
        id: 'vancouver',
        name: 'Vancouver',
        state: 'British Columbia',
        country: 'Canada',
        center: { lat: 49.2827, lng: -123.1207 },
        zoom: 12,
        primaryHazard: 'Fraser River Spring Freshet Flood & Pacific Atmospheric River',
        currentAdvisory: 'ATMOSPHERIC RIVER ALERT: SEA DIKE REINFORCEMENTS ACTIVE',
        advisorySeverity: 'warning',
        readinessScore: 93,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'chittagong-bd',
    name: 'Chittagong Division',
    country: 'Bangladesh',
    cities: [
      {
        id: 'chittagong',
        name: 'Chittagong',
        state: 'Chittagong Division',
        country: 'Bangladesh',
        center: { lat: 22.3569, lng: 91.7832 },
        zoom: 12,
        primaryHazard: 'Bay of Bengal Super Cyclone Landfall & Karnaphuli Tidal Surge',
        currentAdvisory: 'GREAT DANGER SIGNAL 10: MASS EVACUATION TO CYCLONE SHELTERS',
        advisorySeverity: 'critical',
        readinessScore: 78,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
      {
        id: 'coxs-bazar',
        name: "Cox's Bazar",
        state: 'Chittagong Division',
        country: 'Bangladesh',
        center: { lat: 21.4272, lng: 92.0058 },
        zoom: 12,
        primaryHazard: 'Severe Coastal Sea Inundation & Vulnerable Coastal Encampments',
        currentAdvisory: 'CYCLONE WARNING: RED CRESCENT SEARCH & RESCUE MOBILIZED',
        advisorySeverity: 'critical',
        readinessScore: 75,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
  {
    id: 'dhaka-bd',
    name: 'Dhaka Division',
    country: 'Bangladesh',
    cities: [
      {
        id: 'dhaka',
        name: 'Dhaka',
        state: 'Dhaka Division',
        country: 'Bangladesh',
        center: { lat: 23.8103, lng: 90.4125 },
        zoom: 12,
        primaryHazard: 'Buriganga River Inundation & Metropolitan Drainage Congestion',
        currentAdvisory: 'MONSOON FLOOD ALERT: HIGH-CAPACITY PUMPS AT MAXIMUM DEPLOYMENT',
        advisorySeverity: 'warning',
        readinessScore: 76,
        zones: [],
        shelters: [],
        assets: [],
        hotspots: [],
        alerts: [],
      },
    ],
  },
];

// Enricher that ensures every city has rich tactical zones, shelters, assets, hotspots & alerts
function enrichCity(city: DisasterCity): DisasterCity {
  const cLat = city.center.lat;
  const cLng = city.center.lng;

  const zones: Zone[] =
    city.zones && city.zones.length > 0
      ? city.zones
      : [
          {
            id: `${city.id}-z1`,
            number: 1,
            name: `${city.name} Central & Coastal/Riverfront Sump Zone`,
            readinessScore: Math.min(100, Math.max(50, city.readinessScore + 4)),
            status: 'ready' as const,
            pendingTaskCount: 1,
            officerName: 'Senior Zonal Operations Marshal',
            officerContact: '+1 800-RECQ-01',
            officerRole: 'Zonal Incident Marshal',
            coordinates: [Number((cLat + 0.012).toFixed(4)), Number((cLng - 0.012).toFixed(4))],
            populationAtRisk: 48000,
            shelterCount: 4,
            assetCount: 6,
            deptBreakdown: {},
          },
        ];

  const primaryZoneId = zones[0]?.id || `${city.id}-z1`;
  const primaryZoneName = zones[0]?.name || `${city.name} Central Zone`;
  const secondaryZoneId = zones[1]?.id || primaryZoneId;
  const secondaryZoneName = zones[1]?.name || primaryZoneName;
  const validZoneIds = new Set(zones.map((z) => z.id));

  const defaultShelters: Shelter[] = [
    {
      id: `${city.id}-s1`,
      name: `${city.name} Municipal Disaster Relief Center & Stadium`,
      zoneId: primaryZoneId,
      zoneName: primaryZoneName,
      capacity: 3500,
      currentOccupancy: 420,
      status: 'operational',
      address: `${city.name} Municipal Disaster Relief Complex & Pavilion`,
      coordinates: [Number((cLat + 0.008).toFixed(4)), Number((cLng - 0.006).toFixed(4))],
      foodWaterStatus: 'Adequate',
      medicalSupport: true,
      generatorBackup: true,
      contactPerson: 'Relief Center Administrator',
      contactPhone: '+1 800-SHELTER-1',
      amenities: {
        water: true,
        electricity: true,
        backupPower: true,
        foodSupplies: true,
        medicalKit: true,
        toilets: true,
      },
    },
    {
      id: `${city.id}-s2`,
      name: `${city.name} Community High School Relief Shelter`,
      zoneId: secondaryZoneId,
      zoneName: secondaryZoneName,
      capacity: 2200,
      currentOccupancy: 310,
      status: 'operational',
      address: `${city.name} Main Sector High School Campus`,
      coordinates: [Number((cLat - 0.01).toFixed(4)), Number((cLng + 0.011).toFixed(4))],
      foodWaterStatus: 'Adequate',
      medicalSupport: true,
      generatorBackup: true,
      contactPerson: 'Relief Logistics Coordinator',
      contactPhone: '+1 800-SHELTER-2',
      amenities: {
        water: true,
        electricity: true,
        backupPower: true,
        foodSupplies: true,
        medicalKit: true,
        toilets: true,
      },
    },
  ];

  const rawShelters = city.shelters && city.shelters.length > 0 ? city.shelters : defaultShelters;
  const shelters: Shelter[] = rawShelters.map((sh) => {
    if (!validZoneIds.has(sh.zoneId)) {
      return { ...sh, zoneId: primaryZoneId, zoneName: primaryZoneName };
    }
    return sh;
  });

  const defaultAssets: Asset[] = [
    {
      id: `${city.id}-a1`,
      qrId: `QR-${city.id.slice(0, 3).toUpperCase()}-PUMP-01`,
      name: 'High-Volume Heavy Dewatering Pump (120 HP)',
      type: 'de-watering-pump',
      status: 'ready',
      zoneId: primaryZoneId,
      zoneName: primaryZoneName,
      location: `${city.name} Low-Lying Drainage Outfall`,
      department: 'Drainage & Irrigation',
      operator: 'Er. P. Ramanathan',
      operatorName: 'Er. P. Ramanathan',
      operatorContact: '+1 800-ASSET-01',
      coordinates: [Number((cLat + 0.006).toFixed(4)), Number((cLng - 0.008).toFixed(4))],
      fuelLevel: 88,
      lastInspectionDate: 'Yesterday',
      maintenanceHistory: [],
    },
    {
      id: `${city.id}-a2`,
      qrId: `QR-${city.id.slice(0, 3).toUpperCase()}-GEN-01`,
      name: 'Mobile Backup Diesel Generator (250 kVA)',
      type: 'generator',
      status: 'ready',
      zoneId: primaryZoneId,
      zoneName: primaryZoneName,
      location: `${city.name} Command & Relief HQ`,
      department: 'Electrical Engineering',
      operator: 'Tech. S. Narayanan',
      operatorName: 'Tech. S. Narayanan',
      operatorContact: '+1 800-ASSET-02',
      coordinates: [Number((cLat + 0.01).toFixed(4)), Number((cLng + 0.005).toFixed(4))],
      fuelLevel: 94,
      lastInspectionDate: 'Today',
      maintenanceHistory: [],
    },
    {
      id: `${city.id}-a3`,
      qrId: `QR-${city.id.slice(0, 3).toUpperCase()}-BOAT-01`,
      name: 'Rapid Deployment Flood Rescue Zodiac Boat',
      type: 'rescue-boat',
      status: 'ready',
      zoneId: secondaryZoneId,
      zoneName: secondaryZoneName,
      location: `${city.name} Waterways Boat Launch`,
      department: 'Disaster Response Force',
      operator: 'Officer M. Kulkarni',
      operatorName: 'Officer M. Kulkarni',
      operatorContact: '+1 800-ASSET-03',
      coordinates: [Number((cLat - 0.008).toFixed(4)), Number((cLng - 0.012).toFixed(4))],
      fuelLevel: 100,
      lastInspectionDate: 'Today',
      maintenanceHistory: [],
    },
    {
      id: `${city.id}-a4`,
      qrId: `QR-${city.id.slice(0, 3).toUpperCase()}-AMB-01`,
      name: 'Advanced Life Support Emergency Ambulance ALS-01',
      type: 'ambulance',
      status: 'ready',
      zoneId: secondaryZoneId,
      zoneName: secondaryZoneName,
      location: `${city.name} General Hospital Trauma Care`,
      department: 'Public Health',
      operator: 'Dr. Anita Roy',
      operatorName: 'Dr. Anita Roy',
      operatorContact: '+1 800-ASSET-04',
      coordinates: [Number((cLat + 0.004).toFixed(4)), Number((cLng + 0.014).toFixed(4))],
      fuelLevel: 92,
      lastInspectionDate: 'Today',
      maintenanceHistory: [],
    },
  ];

  const rawAssets = city.assets && city.assets.length > 0 ? city.assets : defaultAssets;
  const assets: Asset[] = rawAssets.map((ast) => {
    if (!validZoneIds.has(ast.zoneId)) {
      return { ...ast, zoneId: primaryZoneId, zoneName: primaryZoneName };
    }
    return ast;
  });

  const hotspots =
    city.hotspots && city.hotspots.length > 0
      ? city.hotspots
      : [
          {
            id: `${city.id}-hs-1`,
            name: `${city.name} Low-Lying Tidal Drainage Basin`,
            lat: Number((cLat + 0.005).toFixed(4)),
            lng: Number((cLng - 0.007).toFixed(4)),
            radius: 650,
            severity: 'Critical',
          },
          {
            id: `${city.id}-hs-2`,
            name: `${city.name} Coastal / River Inundation Corridor`,
            lat: Number((cLat - 0.009).toFixed(4)),
            lng: Number((cLng + 0.01).toFixed(4)),
            radius: 750,
            severity: 'High',
          },
        ];

  const defaultAlerts: AlertItem[] = [
    {
      id: `${city.id}-alt-1`,
      severity: city.advisorySeverity || 'critical',
      title: city.currentAdvisory,
      description: `${city.primaryHazard} in effect across ${city.name}. Response units and rescue brigades on active standby.`,
      department: 'Disaster Cell & Comms',
      timestamp: formatLiveTimestamp(10),
      zoneId: primaryZoneId,
      zoneName: primaryZoneName,
      resolved: false,
    },
  ];

  const rawAlerts = city.alerts && city.alerts.length > 0 ? city.alerts : defaultAlerts;
  const alerts: AlertItem[] = rawAlerts.map((alt) => {
    if (!validZoneIds.has(alt.zoneId)) {
      return { ...alt, zoneId: primaryZoneId, zoneName: primaryZoneName };
    }
    return alt;
  });

  return {
    ...city,
    zones,
    shelters,
    assets,
    hotspots,
    alerts,
  };
}

function enrichDisasterRegions(states: DisasterState[]): DisasterState[] {
  return states.map((state) => ({
    ...state,
    cities: state.cities.map((rawCity) => {
      const city = enrichCity(rawCity);
      return {
        ...city,
        state: state.name,
        country: state.country,
        zones: (city.zones || []).map((z) => ({
          ...z,
          cityId: city.id,
          cityName: city.name,
          stateId: state.id,
          stateName: state.name,
          country: state.country,
        })),
        shelters: (city.shelters || []).map((s) => ({
          ...s,
          address: s.address || (s.name ? `${s.name}, ${city.name}` : `Relief Center, ${city.name}`),
          contactPerson: s.contactPerson || 'Relief Officer Incharge',
          contactPhone: s.contactPhone || '+91 1070',
          amenities: {
            water: s.amenities?.water ?? true,
            electricity: s.amenities?.electricity ?? true,
            backupPower: s.amenities?.backupPower ?? (s.generatorBackup !== undefined ? !!s.generatorBackup : true),
            foodSupplies: s.amenities?.foodSupplies ?? true,
            medicalKit: s.amenities?.medicalKit ?? (s.medicalSupport !== undefined ? !!s.medicalSupport : true),
            toilets: s.amenities?.toilets ?? true,
            ...(s.amenities || {}),
          },
          cityId: city.id,
          cityName: city.name,
          stateId: state.id,
          stateName: state.name,
          country: state.country,
        })),
        assets: (city.assets || []).map((a) => ({
          ...a,
          cityId: city.id,
          cityName: city.name,
          stateId: state.id,
          stateName: state.name,
          country: state.country,
        })),
        alerts: (city.alerts || []).map((al) => ({
          ...al,
          cityId: city.id,
          cityName: city.name,
          stateId: state.id,
          stateName: state.name,
          country: state.country,
        })),
      };
    }),
  }));
}

// Global Disaster Regions with rich data for every single jurisdiction
export const GLOBAL_DISASTER_REGIONS: DisasterState[] = enrichDisasterRegions([
  ...RAW_DISASTER_REGIONS,
  ...ADDITIONAL_GLOBAL_REGIONS,
]);

// Get all baseline zones across all regions
export function getAllZones(): Zone[] {
  const list: Zone[] = [];
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      if (c.zones && c.zones.length > 0) {
        for (const z of c.zones) {
          list.push(z);
        }
      }
    }
  }
  return list;
}

// Get all baseline shelters across all regions
export function getAllShelters(): Shelter[] {
  const list: Shelter[] = [];
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      if (c.shelters && c.shelters.length > 0) {
        for (const sh of c.shelters) {
          list.push(sh);
        }
      }
    }
  }
  return list;
}

// Get all baseline assets across all regions
export function getAllAssets(): Asset[] {
  const list: Asset[] = [];
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      if (c.assets && c.assets.length > 0) {
        for (const a of c.assets) {
          list.push(a);
        }
      }
    }
  }
  return list;
}

// Get all baseline alerts across all regions
export function getAllAlerts(): AlertItem[] {
  const list: AlertItem[] = [];
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      if (c.alerts && c.alerts.length > 0) {
        for (const al of c.alerts) {
          list.push(al);
        }
      }
    }
  }
  return list;
}

// Helper to look up zone location metadata
export function getZoneLocationMeta(zoneId: string): {
  cityId: string;
  cityName: string;
  stateId: string;
  stateName: string;
  country: string;
} {
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      if (c.zones && c.zones.some((z) => z.id === zoneId)) {
        return {
          cityId: c.id,
          cityName: c.name,
          stateId: s.id,
          stateName: s.name,
          country: s.country,
        };
      }
      if (zoneId.startsWith(`${c.id}-`)) {
        return {
          cityId: c.id,
          cityName: c.name,
          stateId: s.id,
          stateName: s.name,
          country: s.country,
        };
      }
    }
  }
  return {
    cityId: 'visakhapatnam',
    cityName: 'Visakhapatnam',
    stateId: 'andhra-pradesh',
    stateName: 'Andhra Pradesh',
    country: 'India',
  };
}

// Helper to look up a city by id across all regions
export function findCityById(cityId: string): DisasterCity | undefined {
  for (const s of GLOBAL_DISASTER_REGIONS) {
    const found = s.cities.find((c) => c.id === cityId);
    if (found) return found;
  }
  return undefined;
}

// Helper to look up parent state by city id
export function findStateByCityId(cityId: string): DisasterState | undefined {
  for (const s of GLOBAL_DISASTER_REGIONS) {
    if (s.cities.some((c) => c.id === cityId)) {
      return s;
    }
  }
  return undefined;
}

// Helper to look up country by city id
export function findCountryByCityId(cityId: string): string | undefined {
  const state = findStateByCityId(cityId);
  return state?.country;
}

// Get all unique countries across all regions
export function getAllCountries(): string[] {
  const set = new Set<string>();
  for (const s of GLOBAL_DISASTER_REGIONS) {
    if (s.country) set.add(s.country);
  }
  return Array.from(set);
}

// Get states for a specific country ('all' or undefined returns all states)
export function getStatesForCountry(country?: string): DisasterState[] {
  if (!country || country === 'all') return GLOBAL_DISASTER_REGIONS;
  return GLOBAL_DISASTER_REGIONS.filter(
    (s) => s.country.toLowerCase() === country.toLowerCase()
  );
}

// Get all cities globally (flattened)
export function getAllCities(): DisasterCity[] {
  const list: DisasterCity[] = [];
  for (const s of GLOBAL_DISASTER_REGIONS) {
    for (const c of s.cities) {
      list.push(c);
    }
  }
  return list;
}

// Get filtered cities by country and/or state
export function getFilteredCities(country?: string, stateId?: string): DisasterCity[] {
  let states = GLOBAL_DISASTER_REGIONS;
  if (country && country !== 'all') {
    states = states.filter((s) => s.country.toLowerCase() === country.toLowerCase());
  }
  if (stateId && stateId !== 'all') {
    states = states.filter((s) => s.id === stateId);
  }
  const list: DisasterCity[] = [];
  for (const s of states) {
    for (const c of s.cities) {
      list.push(c);
    }
  }
  return list;
}

// Default initial state and city
export const DEFAULT_STATE_ID = 'andhra-pradesh';
export const DEFAULT_CITY_ID = 'visakhapatnam';


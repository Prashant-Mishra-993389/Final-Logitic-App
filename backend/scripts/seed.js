/*
  Seed script for:
  - Category
  - Subcategory
  - RequirementFieldTemplate
  - ServiceTemplate
  - AMCPlan

  Run example:
  node seed/industrial.seed.js

  Env required:
  - MONGO_URI
  - SEED_ADMIN_ID   (ObjectId of an admin user for Category.createdBy)

  Notes:
  - This script clears existing catalog data before seeding.
  - It uses stable slugs and key-based mapping so references stay clean.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const RequirementFieldTemplate = require('../models/RequirementFieldTemplate');
const ServiceTemplate = require('../models/ServiceTemplate');
const AMCPlan = require('../models/AMCPlan');

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_ID = process.env.SEED_ADMIN_ID;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is required');
}

if (!ADMIN_ID || !mongoose.Types.ObjectId.isValid(ADMIN_ID)) {
  throw new Error('SEED_ADMIN_ID must be a valid User ObjectId');
}

const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pickRequiredFields = (requirements) =>
  requirements
    .filter((r) => r.isActive !== false)
    .slice(0, 8)
    .map((r) => ({
      fieldKey: r.fieldKey,
      label: r.label,
      fieldType: r.fieldType,
      required: r.required,
      options: r.options || [],
      unit: r.unit || ''
    }));

const baseReq = {
  customerName: {
    label: 'Customer Name',
    fieldKey: 'customerName',
    fieldType: 'text',
    required: true,
    placeholder: 'Enter customer name',
    helpText: 'Name of the person or company requesting service'
  },
  waterQuality: {
  label: 'Water Quality',
  fieldKey: 'waterQuality',
  fieldType: 'select',
  required: false,
  options: ['Good', 'Moderate', 'Poor', 'Unknown'],
  helpText: 'Quality of water used in system'
},
  siteAddress: {
    label: 'Site Address',
    fieldKey: 'siteAddress',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Enter complete site address',
    helpText: 'Exact service location'
  },
  contactNumber: {
    label: 'Contact Number',
    fieldKey: 'contactNumber',
    fieldType: 'text',
    required: true,
    placeholder: '10-digit mobile number',
    helpText: 'Primary contact number'
  },
  brand: {
    label: 'Brand',
    fieldKey: 'brand',
    fieldType: 'text',
    required: false,
    placeholder: 'Product brand',
    helpText: 'Equipment or system brand'
  },
  modelNumber: {
    label: 'Model Number',
    fieldKey: 'modelNumber',
    fieldType: 'text',
    required: false,
    placeholder: 'Model / series number',
    helpText: 'Model identifier if available'
  },
  quantity: {
    label: 'Quantity',
    fieldKey: 'quantity',
    fieldType: 'number',
    required: true,
    placeholder: '1',
    helpText: 'Number of units / points',
    min: 1,
    unit: 'nos'
  },
  urgency: {
    label: 'Urgency',
    fieldKey: 'urgency',
    fieldType: 'select',
    required: true,
    placeholder: 'Choose urgency',
    options: ['Low', 'Normal', 'High', 'Critical'],
    helpText: 'Defines service priority'
  },
  issueDescription: {
    label: 'Issue Description',
    fieldKey: 'issueDescription',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Describe the issue',
    helpText: 'Problem statement from customer'
  },
  voltage: {
    label: 'Operating Voltage',
    fieldKey: 'voltage',
    fieldType: 'select',
    required: false,
    options: ['230V', '415V', '440V', '690V', 'Other'],
    helpText: 'Input / operating voltage'
  },
  capacity: {
    label: 'Capacity',
    fieldKey: 'capacity',
    fieldType: 'number',
    required: false,
    placeholder: 'Capacity value',
    helpText: 'Rated capacity of the equipment',
    unit: ''
  },
  phase: {
    label: 'Phase',
    fieldKey: 'phase',
    fieldType: 'select',
    required: false,
    options: ['Single Phase', 'Three Phase'],
    helpText: 'Electrical phase configuration'
  },
  installationType: {
    label: 'Installation Type',
    fieldKey: 'installationType',
    fieldType: 'select',
    required: false,
    options: ['Indoor', 'Outdoor', 'Mixed'],
    helpText: 'Deployment environment'
  },
  serviceType: {
    label: 'Service Type',
    fieldKey: 'serviceType',
    fieldType: 'select',
    required: true,
    options: ['Inspection', 'Installation', 'Maintenance', 'Repair', 'AMC'],
    helpText: 'Type of service required'
  },
  warrantyStatus: {
    label: 'Warranty Status',
    fieldKey: 'warrantyStatus',
    fieldType: 'select',
    required: false,
    options: ['In Warranty', 'Out of Warranty', 'Unknown'],
    helpText: 'Warranty coverage status'
  },
  assetTag: {
    label: 'Asset Tag',
    fieldKey: 'assetTag',
    fieldType: 'text',
    required: false,
    placeholder: 'Asset / serial tag',
    helpText: 'Tag or inventory ID'
  },
  pictures: {
    label: 'Reference Photos',
    fieldKey: 'pictures',
    fieldType: 'file',
    required: false,
    helpText: 'Upload photos if available'
  },
  preferredDate: {
    label: 'Preferred Date',
    fieldKey: 'preferredDate',
    fieldType: 'date',
    required: false,
    helpText: 'Preferred service date'
  },
  warrantyPeriod: {
    label: 'Warranty Period',
    fieldKey: 'warrantyPeriod',
    fieldType: 'number',
    required: false,
    min: 0,
    unit: 'months',
    helpText: 'Warranty duration in months'
  },
  remarks: {
    label: 'Remarks',
    fieldKey: 'remarks',
    fieldType: 'textarea',
    required: false,
    placeholder: 'Any extra details',
    helpText: 'Optional notes'
  },
  locationType: {
    label: 'Location Type',
    fieldKey: 'locationType',
    fieldType: 'select',
    required: false,
    options: ['Residential', 'Commercial', 'Industrial', 'Institutional'],
    helpText: 'Site category'
  },
  powerRating: {
    label: 'Power Rating',
    fieldKey: 'powerRating',
    fieldType: 'number',
    required: false,
    unit: 'kW',
    helpText: 'Power rating of equipment'
  },
  panelCount: {
    label: 'Panel Count',
    fieldKey: 'panelCount',
    fieldType: 'number',
    required: false,
    min: 0,
    unit: 'nos',
    helpText: 'Number of panels / units'
  },
  zone: {
    label: 'Zone / Area',
    fieldKey: 'zone',
    fieldType: 'text',
    required: false,
    placeholder: 'Zone / floor / area',
    helpText: 'Service area within site'
  },
  make: {
    label: 'Make / OEM',
    fieldKey: 'make',
    fieldType: 'text',
    required: false,
    placeholder: 'OEM / make',
    helpText: 'Original equipment manufacturer'
  }
};

const catalog = [
  {
    key: 'hvac',
    name: 'HVAC & Climate Control',
    icon: 'ac-unit',
    description: 'Cooling, ventilation, and climate systems for commercial and industrial sites.',
    isLogistics: false,
    sortOrder: 1,
    subcategories: [
      {
        key: 'vrf-ac',
        name: 'VRF / VRV Air Conditioning',
        description: 'Variable refrigerant flow systems for premium buildings.',
        priceMin: 2500,
        priceMax: 25000,
        slaHours: 24,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.brand,
          baseReq.modelNumber,
          baseReq.quantity,
          baseReq.urgency,
          { ...baseReq.capacity, label: 'Cooling Capacity', fieldKey: 'coolingCapacity', required: true, unit: 'TR' }
        ],
        service: {
          title: 'VRF System Service',
          description: 'Inspection, troubleshooting, and periodic maintenance for VRF/VRV systems.',
          pricingType: 'quote_based',
          includes: ['Indoor unit check', 'Outdoor unit inspection', 'Gas pressure check', 'Drainage cleaning'],
          excludes: ['Major spare parts', 'Pipe replacement', 'Structural civil work'],
          estimatedDurationMins: 180
        }
      },
      {
        key: 'split-ac',
        name: 'Split AC',
        description: 'Wall mounted and cassette split units.',
        priceMin: 800,
        priceMax: 6000,
        slaHours: 24,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.brand,
          baseReq.modelNumber,
          baseReq.quantity,
          baseReq.issueDescription,
          baseReq.preferredDate
        ],
        service: {
          title: 'Split AC Service',
          description: 'Cleaning, repair, installation, and gas check for split AC units.',
          pricingType: 'fixed',
          basePrice: 1499,
          includes: ['Filter cleaning', 'Indoor unit cleaning', 'Drain check', 'Cooling performance test'],
          excludes: ['Compressor replacement', 'Copper piping replacement', 'PCB replacement'],
          estimatedDurationMins: 90
        }
      },
      {
        key: 'ductable-ac',
        name: 'Ductable AC',
        description: 'Ducted climate systems for commercial spaces.',
        priceMin: 2500,
        priceMax: 18000,
        slaHours: 24,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.brand,
          baseReq.modelNumber,
          baseReq.phase,
          baseReq.capacity,
          baseReq.urgency
        ],
        service: {
          title: 'Ductable AC AMC',
          description: 'Preventive maintenance and breakdown support for ductable systems.',
          pricingType: 'quote_based',
          includes: ['Filter replacement check', 'Blower inspection', 'Duct leakage inspection', 'Electrical tightening'],
          excludes: ['Duct fabrication', 'Major sheet metal work', 'Compressor overhaul'],
          estimatedDurationMins: 120
        }
      },
      {
        key: 'chiller',
        name: 'Chiller Systems',
        description: 'Water-cooled and air-cooled chillers.',
        priceMin: 5000,
        priceMax: 50000,
        slaHours: 48,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.brand,
          baseReq.modelNumber,
          baseReq.capacity,
          baseReq.powerRating,
          baseReq.issueDescription
        ],
        service: {
          title: 'Chiller Service Contract',
          description: 'Scheduled servicing and emergency support for chillers.',
          pricingType: 'quote_based',
          includes: ['Condenser inspection', 'Evaporator cleaning', 'Pump check', 'Control panel review'],
          excludes: ['Tube replacement', 'Major refrigerant refill', 'Chiller relocation'],
          estimatedDurationMins: 240
        }
      },
      {
        key: 'ahu',
        name: 'AHU / Ventilation',
        description: 'Air handling units, exhaust, and fresh air systems.',
        priceMin: 1500,
        priceMax: 12000,
        slaHours: 24,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.quantity,
          baseReq.serviceType,
          baseReq.installationType,
          baseReq.issueDescription,
          baseReq.pictures
        ],
        service: {
          title: 'AHU Maintenance',
          description: 'Regular upkeep for AHU and ventilation equipment.',
          pricingType: 'fixed',
          basePrice: 2499,
          includes: ['Fan belt check', 'Filter cleaning', 'Motor inspection', 'Vibration check'],
          excludes: ['Motor rewinding', 'Full duct replacement', 'Civil repairs'],
          estimatedDurationMins: 120
        }
      },
      {
        key: 'cooling-tower',
        name: 'Cooling Tower',
        description: 'Cooling towers, pumps, and water circulation systems.',
        priceMin: 3000,
        priceMax: 22000,
        slaHours: 48,
        requirements: [
          baseReq.customerName,
          baseReq.siteAddress,
          baseReq.contactNumber,
          baseReq.brand,
          baseReq.modelNumber,
          baseReq.waterQuality,
          baseReq.quantity,
          baseReq.remarks
        ],
        service: {
          title: 'Cooling Tower AMC',
          description: 'Water treatment, cleaning, and mechanical upkeep for cooling towers.',
          pricingType: 'quote_based',
          includes: ['Basin cleaning', 'Nozzle inspection', 'Fan check', 'Motor lubrication'],
          excludes: ['Fiber replacement', 'Structural repair', 'Major motor replacement'],
          estimatedDurationMins: 180
        }
      }
    ]
  },
  {
    key: 'electrical',
    name: 'Electrical Distribution',
    icon: 'electrical_services',
    description: 'Panels, switchgear, protection systems, and power distribution.',
    isLogistics: false,
    sortOrder: 2,
    subcategories: [
      {
        key: 'lt-panel',
        name: 'LT Panel',
        description: 'Low tension panels for industrial and commercial loads.',
        priceMin: 3000,
        priceMax: 28000,
        slaHours: 24,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.phase, baseReq.capacity, baseReq.remarks],
        service: { title: 'LT Panel Service', description: 'Inspection and corrective maintenance of LT panels.', pricingType: 'quote_based', includes: ['Thermal scan', 'Tightening', 'Contact cleaning', 'Protection relay check'], excludes: ['Busbar replacement', 'Breaker replacement', 'Panel fabrication'], estimatedDurationMins: 180 }
      },
      {
        key: 'ht-panel',
        name: 'HT Panel',
        description: 'High tension panel systems.',
        priceMin: 8000,
        priceMax: 45000,
        slaHours: 48,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.voltage, baseReq.issueDescription, baseReq.urgency],
        service: { title: 'HT Panel Service', description: 'High voltage panel inspection and support.', pricingType: 'quote_based', includes: ['Insulation inspection', 'Breaker test', 'Relay calibration', 'Earthing check'], excludes: ['Major equipment replacement', 'Cable laying', 'Utility approvals'], estimatedDurationMins: 240 }
      },
      {
        key: 'mcc-panel',
        name: 'MCC Panel',
        description: 'Motor control center panels.',
        priceMin: 2500,
        priceMax: 20000,
        slaHours: 24,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.make, baseReq.modelNumber, baseReq.quantity, baseReq.phase, baseReq.issueDescription],
        service: { title: 'MCC Panel AMC', description: 'Regular support for motor control centers.', pricingType: 'quote_based', includes: ['Contactor check', 'Overload relay test', 'Wiring inspection', 'Heat check'], excludes: ['Starter replacement', 'Complete rewiring', 'PLC programming'], estimatedDurationMins: 150 }
      },
      {
        key: 'apfc',
        name: 'APFC Panel',
        description: 'Automatic power factor correction panels.',
        priceMin: 2000,
        priceMax: 15000,
        slaHours: 24,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.capacity, baseReq.phase, baseReq.brand, baseReq.assetTag, baseReq.remarks],
        service: { title: 'APFC Maintenance', description: 'Capacitor bank and controller maintenance.', pricingType: 'fixed', basePrice: 1999, includes: ['Capacitor check', 'Contactor tightening', 'Controller test', 'Current logging'], excludes: ['Capacitor replacement', 'Panel redesign', 'Utility fine handling'], estimatedDurationMins: 90 }
      },
      {
        key: 'db-panel',
        name: 'DB / Distribution Panel',
        description: 'Distribution boards and feeder panels.',
        priceMin: 1200,
        priceMax: 9000,
        slaHours: 24,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.urgency, baseReq.issueDescription, baseReq.pictures],
        service: { title: 'Distribution Board Service', description: 'Feeder, breaker, and wiring support.', pricingType: 'fixed', basePrice: 1299, includes: ['Breaker testing', 'Wiring inspection', 'Load balancing', 'Loose connection tightening'], excludes: ['New circuit design', 'Major cable replacement', 'Meter shifting'], estimatedDurationMins: 75 }
      },
      {
        key: 'earthing-lightning',
        name: 'Earthing & Lightning Protection',
        description: 'Earthing pits, lightning arresters, and grounding systems.',
        priceMin: 1500,
        priceMax: 14000,
        slaHours: 48,
        requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.installationType, baseReq.assetTag, baseReq.remarks, baseReq.serviceType, baseReq.preferredDate],
        service: { title: 'Earthing System Audit', description: 'Grounding and lightning protection inspection.', pricingType: 'quote_based', includes: ['Earth resistance test', 'Pit inspection', 'Connector check', 'Arrester test'], excludes: ['Pit drilling', 'Chemical replacement', 'Structural work'], estimatedDurationMins: 120 }
      }
    ]
  },
  {
    key: 'automation',
    name: 'Industrial Automation',
    icon: 'memory',
    description: 'PLCs, SCADA, HMIs, sensors, and machine automation.',
    isLogistics: false,
    sortOrder: 3,
    subcategories: [
      { key: 'plc', name: 'PLC Systems', description: 'Programmable logic controller support.', priceMin: 5000, priceMax: 40000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.urgency, baseReq.remarks], service: { title: 'PLC Troubleshooting', description: 'PLC diagnosis and maintenance support.', pricingType: 'quote_based', includes: ['Program backup', 'I/O check', 'Communication test', 'Power supply check'], excludes: ['PLC reprogramming from scratch', 'Machine redesign', 'Panel fabrication'], estimatedDurationMins: 180 } },
      { key: 'scada', name: 'SCADA / HMI', description: 'Supervisory control and operator interface systems.', priceMin: 6000, priceMax: 50000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.assetTag, baseReq.issueDescription, baseReq.preferredDate], service: { title: 'SCADA Support', description: 'SCADA and HMI support, maintenance, and recovery.', pricingType: 'quote_based', includes: ['Screen check', 'Alarm review', 'Communication recovery', 'Data backup'], excludes: ['Software license purchase', 'Custom development', 'Server migration'], estimatedDurationMins: 240 } },
      { key: 'vfd', name: 'VFD / Drives', description: 'Variable frequency drives and motor control.', priceMin: 2500, priceMax: 22000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.powerRating, baseReq.phase, baseReq.issueDescription], service: { title: 'VFD Service', description: 'Drive diagnostics and preventive checks.', pricingType: 'fixed', basePrice: 3499, includes: ['Error code readout', 'Fan cleaning', 'Parameter backup', 'Cooling test'], excludes: ['Power module replacement', 'Encoder replacement', 'Motor rewinding'], estimatedDurationMins: 120 } },
      { key: 'sensor-iot', name: 'Sensors / IoT', description: 'Industrial sensors, gateways, and IoT nodes.', priceMin: 1500, priceMax: 12000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.assetTag, baseReq.remarks, baseReq.preferredDate], service: { title: 'Sensor Installation', description: 'Installation and calibration of sensors and gateways.', pricingType: 'quote_based', includes: ['Mounting', 'Calibration', 'Connectivity test', 'Signal check'], excludes: ['Network provisioning', 'Cloud subscription', 'Civil work'], estimatedDurationMins: 90 } },
      { key: 'machine-vision', name: 'Machine Vision', description: 'Cameras and inspection systems.', priceMin: 8000, priceMax: 60000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.capacity, baseReq.issueDescription, baseReq.pictures], service: { title: 'Machine Vision Service', description: 'Vision system setup, tune-up, and support.', pricingType: 'quote_based', includes: ['Camera alignment', 'Lighting check', 'Image tuning', 'Software health check'], excludes: ['Custom AI model training', 'New line integration', 'Hardware redesign'], estimatedDurationMins: 180 } },
      { key: 'robotics', name: 'Robotics Systems', description: 'Robot arm support and integration.', priceMin: 10000, priceMax: 100000, slaHours: 72, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.quantity, baseReq.issueDescription, baseReq.remarks], service: { title: 'Robotics AMC', description: 'Maintenance support for robotic cells and equipment.', pricingType: 'quote_based', includes: ['Joint lubrication', 'Servo check', 'Safety interlock check', 'Program backup'], excludes: ['Mechanical retrofits', 'Robot relocation', 'New cell design'], estimatedDurationMins: 240 } }
    ]
  },
  {
    key: 'motors-drives',
    name: 'Motors & Drives',
    icon: 'precision_manufacturing',
    description: 'Industrial motors, starters, and drive systems.',
    isLogistics: false,
    sortOrder: 4,
    subcategories: [
      { key: 'induction-motor', name: 'Induction Motors', description: 'General purpose motors.', priceMin: 1200, priceMax: 18000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.powerRating, baseReq.phase, baseReq.issueDescription], service: { title: 'Motor Repair Support', description: 'Motor inspection, alignment, and repair.', pricingType: 'quote_based', includes: ['Insulation test', 'Bearing inspection', 'Alignment', 'Current test'], excludes: ['Rewinding', 'Rotor replacement', 'Foundation work'], estimatedDurationMins: 180 } },
      { key: 'servo-motor', name: 'Servo Motors', description: 'Precision servo motors and controllers.', priceMin: 5000, priceMax: 35000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.assetTag, baseReq.issueDescription, baseReq.urgency], service: { title: 'Servo Service', description: 'Servo tuning and diagnosis.', pricingType: 'quote_based', includes: ['Feedback test', 'Parameter backup', 'Cable check', 'Encoder check'], excludes: ['Encoder replacement', 'Drive replacement', 'Machine redesign'], estimatedDurationMins: 150 } },
      { key: 'soft-starter', name: 'Soft Starters', description: 'Reduced inrush current starter systems.', priceMin: 2000, priceMax: 16000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.phase, baseReq.capacity, baseReq.issueDescription], service: { title: 'Soft Starter Maintenance', description: 'Starter health checks and troubleshooting.', pricingType: 'fixed', basePrice: 2199, includes: ['Bypass test', 'Overload test', 'Heat check', 'Wiring inspection'], excludes: ['Starter replacement', 'Motor rewiring', 'Custom panel design'], estimatedDurationMins: 90 } },
      { key: 'pump-motor', name: 'Pump Motors', description: 'Motors coupled with pumps.', priceMin: 1000, priceMax: 10000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.phase, baseReq.capacity, baseReq.issueDescription, baseReq.preferredDate], service: { title: 'Pump Motor Service', description: 'Pump motor maintenance and alignment.', pricingType: 'fixed', basePrice: 1599, includes: ['Alignment', 'Seal check', 'Bearing check', 'Load test'], excludes: ['Pump impeller replacement', 'Civil work', 'Pipeline modification'], estimatedDurationMins: 120 } },
      { key: 'gear-motor', name: 'Gear Motors', description: 'Geared motor assemblies.', priceMin: 2500, priceMax: 22000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.capacity, baseReq.assetTag, baseReq.remarks], service: { title: 'Gear Motor AMC', description: 'Lubrication and health checks for geared motors.', pricingType: 'quote_based', includes: ['Gearbox oil check', 'Vibration check', 'Noise test', 'Mounting inspection'], excludes: ['Gearbox replacement', 'Shaft replacement', 'Fabrication'], estimatedDurationMins: 150 } },
      { key: 'pump-set', name: 'Pump Sets', description: 'Complete pump and motor sets.', priceMin: 1500, priceMax: 20000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.pictures, baseReq.preferredDate], service: { title: 'Pump Set Service', description: 'Pump set servicing and breakdown support.', pricingType: 'quote_based', includes: ['Leakage check', 'Seal inspection', 'Coupling alignment', 'Run test'], excludes: ['Civil foundation work', 'Pipe fabrication', 'Major motor replacement'], estimatedDurationMins: 120 } }
    ]
  },
  {
    key: 'backup-power',
    name: 'Power Backup & UPS',
    icon: 'battery_charging_full',
    description: 'UPS, inverters, batteries, and backup systems.',
    isLogistics: false,
    sortOrder: 5,
    subcategories: [
      { key: 'online-ups', name: 'Online UPS', description: 'Double conversion UPS systems.', priceMin: 2500, priceMax: 25000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.capacity, baseReq.issueDescription, baseReq.urgency], service: { title: 'UPS Service', description: 'UPS preventive maintenance and emergency support.', pricingType: 'fixed', basePrice: 2999, includes: ['Battery test', 'Bypass check', 'Alarm test', 'Load test'], excludes: ['Battery replacement', 'Board replacement', 'Cabinet redesign'], estimatedDurationMins: 120 } },
      { key: 'industrial-inverter', name: 'Industrial Inverter', description: 'Heavy duty inverter systems.', priceMin: 2000, priceMax: 18000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.phase, baseReq.capacity, baseReq.issueDescription], service: { title: 'Inverter Maintenance', description: 'Backup power inverter maintenance.', pricingType: 'fixed', basePrice: 1799, includes: ['Charging test', 'Output test', 'Switching test', 'Fan cleaning'], excludes: ['Transformer replacement', 'Battery bank expansion', 'Civil work'], estimatedDurationMins: 90 } },
      { key: 'battery-bank', name: 'Battery Bank', description: 'Lead acid and lithium battery banks.', priceMin: 1500, priceMax: 22000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.brand, baseReq.capacity, baseReq.warrantyStatus, baseReq.remarks], service: { title: 'Battery Bank Audit', description: 'Battery health and backup duration evaluation.', pricingType: 'quote_based', includes: ['Voltage check', 'Terminal cleaning', 'Load test', 'Health report'], excludes: ['Battery replacement', 'Rack replacement', 'Electrical redesign'], estimatedDurationMins: 90 } },
      { key: 'diesel-generator', name: 'Diesel Generator', description: 'DG sets and generator backup systems.', priceMin: 3000, priceMax: 40000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.powerRating, baseReq.issueDescription, baseReq.preferredDate], service: { title: 'DG Set AMC', description: 'Generator maintenance and load testing.', pricingType: 'quote_based', includes: ['Oil check', 'Fuel check', 'Battery check', 'Load run test'], excludes: ['Engine overhaul', 'AMF panel replacement', 'Fuel tank fabrication'], estimatedDurationMins: 180 } },
      { key: 'stabilizer', name: 'Servo / Voltage Stabilizer', description: 'Voltage regulation equipment.', priceMin: 1000, priceMax: 10000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.voltage, baseReq.capacity, baseReq.issueDescription, baseReq.pictures, baseReq.remarks], service: { title: 'Stabilizer Service', description: 'Voltage stabilizer diagnostics and support.', pricingType: 'fixed', basePrice: 1299, includes: ['Input/output check', 'Transformer check', 'Relay test', 'Wiring inspection'], excludes: ['Transformer replacement', 'Servo motor replacement', 'Cabinet fabrication'], estimatedDurationMins: 75 } },
      { key: 'solar-battery', name: 'Solar Battery Backup', description: 'Backup systems for solar applications.', priceMin: 2000, priceMax: 24000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.capacity, baseReq.quantity, baseReq.serviceType, baseReq.remarks], service: { title: 'Solar Backup Service', description: 'Battery and inverter support for solar backup installations.', pricingType: 'quote_based', includes: ['Charge cycle check', 'Controller check', 'Battery health report', 'Connection tightening'], excludes: ['Solar panel cleaning', 'Roof work', 'Battery replacement'], estimatedDurationMins: 120 } }
    ]
  },
  {
    key: 'fire-safety',
    name: 'Fire Safety Systems',
    icon: 'local_fire_department',
    description: 'Fire alarms, extinguishers, hydrants, and suppression systems.',
    isLogistics: false,
    sortOrder: 6,
    subcategories: [
      { key: 'fire-alarm', name: 'Fire Alarm System', description: 'Alarm, smoke, and heat detection systems.', priceMin: 1500, priceMax: 16000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.issueDescription, baseReq.preferredDate, baseReq.remarks], service: { title: 'Fire Alarm Service', description: 'Testing and maintenance of fire alarm systems.', pricingType: 'fixed', basePrice: 2499, includes: ['Detector test', 'Panel test', 'Battery check', 'Sounder test'], excludes: ['Panel replacement', 'Wiring redesign', 'Civil work'], estimatedDurationMins: 120 } },
      { key: 'fire-extinguisher', name: 'Fire Extinguishers', description: 'Portable and wheeled fire extinguishers.', priceMin: 500, priceMax: 5000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.assetTag, baseReq.warrantyStatus, baseReq.issueDescription, baseReq.remarks], service: { title: 'Extinguisher Refilling', description: 'Inspection, refilling, and certification support.', pricingType: 'fixed', basePrice: 399, includes: ['Pressure check', 'Refill', 'Seal check', 'Label update'], excludes: ['Cylinder replacement', 'Civil work', 'Rack fabrication'], estimatedDurationMins: 30 } },
      { key: 'hydrant', name: 'Hydrant System', description: 'Fire hydrant mains and accessories.', priceMin: 3000, priceMax: 30000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.pictures, baseReq.preferredDate], service: { title: 'Hydrant AMC', description: 'Hydrant line inspection and preventive maintenance.', pricingType: 'quote_based', includes: ['Pump test', 'Valve check', 'Pressure test', 'Hose reel inspection'], excludes: ['Pipe replacement', 'Civil excavation', 'Pump replacement'], estimatedDurationMins: 180 } },
      { key: 'sprinkler', name: 'Sprinkler System', description: 'Automatic fire sprinkler networks.', priceMin: 2500, priceMax: 22000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.installationType, baseReq.quantity, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Sprinkler Maintenance', description: 'Sprinkler valve, nozzle, and line servicing.', pricingType: 'quote_based', includes: ['Nozzle inspection', 'Valve check', 'Pressure test', 'Leakage check'], excludes: ['Sprinkler replacement', 'Pipeline redesign', 'Tank construction'], estimatedDurationMins: 150 } },
      { key: 'fm-200', name: 'FM-200 / Clean Agent', description: 'Gas suppression systems.', priceMin: 6000, priceMax: 50000, slaHours: 72, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.assetTag, baseReq.issueDescription, baseReq.urgency], service: { title: 'Clean Agent Service', description: 'Suppression system inspection and support.', pricingType: 'quote_based', includes: ['Cylinder pressure check', 'Nozzle inspection', 'Panel check', 'Release circuit test'], excludes: ['Gas refilling', 'Cylinder replacement', 'Room sealing work'], estimatedDurationMins: 180 } },
      { key: 'fire-suppression', name: 'Kitchen / Special Suppression', description: 'Special hazard suppression systems.', priceMin: 5000, priceMax: 35000, slaHours: 72, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.issueDescription, baseReq.pictures, baseReq.remarks], service: { title: 'Special Suppression AMC', description: 'Maintenance for special hazard fire suppression systems.', pricingType: 'quote_based', includes: ['Agent pressure check', 'Nozzle test', 'Control panel test', 'Piping inspection'], excludes: ['Refill', 'Cylinder replacement', 'Kitchen hood fabrication'], estimatedDurationMins: 180 } }
    ]
  },
  {
    key: 'security',
    name: 'Security & Surveillance',
    icon: 'security',
    description: 'CCTV, access control, and intrusion systems.',
    isLogistics: false,
    sortOrder: 7,
    subcategories: [
      { key: 'cctv', name: 'CCTV System', description: 'IP and analog camera systems.', priceMin: 1000, priceMax: 12000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.assetTag], service: { title: 'CCTV AMC', description: 'Camera, NVR, and storage maintenance.', pricingType: 'fixed', basePrice: 1499, includes: ['Camera cleaning', 'DVR/NVR check', 'Hard disk test', 'Cable inspection'], excludes: ['Camera replacement', 'Pole erection', 'Network upgrade'], estimatedDurationMins: 90 } },
      { key: 'access-control', name: 'Access Control', description: 'Biometric and card access systems.', priceMin: 2000, priceMax: 16000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.quantity, baseReq.issueDescription, baseReq.preferredDate], service: { title: 'Access Control Service', description: 'Biometric and RFID access support.', pricingType: 'quote_based', includes: ['Reader test', 'Controller check', 'Power check', 'Door contact check'], excludes: ['Turnstile fabrication', 'Civil work', 'Server setup'], estimatedDurationMins: 120 } },
      { key: 'intrusion-alarm', name: 'Intrusion Alarm', description: 'Perimeter and door alarm systems.', priceMin: 1000, priceMax: 9000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Intrusion Alarm Service', description: 'Testing and maintenance of intrusion systems.', pricingType: 'fixed', basePrice: 999, includes: ['Sensor test', 'Siren test', 'Battery test', 'Zone check'], excludes: ['Sensor replacement', 'Civil work', 'Monitoring subscription'], estimatedDurationMins: 60 } },
      { key: 'video-door-phone', name: 'Video Door Phone', description: 'Intercom and door video systems.', priceMin: 800, priceMax: 7000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.pictures], service: { title: 'VDP Service', description: 'Video door phone installation and support.', pricingType: 'fixed', basePrice: 799, includes: ['Call test', 'Camera test', 'Door release test', 'Wiring check'], excludes: ['Door lock replacement', 'Wall patching', 'Network setup'], estimatedDurationMins: 75 } },
      { key: 'boom-barrier', name: 'Boom Barrier', description: 'Vehicle entry control barriers.', priceMin: 2500, priceMax: 25000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate, baseReq.assetTag], service: { title: 'Barrier Service', description: 'Boom barrier maintenance and repair.', pricingType: 'quote_based', includes: ['Motor test', 'Limit switch test', 'Safety sensor test', 'Arm alignment'], excludes: ['Arm replacement', 'Foundation work', 'Civil fabrication'], estimatedDurationMins: 120 } },
      { key: 'parking-management', name: 'Parking Management', description: 'Parking guidance and control systems.', priceMin: 2000, priceMax: 18000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Parking System Service', description: 'Support for parking controllers and systems.', pricingType: 'quote_based', includes: ['Sensor check', 'Controller test', 'Display check', 'Loop sensor check'], excludes: ['Civil markings', 'Gate installation', 'Software license'], estimatedDurationMins: 150 } }
    ]
  },
  {
    key: 'networking-it',
    name: 'Networking & IT',
    icon: 'router',
    description: 'Switches, routers, Wi-Fi, servers, and structured cabling.',
    isLogistics: false,
    sortOrder: 8,
    subcategories: [
      { key: 'network-switch', name: 'Network Switch', description: 'Managed and unmanaged switches.', priceMin: 1000, priceMax: 15000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.quantity, baseReq.issueDescription, baseReq.remarks], service: { title: 'Switch Maintenance', description: 'Switch health check and configuration support.', pricingType: 'quote_based', includes: ['Port check', 'Firmware review', 'Uplink test', 'Power check'], excludes: ['Network redesign', 'License purchase', 'Rack fabrication'], estimatedDurationMins: 90 } },
      { key: 'router-firewall', name: 'Router / Firewall', description: 'Internet routing and security appliances.', priceMin: 1500, priceMax: 22000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.assetTag, baseReq.preferredDate], service: { title: 'Router Firewall Support', description: 'Network routing and firewall maintenance.', pricingType: 'fixed', basePrice: 1499, includes: ['Connectivity test', 'Rule review', 'Firmware check', 'Backup config'], excludes: ['ISP ticketing', 'New circuit purchase', 'Network redesign'], estimatedDurationMins: 90 } },
      { key: 'wifi-network', name: 'Wi-Fi Network', description: 'Enterprise Wi-Fi setup and optimization.', priceMin: 1200, priceMax: 14000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.issueDescription, baseReq.pictures, baseReq.preferredDate], service: { title: 'Wi-Fi Optimization', description: 'Access point placement and Wi-Fi troubleshooting.', pricingType: 'quote_based', includes: ['Signal survey', 'Channel review', 'Coverage check', 'AP health check'], excludes: ['New cabling', 'Civil work', 'License upgrades'], estimatedDurationMins: 120 } },
      { key: 'server-rack', name: 'Server Rack', description: 'Racks, UPS, and server room infrastructure.', priceMin: 2500, priceMax: 25000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.installationType, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Server Room Audit', description: 'Infrastructure audit for server rooms and racks.', pricingType: 'quote_based', includes: ['Airflow check', 'Cable management review', 'Power review', 'Rack stability check'], excludes: ['Server migration', 'Data backup services', 'Virtualization work'], estimatedDurationMins: 150 } },
      { key: 'structured-cabling', name: 'Structured Cabling', description: 'LAN, fiber, and backbone cabling.', priceMin: 1500, priceMax: 30000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.pictures, baseReq.remarks], service: { title: 'Cabling Support', description: 'Cable tracing, testing, and patching support.', pricingType: 'quote_based', includes: ['Cable test', 'Label verification', 'Patch panel check', 'Link testing'], excludes: ['New ducting', 'Wall chasing', 'Fiber splicing'], estimatedDurationMins: 180 } },
      { key: 'nas-storage', name: 'NAS / Storage', description: 'Network attached storage and backups.', priceMin: 2000, priceMax: 18000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.assetTag, baseReq.issueDescription, baseReq.remarks], service: { title: 'Storage Support', description: 'NAS health check and storage support.', pricingType: 'quote_based', includes: ['Disk health check', 'RAID review', 'Backup verification', 'Firmware review'], excludes: ['Data recovery', 'Disk procurement', 'Server build'], estimatedDurationMins: 120 } }
    ]
  },
  {
    key: 'lighting-controls',
    name: 'Lighting & Controls',
    icon: 'lightbulb',
    description: 'LED lighting, dimming, sensors, and control systems.',
    isLogistics: false,
    sortOrder: 9,
    subcategories: [
      { key: 'led-lights', name: 'LED Lighting', description: 'Indoor and outdoor LED lighting systems.', priceMin: 800, priceMax: 12000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.preferredDate, baseReq.remarks], service: { title: 'LED Light Service', description: 'Replacement and maintenance of LED lighting.', pricingType: 'fixed', basePrice: 899, includes: ['Fixture check', 'Driver test', 'Wiring check', 'Mounting check'], excludes: ['Pole erection', 'New wiring trunking', 'Civil work'], estimatedDurationMins: 60 } },
      { key: 'street-light', name: 'Street Lighting', description: 'Outdoor and street lighting networks.', priceMin: 1500, priceMax: 18000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.pictures, baseReq.assetTag], service: { title: 'Street Light AMC', description: 'Outdoor lighting inspection and repairs.', pricingType: 'quote_based', includes: ['Pole inspection', 'Photocell test', 'Cable check', 'Lamp test'], excludes: ['Pole replacement', 'Foundation work', 'Municipal permissions'], estimatedDurationMins: 180 } },
      { key: 'dimming-control', name: 'Dimming Control', description: 'Lighting dimmers and scene controls.', priceMin: 1200, priceMax: 10000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Lighting Controls Service', description: 'Setup and troubleshooting for dimming systems.', pricingType: 'quote_based', includes: ['Control test', 'Scene test', 'Power check', 'Device pairing'], excludes: ['Controller replacement', 'Wiring redesign', 'App development'], estimatedDurationMins: 90 } },
      { key: 'motion-sensor', name: 'Motion Sensors', description: 'Occupancy and motion-based lighting sensors.', priceMin: 500, priceMax: 7000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.remarks, baseReq.pictures], service: { title: 'Sensor Service', description: 'Installation and calibration of motion sensors.', pricingType: 'fixed', basePrice: 699, includes: ['Detection check', 'Sensitivity setup', 'Power test', 'Coverage test'], excludes: ['Sensor relocation wiring', 'Civil work', 'Lighting redesign'], estimatedDurationMins: 45 } },
      { key: 'emergency-light', name: 'Emergency Lighting', description: 'Backup and exit lighting systems.', priceMin: 1000, priceMax: 11000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.assetTag, baseReq.issueDescription, baseReq.preferredDate, baseReq.remarks], service: { title: 'Emergency Light AMC', description: 'Battery and lamp maintenance for emergency lighting.', pricingType: 'quote_based', includes: ['Battery test', 'Auto-changeover test', 'Lamp test', 'Mounting check'], excludes: ['Fixture replacement', 'Civil work', 'New cabling'], estimatedDurationMins: 60 } },
      { key: 'industrial-light', name: 'Industrial Lighting', description: 'High bay and factory lighting.', priceMin: 1500, priceMax: 20000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.quantity, baseReq.powerRating, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Industrial Lighting Service', description: 'Maintenance of industrial and warehouse lighting.', pricingType: 'quote_based', includes: ['Fixture audit', 'Driver test', 'Emergency backup test', 'Wiring check'], excludes: ['Pole replacement', 'Structural scaffold work', 'Control cabinet fabrication'], estimatedDurationMins: 150 } }
    ]
  },
  {
    key: 'solar-energy',
    name: 'Solar & Energy Management',
    icon: 'solar_power',
    description: 'Solar PV, inverters, monitoring, and energy optimization.',
    isLogistics: false,
    sortOrder: 10,
    subcategories: [
      { key: 'solar-pv', name: 'Solar PV System', description: 'Grid-tied and hybrid solar plants.', priceMin: 3000, priceMax: 40000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.capacity, baseReq.quantity, baseReq.locationType, baseReq.issueDescription, baseReq.pictures], service: { title: 'Solar PV AMC', description: 'Preventive maintenance for solar PV systems.', pricingType: 'quote_based', includes: ['Module cleaning check', 'String test', 'Inverter check', 'Generation review'], excludes: ['Panel replacement', 'Civil work', 'Tree cutting'], estimatedDurationMins: 180 } },
      { key: 'solar-inverter', name: 'Solar Inverter', description: 'Hybrid and off-grid solar inverters.', priceMin: 2000, priceMax: 22000, slaHours: 24, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.capacity, baseReq.issueDescription, baseReq.remarks], service: { title: 'Solar Inverter Service', description: 'Diagnostics and maintenance of solar inverters.', pricingType: 'fixed', basePrice: 1799, includes: ['Input/output test', 'Charging test', 'Alarm review', 'Fan cleaning'], excludes: ['PCB replacement', 'Battery replacement', 'Array redesign'], estimatedDurationMins: 90 } },
      { key: 'solar-monitoring', name: 'Solar Monitoring', description: 'Monitoring gateways and dashboards.', priceMin: 1500, priceMax: 12000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.assetTag, baseReq.issueDescription, baseReq.preferredDate], service: { title: 'Monitoring Support', description: 'Monitoring setup and support for solar plants.', pricingType: 'quote_based', includes: ['Gateway check', 'Dashboard health check', 'Alert test', 'Data sync check'], excludes: ['Custom software build', 'Server migration', 'License purchase'], estimatedDurationMins: 120 } },
      { key: 'energy-audit', name: 'Energy Audit', description: 'Energy consumption and optimization audits.', priceMin: 2500, priceMax: 25000, slaHours: 72, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.locationType, baseReq.quantity, baseReq.issueDescription, baseReq.remarks, baseReq.preferredDate], service: { title: 'Energy Audit Service', description: 'Energy efficiency inspection and reporting.', pricingType: 'quote_based', includes: ['Load study', 'Consumption analysis', 'Recommendation report', 'Thermal scan'], excludes: ['Retrofit execution', 'Equipment supply', 'Utility filing'], estimatedDurationMins: 240 } },
      { key: 'bms', name: 'BMS / EMS', description: 'Building and energy management systems.', priceMin: 4000, priceMax: 40000, slaHours: 72, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.brand, baseReq.modelNumber, baseReq.issueDescription, baseReq.assetTag, baseReq.remarks], service: { title: 'BMS Service', description: 'Support for building management and energy systems.', pricingType: 'quote_based', includes: ['Sensor check', 'Controller health review', 'Trend review', 'Alarm testing'], excludes: ['Software development', 'BMS redesign', 'Major hardware replacement'], estimatedDurationMins: 240 } },
      { key: 'power-quality', name: 'Power Quality', description: 'Harmonics, sags, swells, and correction systems.', priceMin: 3000, priceMax: 25000, slaHours: 48, requirements: [baseReq.customerName, baseReq.siteAddress, baseReq.contactNumber, baseReq.voltage, baseReq.powerRating, baseReq.issueDescription, baseReq.pictures, baseReq.remarks], service: { title: 'Power Quality Audit', description: 'Measurement and correction support for power quality issues.', pricingType: 'quote_based', includes: ['Harmonic check', 'Sag/swells analysis', 'Load audit', 'Report preparation'], excludes: ['Filter installation', 'Transformer replacement', 'Utility application'], estimatedDurationMins: 180 } }
    ]
  }
];

const amcPlanTemplates = [
  {
    title: 'Starter Care Plan',
    description: 'Best for small sites with limited equipment count.',
    durationMonths: 12,
    priceMultiplier: 1.0,
    visitLimit: 2,
    benefits: ['Priority support', 'Quarterly inspection', 'Basic labor coverage']
  },
  {
    title: 'Business Care Plan',
    description: 'Balanced plan for commercial sites and branches.',
    durationMonths: 12,
    priceMultiplier: 1.7,
    visitLimit: 4,
    benefits: ['Priority support', 'Scheduled preventive maintenance', 'Inspection reports', 'Discounted spare parts handling']
  },
  {
    title: 'Enterprise Care Plan',
    description: 'Heavy-duty AMC for critical facilities and multi-site operations.',
    durationMonths: 12,
    priceMultiplier: 2.6,
    visitLimit: 12,
    benefits: ['24/7 emergency support', 'Dedicated account management', 'Monthly preventive visits', 'Detailed service reports', 'Reduced breakdown response time']
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    await mongoose.connection.dropCollection('requirementfieldtemplates').catch(() => {});
    await mongoose.connection.dropCollection('servicetemplates').catch(() => {});
    await mongoose.connection.dropCollection('amcplans').catch(() => {});
    await mongoose.connection.dropCollection('subcategories').catch(() => {});
    await mongoose.connection.dropCollection('categories').catch(() => {});
  } catch (err) {
    console.log('Collection cleanup skipped:', err.message);
  }

  const insertedCategories = [];
  const insertedSubcategories = [];
  const insertedRequirements = [];
  const insertedServices = [];

  const categoryIdByKey = new Map();
  const subcategoryIdByKey = new Map();

  for (const category of catalog) {
    const createdCategory = await Category.create({
      name: category.name,
      slug: toSlug(category.name),
      icon: category.icon,
      description: category.description,
      isLogistics: category.isLogistics,
      isActive: true,
      sortOrder: category.sortOrder,
      createdBy: ADMIN_ID
    });

    insertedCategories.push(createdCategory);
    categoryIdByKey.set(category.key, createdCategory._id);

    for (const sub of category.subcategories) {
      const createdSub = await Subcategory.create({
        categoryId: createdCategory._id,
        name: sub.name,
        slug: toSlug(sub.name),
        description: sub.description,
        isLogistics: false,
        isActive: true,
        sortOrder: 0,
        priceMin: sub.priceMin,
        priceMax: sub.priceMax,
        slaHours: sub.slaHours
      });

      insertedSubcategories.push(createdSub);
      subcategoryIdByKey.set(sub.key, createdSub._id);

      const reqDocs = sub.requirements.map((req, index) => ({
        subcategoryId: createdSub._id,
        label: req.label,
        fieldKey: req.fieldKey,
        fieldType: req.fieldType,
        required: req.required,
        placeholder: req.placeholder || '',
        helpText: req.helpText || '',
        options: req.options || [],
        min: req.min ?? null,
        max: req.max ?? null,
        unit: req.unit || '',
        order: index + 1,
        dependsOn: req.dependsOn || { fieldKey: '', value: null },
        isActive: true
      }));

      const createdReqs = await RequirementFieldTemplate.insertMany(reqDocs);
      insertedRequirements.push(...createdReqs);

      const createdService = await ServiceTemplate.create({
        subcategoryId: createdSub._id,
        title: sub.service.title,
        slug: toSlug(sub.service.title),
        description: sub.service.description,
        pricingType: sub.service.pricingType || 'quote_based',
        basePrice: sub.service.basePrice || 0,
        minPrice: sub.priceMin || 0,
        maxPrice: sub.priceMax || 0,
        includes: sub.service.includes || [],
        excludes: sub.service.excludes || [],
        estimatedDurationMins: sub.service.estimatedDurationMins || null,
        requiredFieldsSnapshot: pickRequiredFields(reqDocs),
        isActive: true
      });

      insertedServices.push(createdService);
    }
  }

  const amcPlans = [];
  for (const category of catalog) {
    const categoryId = categoryIdByKey.get(category.key);
    const subIds = category.subcategories.map((s) => subcategoryIdByKey.get(s.key));

    const avgPrice = category.subcategories.reduce((sum, s) => sum + ((s.priceMin + s.priceMax) / 2), 0) / category.subcategories.length;

    amcPlanTemplates.forEach((tpl, idx) => {
      amcPlans.push({
        title: `${category.name} - ${tpl.title}`,
        description: `${tpl.description} for ${category.name}.`,
        categoryIds: [categoryId],
        subcategoryIds: subIds,
        durationMonths: tpl.durationMonths,
        price: Math.round(avgPrice * tpl.priceMultiplier),
        visitLimit: tpl.visitLimit,
        benefits: tpl.benefits,
        isActive: true,
        sortOrder: idx + 1
      });
    });
  }

  await AMCPlan.insertMany(amcPlans);

  console.log('Seed completed successfully');
  console.log(`Categories: ${insertedCategories.length}`);
  console.log(`Subcategories: ${insertedSubcategories.length}`);
  console.log(`Requirement templates: ${insertedRequirements.length}`);
  console.log(`Service templates: ${insertedServices.length}`);
  console.log(`AMC plans: ${amcPlans.length}`);
}

seed()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await mongoose.connection.close();
    process.exit(1);
  });

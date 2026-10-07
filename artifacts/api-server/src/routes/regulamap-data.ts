const sources = "RegulaMap demonstration dataset — simulated text, not an authoritative legal source.";

const regulationSeeds = [
  ["demo-industrial-emissions", "Demo Industrial Emissions Standard", "DIES", "India", "Central Environment Authority", "EMISSIONS", 82],
  ["demo-eu-carbon-reporting", "Demo EU Carbon Reporting Directive", "ECRD", "European Union", "Demo Climate Directorate", "CARBON", 74],
  ["demo-hazardous-waste", "Demo Hazardous Waste Framework", "HWF", "India", "Demo Pollution Control Board", "WASTE", 66],
  ["demo-packaging-epr", "Demo Packaging Responsibility Rule", "DPRR", "United Kingdom", "Demo Resources Agency", "PACKAGING", 53],
  ["demo-water-discharge", "Demo Industrial Water Discharge Code", "IWDC", "India", "Demo Water Authority", "WATER", 71],
  ["demo-energy-efficiency", "Demo Facility Energy Efficiency Standard", "FEES", "Japan", "Demo Energy Bureau", "ENERGY", 42],
  ["demo-air-quality", "Demo Regional Air Quality Directive", "RAQD", "European Union", "Demo Environment Commission", "AIR_QUALITY", 64],
  ["demo-chemical-inventory", "Demo Chemical Inventory Rule", "CIR", "United States", "Demo Materials Agency", "CHEMICALS", 57],
  ["demo-climate-disclosure", "Demo Climate Disclosure Framework", "CDIF", "Australia", "Demo Climate Office", "CLIMATE", 49],
  ["demo-recycling-targets", "Demo Commercial Recycling Targets", "DCRT", "United Kingdom", "Demo Circularity Office", "RECYCLING", 38],
  ["demo-sustainability-reporting", "Demo Sustainability Reporting Standard", "DSRS", "European Union", "Demo Reporting Authority", "SUSTAINABILITY", 55],
  ["demo-solvent-emissions", "Demo Solvent Emissions Control Rule", "SECR", "Japan", "Demo Air Quality Bureau", "EMISSIONS", 68],
  ["demo-water-reuse", "Demo Water Reuse Planning Standard", "WRPS", "Australia", "Demo Water Commission", "WATER", 34],
  ["demo-carbon-border", "Demo Carbon Border Reporting Protocol", "CBRP", "European Union", "Demo Trade & Climate Office", "CARBON", 79],
  ["demo-battery-recycling", "Demo Battery Recovery Requirements", "BRR", "United States", "Demo Product Stewardship Agency", "RECYCLING", 46],
  ["demo-landfill-diversion", "Demo Landfill Diversion Standard", "LDS", "India", "Demo Waste Management Board", "WASTE", 44],
  ["demo-fluorinated-gases", "Demo Fluorinated Gas Controls", "DFGC", "European Union", "Demo Climate Directorate", "CLIMATE", 72],
  ["demo-industrial-permits", "Demo Industrial Permit Renewal Rule", "DIPR", "United States", "Demo Environmental Office", "AIR_QUALITY", 59],
  ["demo-supplier-emissions", "Demo Supplier Emissions Disclosure Rule", "SEDR", "United Kingdom", "Demo Supply Chain Office", "CARBON", 61],
  ["demo-plastic-reduction", "Demo Single-Use Packaging Reduction Rule", "SPRR", "Australia", "Demo Resources Agency", "PACKAGING", 51],
  ["demo-boiler-efficiency", "Demo Boiler Performance Standard", "DBPS", "India", "Demo Energy Bureau", "ENERGY", 48],
  ["demo-process-water", "Demo Process Water Monitoring Rule", "PWMR", "Japan", "Demo Water Authority", "WATER", 43],
  ["demo-chemical-storage", "Demo Chemical Storage Safety Standard", "DCSS", "Australia", "Demo Materials Agency", "CHEMICALS", 63],
  ["demo-scope-three", "Demo Scope Three Disclosure Protocol", "S3DP", "United States", "Demo Climate Office", "SUSTAINABILITY", 58],
  ["demo-air-monitoring", "Demo Continuous Air Monitoring Rule", "CAMR", "United Kingdom", "Demo Environment Commission", "AIR_QUALITY", 76],
] as const;

const regulationDescriptions = [
  "Sets demonstration requirements for monitoring, recordkeeping, and reporting by covered industrial operators.",
  "Defines a sample reporting schedule and evidence standard for organizations with cross-border operations.",
  "Describes a simulated compliance framework for facility-level environmental controls and annual review.",
];

const levelFor = (score: number) =>
  score >= 81 ? "CRITICAL" : score >= 61 ? "HIGH" : score >= 41 ? "MEDIUM" : score >= 21 ? "LOW" : "INFORMATIONAL";

export const regulations = regulationSeeds.map(([id, title, shortTitle, jurisdiction, regulator, category, riskScore], index) => {
  const oldText =
    id === "demo-industrial-emissions"
      ? "Facilities emitting more than 100 tons of CO2 annually must submit an annual emissions report."
      : `Covered operators must submit an annual ${category.toLowerCase()} compliance statement by 31 March.`;
  const newText =
    id === "demo-industrial-emissions"
      ? "Facilities emitting more than 75 tons of CO2 annually must submit an annual emissions report."
      : `Covered operators must submit an annual ${category.toLowerCase()} compliance statement by 31 January and retain evidence for five years.`;
  return {
    id,
    title,
    shortTitle,
    jurisdiction,
    regulator,
    category,
    status: index % 8 === 0 ? "Under review" : "Active",
    publicationDate: index === 0 ? "2026-07-10" : `202${3 + (index % 3)}-${String((index % 9) + 1).padStart(2, "0")}-15`,
    effectiveDate: index === 0 ? "2026-11-01" : `202${6 + (index % 2)}-${String(((index + 3) % 9) + 1).padStart(2, "0")}-01`,
    description: regulationDescriptions[index % regulationDescriptions.length],
    applicability: "Demonstration scope: industrial facilities that operate the listed process category or exceed a sample reporting threshold.",
    source: sources,
    riskScore,
    riskLevel: levelFor(riskScore),
    versions: [
      {
        id: `${id}-v1`,
        version: 1,
        publishedAt: "2025-01-15",
        summary: "Baseline demonstration text.",
        text: oldText,
      },
      {
        id: `${id}-v2`,
        version: 2,
        publishedAt: "2026-07-10",
        summary: "Updated demonstration text for comparison.",
        text: newText,
      },
    ],
  };
});

export const facilities = [
  {
    id: "facility-hyderabad",
    name: "Hyderabad Manufacturing Plant",
    country: "India",
    city: "Hyderabad",
    facilityType: "Manufacturing",
    riskScore: 82,
    riskLevel: "CRITICAL",
    emissions: 91,
    waterUsage: 48500,
    energy: 12600,
    processes: ["Metal finishing", "Boiler operations", "Assembly"],
    products: ["Industrial pumps", "Valve assemblies"],
    regulationIds: ["demo-industrial-emissions", "demo-hazardous-waste", "demo-water-discharge"],
  },
  {
    id: "facility-bangalore",
    name: "Bangalore Assembly Facility",
    country: "India",
    city: "Bangalore",
    facilityType: "Assembly",
    riskScore: 64,
    riskLevel: "HIGH",
    emissions: 72,
    waterUsage: 31200,
    energy: 9400,
    processes: ["Precision assembly", "Surface treatment"],
    products: ["Control systems", "Sensor modules"],
    regulationIds: ["demo-industrial-emissions", "demo-energy-efficiency", "demo-chemical-inventory"],
  },
  {
    id: "facility-chennai",
    name: "Chennai Chemical Facility",
    country: "India",
    city: "Chennai",
    facilityType: "Chemical processing",
    riskScore: 73,
    riskLevel: "HIGH",
    emissions: 68,
    waterUsage: 59100,
    energy: 10900,
    processes: ["Solvent handling", "Chemical blending", "Waste treatment"],
    products: ["Coatings", "Process additives"],
    regulationIds: ["demo-hazardous-waste", "demo-water-discharge", "demo-chemical-storage"],
  },
  {
    id: "facility-mumbai",
    name: "Mumbai Packaging Facility",
    country: "India",
    city: "Mumbai",
    facilityType: "Packaging",
    riskScore: 48,
    riskLevel: "MEDIUM",
    emissions: 43,
    waterUsage: 22100,
    energy: 7200,
    processes: ["Packaging conversion", "Materials recovery"],
    products: ["Protective packaging", "Industrial cartons"],
    regulationIds: ["demo-packaging-epr", "demo-recycling-targets", "demo-plastic-reduction"],
  },
];

const changeSeeds = [
  {
    regulationId: "demo-industrial-emissions",
    changeType: "THRESHOLD_CHANGE",
    riskScore: 82,
    summary: "Annual reporting threshold decreased from 100 to 75 tons of CO2.",
    oldText: "Facilities emitting more than 100 tons of CO2 annually must submit an annual emissions report.",
    newText: "Facilities emitting more than 75 tons of CO2 annually must submit an annual emissions report.",
    why: "Facilities between 75 and 100 tons may now fall within the sample reporting scope.",
    recommendation: "Review facility emissions and determine whether the reporting threshold now applies.",
  },
  {
    regulationId: "demo-eu-carbon-reporting",
    changeType: "REPORTING_SCOPE",
    riskScore: 74,
    summary: "The sample reporting scope now includes additional operating locations.",
    oldText: "Covered entities report emissions for sites with more than 250 employees.",
    newText: "Covered entities report emissions for sites with more than 150 employees.",
    why: "More operating sites may require emissions data collection and review.",
    recommendation: "Inventory locations near the revised employee threshold and assign data owners.",
  },
  {
    regulationId: "demo-hazardous-waste",
    changeType: "RECORDKEEPING",
    riskScore: 66,
    summary: "Sample hazardous-waste evidence retention extends from three to five years.",
    oldText: "Keep transfer records for three years.",
    newText: "Keep transfer records and treatment certificates for five years.",
    why: "Longer retention increases document-control requirements at affected facilities.",
    recommendation: "Update the retention schedule and verify archived transfer records.",
  },
  {
    regulationId: "demo-packaging-epr",
    changeType: "TARGET_CHANGE",
    riskScore: 53,
    summary: "The sample packaging recovery target increases by five percentage points.",
    oldText: "Recover at least 65% of covered packaging by weight.",
    newText: "Recover at least 70% of covered packaging by weight.",
    why: "Packaging mix and supplier evidence may need closer tracking.",
    recommendation: "Reconcile packaging weights and review recovery evidence with suppliers.",
  },
  {
    regulationId: "demo-water-discharge",
    changeType: "MONITORING_FREQUENCY",
    riskScore: 71,
    summary: "Sample discharge monitoring moves from quarterly to monthly.",
    oldText: "Collect discharge samples once per quarter.",
    newText: "Collect discharge samples once per month and retain laboratory reports.",
    why: "More frequent sampling adds recurring work at water-intensive facilities.",
    recommendation: "Update the sampling calendar and confirm laboratory capacity.",
  },
  {
    regulationId: "demo-energy-efficiency",
    changeType: "PERFORMANCE_STANDARD",
    riskScore: 42,
    summary: "A sample boiler efficiency benchmark tightens from 82% to 85%.",
    oldText: "Maintain boiler thermal efficiency at or above 82%.",
    newText: "Maintain boiler thermal efficiency at or above 85%.",
    why: "Older equipment may require maintenance or an efficiency assessment.",
    recommendation: "Compare current boiler readings with the new sample benchmark.",
  },
  {
    regulationId: "demo-air-quality",
    changeType: "PERMIT_CONDITION",
    riskScore: 64,
    summary: "Sample operating permits add a documented annual control review.",
    oldText: "Maintain emission controls and inspection records.",
    newText: "Maintain emission controls and complete a documented annual control review.",
    why: "Operators need a repeatable review record in addition to equipment logs.",
    recommendation: "Add an annual control review to the facility compliance calendar.",
  },
  {
    regulationId: "demo-chemical-inventory",
    changeType: "DISCLOSURE",
    riskScore: 57,
    summary: "The sample inventory filing adds a supplier-origin field.",
    oldText: "List the chemical name and quantity held on site.",
    newText: "List the chemical name, quantity held on site, and supplier origin.",
    why: "Procurement records may need to be reconciled with site inventories.",
    recommendation: "Check whether supplier master data captures the required origin detail.",
  },
  {
    regulationId: "demo-climate-disclosure",
    changeType: "REPORTING_DEADLINE",
    riskScore: 49,
    summary: "The sample annual climate filing deadline moves forward by 30 days.",
    oldText: "Submit the annual filing by 30 June.",
    newText: "Submit the annual filing by 31 May.",
    why: "Earlier submission leaves less time for data collection and approvals.",
    recommendation: "Move internal data requests and review milestones forward.",
  },
  {
    regulationId: "demo-recycling-targets",
    changeType: "REPORTING_FORMAT",
    riskScore: 38,
    summary: "A sample recycling return adds material-level breakdowns.",
    oldText: "Report total recycled material by weight.",
    newText: "Report recycled material by weight and by material type.",
    why: "Aggregated recycling totals may not be sufficient for the new sample format.",
    recommendation: "Confirm waste vendors can provide a material-level breakdown.",
  },
  {
    regulationId: "demo-sustainability-reporting",
    changeType: "ASSURANCE",
    riskScore: 55,
    summary: "The sample sustainability statement adds an internal evidence review.",
    oldText: "Submit management-approved sustainability metrics.",
    newText: "Submit management-approved sustainability metrics with an internal evidence review.",
    why: "Metric owners need traceable support before the statement is approved.",
    recommendation: "Add evidence checks to the data-owner sign-off process.",
  },
  {
    regulationId: "demo-solvent-emissions",
    changeType: "THRESHOLD_CHANGE",
    riskScore: 68,
    summary: "The sample solvent-use trigger falls from 10 to 8 tonnes per year.",
    oldText: "Record solvent use when annual consumption exceeds 10 tonnes.",
    newText: "Record solvent use when annual consumption exceeds 8 tonnes.",
    why: "Additional processes may cross the sample monitoring trigger.",
    recommendation: "Recalculate annual solvent use for each process line.",
  },
  {
    regulationId: "demo-water-reuse",
    changeType: "PLAN_REQUIREMENT",
    riskScore: 34,
    summary: "The sample water plan now records reuse volumes by process.",
    oldText: "Record total facility water reuse annually.",
    newText: "Record facility water reuse annually and attribute volumes by process.",
    why: "Process-level metering may be needed to support the revised plan.",
    recommendation: "Identify processes without reuse measurements and assess data gaps.",
  },
  {
    regulationId: "demo-carbon-border",
    changeType: "DATA_REQUIREMENT",
    riskScore: 79,
    summary: "The sample border filing adds a product-level emissions intensity field.",
    oldText: "Report total embedded emissions for each product group.",
    newText: "Report embedded emissions and emissions intensity for each product line.",
    why: "Product-level data may require new calculations and supplier inputs.",
    recommendation: "Map product lines to emissions factors and document data sources.",
  },
  {
    regulationId: "demo-battery-recycling",
    changeType: "TAKEBACK_SCOPE",
    riskScore: 46,
    summary: "The sample recovery program expands to include industrial battery packs.",
    oldText: "Accept returned portable battery units.",
    newText: "Accept returned portable and industrial battery units.",
    why: "Product return planning may need to cover larger battery formats.",
    recommendation: "Review product catalog and reverse-logistics coverage.",
  },
];

export const changes = changeSeeds.map((seed, index) => {
  const regulation = regulations.find((item) => item.id === seed.regulationId)!;
  const facility = facilities[index % facilities.length]!;
  return {
    id: `change-${String(index + 1).padStart(3, "0")}`,
    regulationId: regulation.id,
    regulationTitle: regulation.title,
    jurisdiction: regulation.jurisdiction,
    changeType: seed.changeType,
    detectedDate: `2026-${String(9 - Math.floor(index / 3)).padStart(2, "0")}-${String(23 - index).padStart(2, "0")}`,
    effectiveDate: regulation.effectiveDate,
    riskLevel: levelFor(seed.riskScore),
    riskScore: seed.riskScore,
    summary: seed.summary,
    oldText: seed.oldText,
    newText: seed.newText,
    whyItMatters: seed.why,
    products: facility.products,
    facilities: [facility.name],
    processes: facility.processes.slice(0, 2),
    suppliers: ["Packaging and materials suppliers", "Environmental testing partners"],
    recommendedAction: seed.recommendation,
    source: sources,
    confidence: seed.riskScore >= 70 ? 0.9 : 0.84,
  };
});

export const getSeedActions = () => {
  const seedRows = [
    ["Review emissions against revised reporting threshold", "Confirm whether each site exceeds the 75-ton sample threshold and document the result.", "demo-industrial-emissions", "facility-hyderabad", "Priya Nair", "CRITICAL", "IN_PROGRESS", 12],
    ["Update monthly discharge sampling calendar", "Coordinate monthly sampling and retain laboratory reports.", "demo-water-discharge", "facility-chennai", "Arjun Rao", "HIGH", "OPEN", 18],
    ["Reconcile packaging recovery evidence", "Collect material weights and recovery certificates from vendors.", "demo-packaging-epr", "facility-mumbai", "Meera Shah", "MEDIUM", "OPEN", 24],
    ["Extend hazardous-waste record retention", "Update the retention schedule and confirm archived transfer evidence.", "demo-hazardous-waste", "facility-chennai", "Sanjay Menon", "HIGH", "BLOCKED", 28],
    ["Confirm supplier emissions data owners", "Assign owners for product-level emissions intensity inputs.", "demo-carbon-border", "facility-bangalore", "Kavya Iyer", "HIGH", "OPEN", 32],
    ["Review boiler efficiency readings", "Compare current site readings with the sample benchmark.", "demo-energy-efficiency", "facility-hyderabad", "Dev Patel", "MEDIUM", "COMPLETED", -2],
    ["Add annual control review to permit calendar", "Document the yearly inspection and sign-off for emission controls.", "demo-air-quality", "facility-bangalore", "Ananya Das", "HIGH", "IN_PROGRESS", 36],
    ["Validate solvent-use inventory", "Recalculate annual consumption by process line against the revised trigger.", "demo-solvent-emissions", "facility-chennai", "Rohan Kulkarni", "HIGH", "OPEN", 41],
    ["Reconcile chemical supplier-origin records", "Check that supplier origin is captured for materials held on site.", "demo-chemical-inventory", "facility-hyderabad", "Ishita Bose", "MEDIUM", "OPEN", 46],
    ["Prepare earlier climate filing milestones", "Move internal data collection and review dates forward.", "demo-climate-disclosure", "facility-bangalore", "Vikram Joshi", "MEDIUM", "OPEN", 52],
    ["Set up process-level reuse measurements", "Identify water reuse processes without a supporting measurement.", "demo-water-reuse", "facility-chennai", "Neha Kapoor", "LOW", "OPEN", 58],
    ["Check internal evidence-review coverage", "Verify metric owners attach supporting evidence before approval.", "demo-sustainability-reporting", null, "Aarav Singh", "MEDIUM", "COMPLETED", -5],
  ] as const;
  const now = new Date();
  return seedRows.map(([title, description, regulationId, facilityId, assignedTo, priority, status, daysFromNow], index) => {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    return {
      id: `seed-action-${String(index + 1).padStart(3, "0")}`,
      title,
      description,
      regulationId,
      facilityId,
      assignedTo,
      priority,
      status,
      dueDate: dueDate.toISOString().slice(0, 10),
      createdAt: new Date(now.getTime() - (index + 1) * 86400000).toISOString(),
    };
  });
};

type RiskFactors = { scope: number; severity: number; proximity: number; obligation: number; exposure: number };
const baselineRegulationScores=new Map(regulations.map(regulation=>[regulation.id,regulation.riskScore]));
const baselineFacilityScores=new Map(facilities.map(facility=>[facility.id,facility.riskScore]));
const obligationScores:Record<string,number>={EMISSIONS:90,CARBON:88,CLIMATE:76,CHEMICALS:86,WASTE:82,PACKAGING:74,WATER:84,ENERGY:68,AIR_QUALITY:86,RECYCLING:65,SUSTAINABILITY:70};
const calculateRiskScore=(factors:RiskFactors)=>Math.max(0,Math.min(100,Math.round(factors.scope*.15+factors.severity*.25+factors.proximity*.2+factors.obligation*.15+factors.exposure*.25)));
const proximityScore=(dueDate?:string)=>{
  if(!dueDate)return 45;
  const now=new Date();const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000;
  const [year,month,day]=dueDate.split("-").map(Number);const days=Date.UTC(year!,month!-1,day!)/86400000-today;
  return days<0?100:days<=14?90:days<=30?80:days<=90?70:days<=365?55:35;
};
const avg=(values:number[],fallback=45)=>values.length?Math.round(values.reduce((total,value)=>total+value,0)/values.length):fallback;

export const buildRisks = () => {
  const openSeedActions=getSeedActions().filter(action=>action.status!=="COMPLETED");
  const actionsFor=(predicate:(action:ReturnType<typeof getSeedActions>[number])=>boolean)=>openSeedActions.filter(predicate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const factorsForRegulation=(regulation:typeof regulations[number]):RiskFactors=>{
    const linkedFacilities=facilities.filter(facility=>facility.regulationIds.includes(regulation.id));
    const nearestAction=actionsFor(action=>action.regulationId===regulation.id)[0];
    return {
      scope:Math.round(linkedFacilities.length/Math.max(1,facilities.length)*100),
      severity:baselineRegulationScores.get(regulation.id)??50,
      proximity:proximityScore(nearestAction?.dueDate||regulation.effectiveDate),
      obligation:obligationScores[regulation.category]??60,
      exposure:avg(linkedFacilities.map(facility=>baselineFacilityScores.get(facility.id)??50)),
    };
  };
  const factorsForFacility=(facility:typeof facilities[number]):RiskFactors=>{
    const linkedRegulations=regulations.filter(regulation=>facility.regulationIds.includes(regulation.id));
    const nearestAction=actionsFor(action=>action.facilityId===facility.id)[0];
    return {
      scope:Math.min(100,facility.regulationIds.length*20),
      severity:Math.max(0,...linkedRegulations.map(regulation=>baselineRegulationScores.get(regulation.id)??50)),
      proximity:proximityScore(nearestAction?.dueDate),
      obligation:Math.min(100,45+facility.regulationIds.length*12),
      exposure:Math.min(100,Math.round(facility.emissions/150*40+facility.waterUsage/100000*30+facility.energy/20000*30)),
    };
  };

  for(const regulation of regulations){
    const score=calculateRiskScore(factorsForRegulation(regulation));
    Object.assign(regulation,{riskScore:score,riskLevel:levelFor(score)});
  }
  for(const facility of facilities){
    facility.riskScore=calculateRiskScore(factorsForFacility(facility));
    facility.riskLevel=levelFor(facility.riskScore);
  }

  const regulationRisks=regulations.map(regulation=>{
    const factorScores=factorsForRegulation(regulation);
    return {
      id:`risk-${regulation.id}`,entityType:"Regulation",entityId:regulation.id,name:regulation.title,
      score:calculateRiskScore(factorScores),level:levelFor(calculateRiskScore(factorScores)),factorScores,
      impact:`${regulation.category.replaceAll("_"," ").toLowerCase()} obligations may affect facilities within the stated demo scope.`,
      recommendedAction:"Confirm applicability and record the facility-level assessment.",
    };
  });
  const facilityRisks=facilities.map(facility=>{
    const factorScores=factorsForFacility(facility);
    return {
      id:`risk-${facility.id}`,entityType:"Facility",entityId:facility.id,name:facility.name,
      score:calculateRiskScore(factorScores),level:levelFor(calculateRiskScore(factorScores)),factorScores,
      impact:`Sample operating profile includes ${facility.emissions} tons CO2e/year and ${facility.waterUsage.toLocaleString()} m³/year water use.`,
      recommendedAction:"Review the facility's related regulations and open actions.",
    };
  });
  const productRisks=facilities.flatMap(facility=>facility.products.map((product,index)=>{
    const base=factorsForFacility(facility);
    const factorScores={...base,scope:Math.min(100,base.scope+10+index*5)};
    const score=calculateRiskScore(factorScores);
    return {id:`risk-product-${facility.id}-${index}`,entityType:"Product",entityId:facility.id,name:product,score,level:levelFor(score),factorScores,impact:`Product exposure is assessed against the obligations linked to ${facility.name}.`,recommendedAction:"Confirm product reporting and supplier evidence for the linked facility."};
  }));
  const processRisks=facilities.flatMap(facility=>facility.processes.map((process,index)=>{
    const base=factorsForFacility(facility);
    const factorScores={...base,scope:Math.min(100,base.scope+15+index*5)};
    const score=calculateRiskScore(factorScores);
    return {id:`risk-process-${facility.id}-${index}`,entityType:"Process",entityId:facility.id,name:process,score,level:levelFor(score),factorScores,impact:`Process exposure is assessed against the obligations linked to ${facility.name}.`,recommendedAction:"Verify process controls, measurements, and records at the linked facility."};
  }));
  return [...regulationRisks,...facilityRisks,...productRisks,...processRisks];
};

export const changeTrend = [
  { month: "May", changes: 4 },
  { month: "Jun", changes: 7 },
  { month: "Jul", changes: 5 },
  { month: "Aug", changes: 9 },
  { month: "Sep", changes: 12 },
  { month: "Oct", changes: 15 },
];

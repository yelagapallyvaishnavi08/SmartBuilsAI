// Smart Build AI — construction planning engine
// Includes location-based pricing, AI-style suggestions, and budget comparison

export interface CalcInput {
  built_up_area: number; // sq yards
  floors: string; // e.g. "G+2"
  days?: number;
  workers?: number;
  daily_wage: number;
  cost_per_sq_yard: number;
  location?: string; // city key from LOCATIONS
  quality?: "economy" | "standard" | "premium";
  budget?: number; // optional target budget
}

export interface LocationInfo {
  key: string;
  name: string;
  region: string;
  cost_multiplier: number; // applied to material rate
  wage_multiplier: number; // applied to labor wage
}

export const LOCATIONS: LocationInfo[] = [
  { key: "hyderabad", name: "Hyderabad", region: "Telangana", cost_multiplier: 1.0, wage_multiplier: 1.0 },
  { key: "bangalore", name: "Bangalore", region: "Karnataka", cost_multiplier: 1.18, wage_multiplier: 1.15 },
  { key: "mumbai", name: "Mumbai", region: "Maharashtra", cost_multiplier: 1.35, wage_multiplier: 1.25 },
  { key: "delhi", name: "Delhi NCR", region: "Delhi", cost_multiplier: 1.22, wage_multiplier: 1.18 },
  { key: "chennai", name: "Chennai", region: "Tamil Nadu", cost_multiplier: 1.08, wage_multiplier: 1.05 },
  { key: "pune", name: "Pune", region: "Maharashtra", cost_multiplier: 1.15, wage_multiplier: 1.12 },
  { key: "kolkata", name: "Kolkata", region: "West Bengal", cost_multiplier: 0.95, wage_multiplier: 0.92 },
  { key: "ahmedabad", name: "Ahmedabad", region: "Gujarat", cost_multiplier: 0.98, wage_multiplier: 0.95 },
  { key: "vizag", name: "Visakhapatnam", region: "Andhra Pradesh", cost_multiplier: 0.92, wage_multiplier: 0.9 },
  { key: "tier3", name: "Tier-3 City / Town", region: "Other", cost_multiplier: 0.82, wage_multiplier: 0.8 },
];

const QUALITY_MULT: Record<NonNullable<CalcInput["quality"]>, number> = {
  economy: 0.85,
  standard: 1.0,
  premium: 1.3,
};

export interface CalcResult {
  input: CalcInput & { num_floors: number };
  location: LocationInfo;
  workers: {
    total: number;
    masons: number;
    helpers: number;
    steel_workers: number;
    carpenters: number;
    supervisors: number;
    total_labour_days: number;
  };
  timeline: { days: number; weeks: number; months: number };
  cost: {
    labor: number;
    material: number;
    overhead: number;
    total: number;
    per_sq_yard: number;
    breakdown: { label: string; value: number; pct: number; color: string }[];
  };
  materials: { steel_tons: number; cement_bags: number; sand_tons: number; bricks: number; water_liters: number };
  blueprint: FloorPlan[];
  schedule: ScheduleItem[];
  assumptions: { daily_wage: number; cost_per_sq_yard: number; num_floors: number; floors_str: string; quality: string };
  suggestions: Suggestion[];
  budget?: BudgetComparison;
}

export interface Room {
  name: string;
  short: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  hasDoor?: boolean;
  hasWindow?: boolean;
}
export interface FloorPlan {
  name: string;
  rooms: Room[];
  totalWidth: number;
  totalHeight: number;
}
export interface ScheduleItem {
  week: number;
  title: string;
  tasks: string[];
  duration_weeks: number;
}
export interface Suggestion {
  type: "saving" | "warning" | "tip" | "info";
  title: string;
  detail: string;
  impact?: string;
}
export interface BudgetComparison {
  budget: number;
  estimated: number;
  variance: number; // estimated - budget
  variance_pct: number;
  status: "under" | "on" | "over";
  message: string;
}

const STEEL_KG_PER_SQ_YARD = 10.5;
const CEMENT_BAGS_PER_SQ_YARD = 1.2;
const SAND_TONS_PER_SQ_YARD = 1.8;
const BRICKS_PER_SQ_YARD = 450;
const WATER_PER_SQ_YARD = 1500;
const PRODUCTIVITY_SQ_YARD_PER_DAY = 6;

export function parseFloors(floorsStr: string): number {
  const s = String(floorsStr).toUpperCase().replace(/\s/g, "");
  if (s.includes("+")) return parseInt(s.split("+")[1] || "0", 10) + 1;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function calculate(raw: CalcInput): CalcResult {
  const area = Math.max(1, Number(raw.built_up_area) || 0);
  const num_floors = parseFloors(raw.floors);
  const total_built = area * num_floors;

  const location = LOCATIONS.find((l) => l.key === raw.location) ?? LOCATIONS[0];
  const quality = raw.quality ?? "standard";
  const qMult = QUALITY_MULT[quality];

  const daily_wage = Math.round((Number(raw.daily_wage) || 500) * location.wage_multiplier);
  const cost_per_sq_yard = Math.round((Number(raw.cost_per_sq_yard) || 1500) * location.cost_multiplier * qMult);

  const complexity = 1 + (num_floors - 1) * 0.08;
  const baseline_labour_days = Math.ceil((total_built / PRODUCTIVITY_SQ_YARD_PER_DAY) * complexity);

  let days: number;
  let total_workers: number;
  if (raw.days && raw.days > 0) {
    days = raw.days;
    total_workers = Math.max(8, Math.ceil(baseline_labour_days / days));
  } else if (raw.workers && raw.workers > 0) {
    total_workers = raw.workers;
    days = Math.ceil(baseline_labour_days / total_workers);
  } else {
    days = Math.ceil(baseline_labour_days / 50);
    total_workers = Math.max(20, Math.ceil(baseline_labour_days / days));
  }
  const total_labour_days = total_workers * days;

  const masons = Math.round(total_workers * 0.3);
  const helpers = Math.round(total_workers * 0.4);
  const steel_workers = Math.round(total_workers * 0.13);
  const carpenters = Math.round(total_workers * 0.12);
  const supervisors = Math.max(1, total_workers - masons - helpers - steel_workers - carpenters);

  const labor = total_workers * days * daily_wage;
  const material = total_built * cost_per_sq_yard;
  const overhead = Math.round((labor + material) * 0.1);
  const total = labor + material + overhead;

  const breakdown = [
    { label: "Material", value: material, pct: (material / total) * 100, color: "oklch(0.55 0.18 255)" },
    { label: "Labor", value: labor, pct: (labor / total) * 100, color: "oklch(0.74 0.16 60)" },
    { label: "Overhead", value: overhead, pct: (overhead / total) * 100, color: "oklch(0.65 0.12 160)" },
  ];

  const materials = {
    steel_tons: +((total_built * STEEL_KG_PER_SQ_YARD) / 1000).toFixed(2),
    cement_bags: Math.ceil(total_built * CEMENT_BAGS_PER_SQ_YARD),
    sand_tons: Math.ceil(total_built * SAND_TONS_PER_SQ_YARD),
    bricks: Math.ceil(total_built * BRICKS_PER_SQ_YARD),
    water_liters: Math.ceil(total_built * WATER_PER_SQ_YARD),
  };

  const blueprint = buildBlueprint(area, num_floors);
  const weeks = Math.max(8, Math.ceil(days / 7));
  const schedule = buildSchedule(num_floors, weeks);

  const suggestions = buildSuggestions({ raw, total, labor, material, days, total_workers, num_floors, area, location, quality });

  const budget = raw.budget && raw.budget > 0 ? compareBudget(raw.budget, total) : undefined;

  return {
    input: { ...raw, num_floors },
    location,
    workers: { total: total_workers, masons, helpers, steel_workers, carpenters, supervisors, total_labour_days },
    timeline: { days, weeks, months: Math.max(1, Math.round(days / 30)) },
    cost: { labor, material, overhead, total, per_sq_yard: Math.round(total / area), breakdown },
    materials,
    blueprint,
    schedule,
    assumptions: { daily_wage, cost_per_sq_yard, num_floors, floors_str: String(raw.floors), quality },
    suggestions,
    budget,
  };
}

// ---------- Advanced Blueprint (positioned rooms) ----------
function buildBlueprint(area: number, numFloors: number): FloorPlan[] {
  const scale = Math.sqrt(area / 1000);
  // Reference plot 60' x 50' for 1000 sqyd
  const W = +(60 * scale).toFixed(1);
  const H = +(50 * scale).toFixed(1);

  const colors = {
    bedroom: "oklch(0.85 0.06 60)",
    living: "oklch(0.86 0.05 160)",
    kitchen: "oklch(0.88 0.07 90)",
    bath: "oklch(0.85 0.05 220)",
    balcony: "oklch(0.92 0.03 145)",
    utility: "oklch(0.9 0.02 280)",
  };

  const ground = (label: string): FloorPlan => ({
    name: label,
    totalWidth: W,
    totalHeight: H,
    rooms: [
      { name: "Living Room", short: "LIVING", width: W * 0.45, height: H * 0.55, x: 0, y: 0, color: colors.living, hasDoor: true, hasWindow: true },
      { name: "Kitchen", short: "KITCHEN", width: W * 0.3, height: H * 0.4, x: W * 0.45, y: 0, color: colors.kitchen, hasWindow: true },
      { name: "Utility", short: "UTILITY", width: W * 0.25, height: H * 0.4, x: W * 0.75, y: 0, color: colors.utility },
      { name: "Master Bedroom", short: "BED 1", width: W * 0.4, height: H * 0.45, x: 0, y: H * 0.55, color: colors.bedroom, hasWindow: true },
      { name: "Bedroom 2", short: "BED 2", width: W * 0.3, height: H * 0.45, x: W * 0.4, y: H * 0.55, color: colors.bedroom, hasWindow: true },
      { name: "Bathroom", short: "WC", width: W * 0.15, height: H * 0.25, x: W * 0.7, y: H * 0.4, color: colors.bath },
      { name: "Bathroom 2", short: "WC", width: W * 0.15, height: H * 0.35, x: W * 0.85, y: H * 0.4, color: colors.bath },
      { name: "Balcony", short: "BALCONY", width: W * 0.3, height: H * 0.15, x: W * 0.7, y: H * 0.85, color: colors.balcony },
    ],
  });

  const upper = (label: string): FloorPlan => ({
    name: label,
    totalWidth: W,
    totalHeight: H,
    rooms: [
      { name: "Master Bedroom", short: "BED 1", width: W * 0.4, height: H * 0.5, x: 0, y: 0, color: colors.bedroom, hasWindow: true, hasDoor: true },
      { name: "Bedroom 2", short: "BED 2", width: W * 0.3, height: H * 0.5, x: W * 0.4, y: 0, color: colors.bedroom, hasWindow: true },
      { name: "Bedroom 3", short: "BED 3", width: W * 0.3, height: H * 0.5, x: W * 0.7, y: 0, color: colors.bedroom, hasWindow: true },
      { name: "Family Hall", short: "HALL", width: W * 0.5, height: H * 0.5, x: 0, y: H * 0.5, color: colors.living, hasWindow: true },
      { name: "Bathroom", short: "WC", width: W * 0.2, height: H * 0.25, x: W * 0.5, y: H * 0.5, color: colors.bath },
      { name: "Bathroom", short: "WC", width: W * 0.2, height: H * 0.25, x: W * 0.5, y: H * 0.75, color: colors.bath },
      { name: "Balcony", short: "BALCONY", width: W * 0.3, height: H * 0.5, x: W * 0.7, y: H * 0.5, color: colors.balcony, hasDoor: true },
    ],
  });

  const out: FloorPlan[] = [];
  for (let i = 0; i < numFloors; i++) {
    out.push(i === 0 ? ground("Ground Floor") : upper(`Floor ${i + 1}`));
  }
  return out;
}

// ---------- Schedule with weekly durations ----------
function buildSchedule(numFloors: number, totalWeeks: number): ScheduleItem[] {
  const items: { title: string; tasks: string[]; weight: number }[] = [
    { title: "Site Preparation", tasks: ["Site clearing", "Leveling", "Setting up temporary facilities"], weight: 1 },
    { title: "Foundation Work", tasks: ["Excavation", "Foundation laying", "Concrete curing"], weight: 2 },
  ];
  for (let i = 0; i < numFloors; i++) {
    items.push({
      title: i === 0 ? "Ground Floor Slab" : `Floor ${i + 1} Slab`,
      tasks: ["Formwork", "Reinforcement", "Concrete pour", "Curing"],
      weight: 2,
    });
  }
  items.push(
    { title: "Brickwork & Masonry", tasks: ["Brick laying", "Plastering prep"], weight: 2 },
    { title: "Plastering", tasks: ["Wall plastering", "Ceiling plastering"], weight: 1.5 },
    { title: "Electrical Installation", tasks: ["Wiring", "Switchboards", "Fixtures", "Safety check"], weight: 1.5 },
    { title: "Plumbing & Sanitary", tasks: ["Pipework", "Fixtures", "Water testing"], weight: 1.5 },
    { title: "Painting & Finishing", tasks: ["Primer", "Base paint", "Color application"], weight: 1.5 },
    { title: "Doors, Windows & Hardware", tasks: ["Doors", "Windows", "Glass fitting"], weight: 1 },
    { title: "Final Cleanup & Handover", tasks: ["Polishing", "Inspection", "Handover"], weight: 1 }
  );

  const totalWeight = items.reduce((s, it) => s + it.weight, 0);
  let week = 1;
  return items.map((it) => {
    const dur = Math.max(1, Math.round((it.weight / totalWeight) * totalWeeks));
    const item: ScheduleItem = { week, title: it.title, tasks: it.tasks, duration_weeks: dur };
    week += dur;
    return item;
  });
}

// ---------- Suggestions engine ----------
function buildSuggestions(ctx: {
  raw: CalcInput;
  total: number;
  labor: number;
  material: number;
  days: number;
  total_workers: number;
  num_floors: number;
  area: number;
  location: LocationInfo;
  quality: string;
}): Suggestion[] {
  const out: Suggestion[] = [];
  const { total, labor, material, days, total_workers, num_floors, area, location, quality, raw } = ctx;

  // Quality-based suggestions
  if (quality === "premium") {
    out.push({
      type: "saving",
      title: "Switch finishes to standard for partial saving",
      detail: "Premium finishes add ~30% to material cost. Mixing standard finishes in low-traffic rooms can reduce overall cost.",
      impact: `Save up to ${formatINR(material * 0.18)}`,
    });
  }
  if (quality === "economy") {
    out.push({
      type: "tip",
      title: "Consider standard quality for living areas",
      detail: "Economy finishes show wear in 5–7 years. Upgrading living/dining only adds modest cost.",
    });
  }

  // Location insights
  if (location.cost_multiplier >= 1.2) {
    out.push({
      type: "info",
      title: `${location.name} is a high-cost market`,
      detail: `Material prices run ~${Math.round((location.cost_multiplier - 1) * 100)}% above the national baseline. Bulk-ordering steel & cement upfront can lock in rates.`,
    });
  } else if (location.cost_multiplier < 1) {
    out.push({
      type: "info",
      title: `${location.name} offers cost advantages`,
      detail: `Local rates are ~${Math.round((1 - location.cost_multiplier) * 100)}% below baseline. Use the savings for better fixtures or contingency.`,
    });
  }

  // Labor density
  const laborRatio = labor / total;
  if (laborRatio > 0.35) {
    out.push({
      type: "warning",
      title: "Labor cost share is high",
      detail: `Labor is ${Math.round(laborRatio * 100)}% of total. Increasing workers can shorten timeline but raise overhead. Re-check the day vs worker balance.`,
    });
  }

  // Timeline
  if (days < 60 && area >= 800) {
    out.push({
      type: "warning",
      title: "Aggressive timeline detected",
      detail: `Building ${area} sq.yd × ${num_floors} floors in ${days} days needs tight coordination. Add a 10% buffer for monsoon/curing delays.`,
    });
  }
  if (days > 200) {
    out.push({
      type: "tip",
      title: "Long timeline — consider phased handover",
      detail: "Completing ground floor first lets you move in while upper floors finish, reducing rental overlap.",
    });
  }

  // Workforce
  if (total_workers > 80) {
    out.push({
      type: "tip",
      title: "Large crew — assign zone supervisors",
      detail: `${total_workers} workers is large. Adding 1 supervisor per 15 workers improves quality control and reduces rework.`,
    });
  }

  // Floors
  if (num_floors >= 3) {
    out.push({
      type: "info",
      title: "Multi-storey requires structural review",
      detail: "G+2 and above typically need a licensed structural engineer's seal and soil testing before foundation.",
    });
  }

  // Material bulk saving
  out.push({
    type: "saving",
    title: "Bulk order cement & steel",
    detail: "Ordering all cement/steel in 1–2 lots instead of weekly typically saves 4–7% on material cost.",
    impact: `Potential save ${formatINR(material * 0.05)}`,
  });

  // Sustainability tip
  out.push({
    type: "tip",
    title: "Add rainwater harvesting now",
    detail: "Adding RWH during foundation costs ~₹40k vs ₹1.5L+ retrofitted. Mandatory in many municipalities.",
  });

  return out;
}

function compareBudget(budget: number, estimated: number): BudgetComparison {
  const variance = estimated - budget;
  const variance_pct = (variance / budget) * 100;
  let status: BudgetComparison["status"];
  let message: string;
  if (variance_pct <= -2) {
    status = "under";
    message = `You are ₹${formatNumber(Math.abs(variance))} under budget (${Math.abs(variance_pct).toFixed(1)}%). Use the surplus for upgrades or contingency.`;
  } else if (variance_pct >= 2) {
    status = "over";
    message = `Estimate exceeds budget by ₹${formatNumber(variance)} (${variance_pct.toFixed(1)}%). Consider reducing area, switching to standard finishes, or extending timeline.`;
  } else {
    status = "on";
    message = "Estimate is on budget. Keep a 10% contingency reserved for unforeseen costs.";
  }
  return { budget, estimated, variance, variance_pct, status, message };
}

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

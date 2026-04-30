// Construction planning calculation engine
// Ported from the BuildAI Pro Python reference

export interface CalcInput {
  built_up_area: number; // sq yards
  floors: string; // e.g. "G+2"
  days?: number;
  workers?: number;
  daily_wage: number;
  cost_per_sq_yard: number;
}

export interface CalcResult {
  input: CalcInput & { num_floors: number };
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
  cost: { labor: number; material: number; overhead: number; total: number; per_sq_yard: number };
  materials: { steel_tons: number; cement_bags: number; sand_tons: number; water_liters: number };
  blueprint: FloorPlan[];
  schedule: ScheduleItem[];
  assumptions: { daily_wage: number; cost_per_sq_yard: number; num_floors: number; floors_str: string };
}

export interface Room {
  name: string;
  short: string;
  width: number;
  height: number;
}
export interface FloorPlan {
  name: string;
  rooms: Room[];
}
export interface ScheduleItem {
  week: number;
  title: string;
  tasks: string[];
}

const STEEL_KG_PER_SQ_YARD = 10.5; // kg
const CEMENT_BAGS_PER_SQ_YARD = 1.2;
const SAND_TONS_PER_SQ_YARD = 1.8;
const WATER_PER_SQ_YARD = 1500; // liters
const PRODUCTIVITY_SQ_YARD_PER_DAY = 6; // per worker per day baseline

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
  const daily_wage = Number(raw.daily_wage) || 500;
  const cost_per_sq_yard = Number(raw.cost_per_sq_yard) || 1500;

  // Labour days: baseline productivity, scaled by floor complexity
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
    // default: target ~84 days for 1000sqyd G+2 reference
    days = Math.ceil(baseline_labour_days / 50);
    total_workers = Math.max(20, Math.ceil(baseline_labour_days / days));
  }
  const total_labour_days = total_workers * days;

  // Worker breakdown
  const masons = Math.round(total_workers * 0.30);
  const helpers = Math.round(total_workers * 0.40);
  const steel_workers = Math.round(total_workers * 0.13);
  const carpenters = Math.round(total_workers * 0.12);
  const supervisors = Math.max(1, total_workers - masons - helpers - steel_workers - carpenters);

  // Costs
  const labor = total_workers * days * daily_wage;
  const material = total_built * cost_per_sq_yard;
  const overhead = Math.round((labor + material) * 0.10);
  const total = labor + material + overhead;

  // Materials
  const materials = {
    steel_tons: +(total_built * STEEL_KG_PER_SQ_YARD / 1000).toFixed(2),
    cement_bags: Math.ceil(total_built * CEMENT_BAGS_PER_SQ_YARD),
    sand_tons: Math.ceil(total_built * SAND_TONS_PER_SQ_YARD),
    water_liters: Math.ceil(total_built * WATER_PER_SQ_YARD),
  };

  // Blueprint — generate per-floor room layout scaled to area
  const scale = Math.sqrt(area / 1000); // 1000 sq yd reference
  const room = (name: string, short: string, w: number, h: number): Room => ({
    name,
    short,
    width: +(w * scale).toFixed(1),
    height: +(h * scale).toFixed(1),
  });
  const standardFloor = (label: string): FloorPlan => ({
    name: label,
    rooms: [
      room("Master Bedroom", "Bed 1", 10.5, 15.8),
      room("Bedroom 2", "Bed 2", 10.5, 15.8),
      room("Living Room", "Hall", 12.6, 19.0),
      room("Kitchen", "KT", 8.4, 12.6),
      room("Bathroom", "WC", 6.3, 9.5),
      room("Balcony", "Bal", 9.5, 9.5),
    ],
  });
  const blueprint: FloorPlan[] = [];
  for (let i = 0; i < num_floors; i++) {
    const label = i === 0 ? "Ground Floor" : `Floor ${i + 1}`;
    blueprint.push(standardFloor(label));
  }

  // Schedule — weeks scale with floors
  const weeks = Math.max(8, Math.ceil(days / 7));
  const schedule: ScheduleItem[] = buildSchedule(num_floors, weeks);

  return {
    input: { ...raw, num_floors },
    workers: { total: total_workers, masons, helpers, steel_workers, carpenters, supervisors, total_labour_days },
    timeline: { days, weeks, months: Math.max(1, Math.round(days / 30)) },
    cost: {
      labor,
      material,
      overhead,
      total,
      per_sq_yard: Math.round(total / area),
    },
    materials,
    blueprint,
    schedule,
    assumptions: { daily_wage, cost_per_sq_yard, num_floors, floors_str: String(raw.floors) },
  };
}

function buildSchedule(numFloors: number, totalWeeks: number): ScheduleItem[] {
  const items: { title: string; tasks: string[] }[] = [
    { title: "Site Preparation", tasks: ["Site clearing", "Leveling", "Setting up temporary facilities"] },
    { title: "Foundation Work", tasks: ["Excavation", "Foundation laying", "Concrete curing"] },
  ];
  for (let i = 0; i < numFloors; i++) {
    items.push({
      title: i === 0 ? "Ground Floor Slab" : `Floor ${i + 1} Slab`,
      tasks: ["Formwork preparation", "Reinforcement placement", "Concrete pouring", "Curing"],
    });
  }
  items.push(
    { title: "Brickwork & Masonry", tasks: ["Brick laying", "Wall plastering prep"] },
    { title: "Plastering", tasks: ["Wall plastering", "Ceiling plastering"] },
    { title: "Electrical Fittings & Installation", tasks: ["Light fixtures", "Switch boards", "Wiring", "Safety check"] },
    { title: "Plumbing & Sanitary", tasks: ["Bathroom fixtures", "Kitchen fittings", "Water testing", "Drainage check"] },
    { title: "Wall Painting & Color Work", tasks: ["Primer coating", "Base paint", "Color application", "Finishing"] },
    { title: "Doors, Windows & Hardware", tasks: ["Door installation", "Window fitting", "Hardware mounting", "Glass fitting"] },
    { title: "Final Finishing & Cleanup", tasks: ["Interior polishing", "Glass cleaning", "Final inspection", "Handover"] }
  );

  // distribute across totalWeeks
  const step = Math.max(1, Math.floor(totalWeeks / items.length));
  return items.map((it, idx) => ({
    week: 1 + idx * step,
    title: it.title,
    tasks: it.tasks,
  }));
}

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

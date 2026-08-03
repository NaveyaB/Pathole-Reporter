import type {
  Complaint,
  ComplaintStatus,
  NotificationItem,
  ActivityLog,
  RoadDamageType,
  Severity,
  User,
} from "../types/index.js";
import { addDays, nowIso, subtractDays, generateId } from "../utils/datetime.js";
import { isMongoConnected } from "../config/db.js";
import { mongoCollections } from "./mongo.js";
import bcrypt from "bcryptjs";

export interface FilterOperator {
  $eq?: unknown;
  $ne?: unknown;
  $in?: unknown[];
  $nin?: unknown[];
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $regex?: RegExp;
  $exists?: boolean;
}

export type Filter<T> = Partial<{
  [K in keyof T]: T[K] | FilterOperator | unknown;
}> & Record<string, unknown>;

export interface FindOptions<T> {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
}

export type UpdateOp<T> = {
  $set?: Record<string, unknown>;
  $push?: Record<string, unknown>;
  $pull?: Record<string, unknown>;
  $inc?: Record<string, number>;
  $unset?: Record<string, boolean>;
};

export interface Collection<T extends { id: string }> {
  create(doc: T): Promise<T>;
  insertMany(docs: T[]): Promise<T[]>;
  find(filter: Filter<T>, options?: FindOptions<T>): Promise<T[]>;
  findOne(filter: Filter<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  updateById(id: string, update: UpdateOp<T>): Promise<T | null>;
  updateOne(filter: Filter<T>, update: UpdateOp<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  count(filter?: Filter<T>): Promise<number>;
  all(): Promise<T[]>;
}

const getValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const matchesOperator = (value: unknown, op: FilterOperator): boolean => {
  if (op.$eq !== undefined) return value === op.$eq;
  if (op.$ne !== undefined) return value !== op.$ne;
  if (op.$in !== undefined) return Array.isArray(op.$in) && op.$in.includes(value);
  if (op.$nin !== undefined) return Array.isArray(op.$nin) && !op.$nin.includes(value);
  if (op.$gt !== undefined) return (value as number) > (op.$gt as number);
  if (op.$gte !== undefined) return (value as number) >= (op.$gte as number);
  if (op.$lt !== undefined) return (value as number) < (op.$lt as number);
  if (op.$lte !== undefined) return (value as number) <= (op.$lte as number);
  if (op.$regex !== undefined) {
    return op.$regex.test(String(value ?? ""));
  }
  if (op.$exists !== undefined) return (value !== undefined && value !== null) === op.$exists;
  return true;
};

const matches = <T extends { id: string }>(doc: T, filter: Filter<T>): boolean => {
  return Object.entries(filter).every(([key, condition]) => {
    const value = getValue(doc as unknown as Record<string, unknown>, key);
    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      const op = condition as FilterOperator;
      const hasOp = ["$eq", "$ne", "$in", "$nin", "$gt", "$gte", "$lt", "$lte", "$regex", "$exists"].some(
        (k) => k in op
      );
      if (hasOp) return matchesOperator(value, op);
    }
    return value === condition;
  });
};

const applyUpdate = <T extends { id: string }>(doc: T, update: UpdateOp<T>): T => {
  const cloned = JSON.parse(JSON.stringify(doc)) as T;
  if ("$set" in update && update.$set) {
    Object.entries(update.$set).forEach(([k, v]) => {
      (cloned as unknown as Record<string, unknown>)[k] = v;
    });
  }
  if ("$inc" in update && update.$inc) {
    Object.entries(update.$inc).forEach(([k, v]) => {
      const key = k as keyof T;
      (cloned[key] as unknown as number) = ((cloned[key] as number) ?? 0) + (v as number);
    });
  }
  if ("$push" in update && update.$push) {
    Object.entries(update.$push).forEach(([k, v]) => {
      const key = k as keyof T;
      const arr = (cloned[key] as unknown as unknown[]) ?? [];
      (cloned[key] as unknown as unknown[]) = [...arr, v];
    });
  }
  if ("$unset" in update && update.$unset) {
    Object.entries(update.$unset).forEach(([k]) => {
      const key = k as keyof T;
      delete (cloned as unknown as Record<string, unknown>)[k];
    });
  }
  return cloned;
};

class MemoryCollectionImpl<T extends { id: string }> implements Collection<T> {
  private docs = new Map<string, T>();

  async create(doc: T): Promise<T> {
    this.docs.set(doc.id, JSON.parse(JSON.stringify(doc)) as T);
    return doc;
  }

  async insertMany(docs: T[]): Promise<T[]> {
    docs.forEach((d) => this.docs.set(d.id, JSON.parse(JSON.stringify(d)) as T));
    return docs;
  }

  async find(filter: Filter<T>, options: FindOptions<T> = {}): Promise<T[]> {
    let result = Array.from(this.docs.values()).filter((d) => matches(d, filter));

    if (options.sort) {
      const entries = Object.entries(options.sort) as Array<[string, 1 | -1]>;
      result = result.sort((a, b) => {
        for (const [key, dir] of entries) {
          const av = getValue(a as unknown as Record<string, unknown>, key);
          const bv = getValue(b as unknown as Record<string, unknown>, key);
          if (av === bv) continue;
          const cmp = av === undefined || av === null ? -1 : bv === undefined || bv === null ? 1 : av > bv ? 1 : -1;
          return cmp * dir;
        }
        return 0;
      });
    }

    if (options.skip) result = result.slice(options.skip);
    if (options.limit) result = result.slice(0, options.limit);
    return result;
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    return Array.from(this.docs.values()).find((d) => matches(d, filter)) ?? null;
  }

  async findById(id: string): Promise<T | null> {
    return this.docs.get(id) ?? null;
  }

  async updateById(id: string, update: UpdateOp<T>): Promise<T | null> {
    const doc = this.docs.get(id);
    if (!doc) return null;
    const updated = applyUpdate(doc, update);
    this.docs.set(id, updated);
    return updated;
  }

  async updateOne(filter: Filter<T>, update: UpdateOp<T>): Promise<T | null> {
    const doc = Array.from(this.docs.values()).find((d) => matches(d, filter));
    if (!doc) return null;
    const updated = applyUpdate(doc, update);
    this.docs.set(updated.id, updated);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.docs.delete(id);
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return Array.from(this.docs.values()).filter((d) => matches(d, filter)).length;
  }

  async all(): Promise<T[]> {
    return Array.from(this.docs.values());
  }
}

export interface DataStore {
  users: Collection<User>;
  complaints: Collection<Complaint>;
  notifications: Collection<NotificationItem>;
  activityLogs: Collection<ActivityLog>;
}

let store: DataStore | null = null;

export const createMemoryCollection = <T extends { id: string }>(): Collection<T> =>
  new MemoryCollectionImpl<T>();

const createMemoryStore = (): DataStore => ({
  users: createMemoryCollection<User>(),
  complaints: createMemoryCollection<Complaint>(),
  notifications: createMemoryCollection<NotificationItem>(),
  activityLogs: createMemoryCollection<ActivityLog>(),
});

const createStore = (): DataStore => {
  if (isMongoConnected()) {
    console.log("[db] Using MongoDB-backed store");
    return mongoCollections as unknown as DataStore;
  }
  return createMemoryStore();
};

export const getStore = (): DataStore => {
  if (!store) store = createStore();
  return store;
};

export const resetStore = () => {
  store = createStore();
};

export const getUsersStore = () => getStore().users;
export const getComplaintsStore = () => getStore().complaints;
export const getNotificationsStore = () => getStore().notifications;
export const getActivityLogsStore = () => getStore().activityLogs;

export const nextReportNumber = async (): Promise<string> => {
  const complaints = getComplaintsStore();
  const all = await complaints.find({});
  const max = all.reduce((acc, c) => {
    const n = parseInt(c.reportNumber.split("-").pop() ?? "0", 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 1000);
  return `SPR-${(max + 1).toString().padStart(4, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

export interface SeedUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: User["role"];
  district?: string;
  address?: string;
  location?: { lat: number; lng: number };
  contractor?: User["contractor"];
  status?: User["status"];
}

export const districtNames = [
  "Banjara Hills",
  "Hitec City",
  "Gachibowli",
  "Old City",
  "Secunderabad",
  "Madhapur",
  "Ameerpet",
  "Kukatpally",
];

export const complainDraft = (
  overrides: Partial<Complaint>
): Omit<Complaint, "id" | "reportNumber"> => {
  const now = nowIso();
  return {
    title: "Sample road damage",
    description: "",
    images: [],
    location: { lat: 17.385, lng: 78.4867 },
    type: "pothole",
    status: "submitted",
    priority: "medium",
    reporter: "user_missing",
    aiAnalysis: null,
    timestamps: { created: now, updated: now },
    ...overrides,
  };
};

export const seedData = async () => {
  const users = getUsersStore();
  const complaints = getComplaintsStore();
  const notifications = getNotificationsStore();
  const logs = getActivityLogsStore();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const usersFound = await users.count({});
  if (usersFound > 0) return;

  const base = {
    status: "active" as const,
    verified: true,
    createdAt: subtractDays(120),
    updatedAt: subtractDays(10),
  };

  const adminId = generateId("usr");
  const citizenId = generateId("usr");
  const contractorAId = generateId("usr");
  const contractorBId = generateId("usr");
  const contractorCId = generateId("usr");
  const contractorDId = generateId("usr");

  const citizenIds: string[] = [];
  for (let i = 0; i < 8; i++) {
    citizenIds.push(generateId("usr"));
  }

  const userRows: SeedUserInput[] = [
    { name: "Aarav Mehta", email: "admin@demo.com", password: "demo1234", phone: "+91 98480 11223", role: "admin", district: "Hitec City", address: "Municipal HQ, Cyber Towers" },
    { name: "Priya Sharma", email: "citizen@demo.com", password: "demo1234", phone: "+91 90000 11223", role: "citizen", district: "Gachibowli", address: "Flat 402, Lakeview Residency", location: { lat: 17.4401, lng: 78.3489 } },
    { name: "Ram Builders", email: "contractor@demo.com", password: "demo1234", phone: "+91 98490 55667", role: "contractor", district: "Madhapur", contractor: { specialty: "Asphalt & Paving", teamSize: 24, rating: 4.6, completedJobs: 142 } },
    { name: "Metro Road Works", email: "metro@demo.com", password: "demo1234", phone: "+91 97010 44556", role: "contractor", district: "Secunderabad", contractor: { specialty: "Road Reconstruction", teamSize: 18, rating: 4.3, completedJobs: 98 } },
    { name: "City Paving Co", email: "paving@demo.com", password: "demo1234", phone: "+91 99899 77889", role: "contractor", district: "Ameerpet", contractor: { specialty: "Pothole Repair", teamSize: 12, rating: 4.8, completedJobs: 210 } },
    { name: "Green Way Infra", email: "greenway@demo.com", password: "demo1234", phone: "+91 95500 22334", role: "contractor", district: "Kukatpally", contractor: { specialty: "Surface Treatment", teamSize: 9, rating: 4.1, completedJobs: 64 } },
  ];

  const allRows: SeedUserInput[] = [...userRows];
  const extraCitizens: Array<{ name: string; district: string; lat: number; lng: number }> = [
    { name: "Rohit Verma", district: "Banjara Hills", lat: 17.4239, lng: 78.4437 },
    { name: "Sneha Reddy", district: "Hitec City", lat: 17.4435, lng: 78.3772 },
    { name: "Arjun Nair", district: "Old City", lat: 17.3616, lng: 78.4747 },
    { name: "Kavitha Rao", district: "Secunderabad", lat: 17.4399, lng: 78.4983 },
    { name: "Vikram Singh", district: "Madhapur", lat: 17.4483, lng: 78.3915 },
    { name: "Meera Iyer", district: "Ameerpet", lat: 17.4373, lng: 78.4464 },
    { name: "Farhan Ali", district: "Kukatpally", lat: 17.4849, lng: 78.3995 },
    { name: "Divya Menon", district: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  ];
  extraCitizens.forEach((c, i) => {
    allRows.push({
      name: c.name,
      email: `citizen${i + 2}@demo.com`,
      password: "demo1234",
      phone: `+91 91${String(30000 + i * 1377)} ${String(40000 + i * 551)}`,
      role: "citizen",
      district: c.district,
      address: `${12 + i * 3}, ${c.district} Main Road`,
      location: { lat: c.lat, lng: c.lng },
    });
  });

  const insertUsers = async () => {
    let idx = 0;
    for (const row of allRows) {
      const id = idx === 0 ? adminId : idx === 1 ? citizenId : idx === 2 ? contractorAId : idx === 3 ? contractorBId : idx === 4 ? contractorCId : idx === 5 ? contractorDId : citizenIds[idx - 6];
      const user: User = {
        id,
        name: row.name,
        email: row.email.toLowerCase(),
        password: await hash(row.password),
        phone: row.phone,
        role: row.role,
        district: row.district,
        address: row.address,
        location: row.location,
        contractor: row.contractor,
        status: row.status ?? "active",
        verified: true,
        createdAt: subtractDays(150 - idx * 8),
        updatedAt: subtractDays(idx),
      };
      await users.create(user);
      idx++;
    }
  };

  await insertUsers();

  /* ---------- Complaints ---------- */

  const severityPool: Severity[] = ["low", "medium", "high", "critical"];
  const typePool: RoadDamageType[] = ["pothole", "crack", "rutting", "depression", "surface_damage", "edge_damage", "sinkhole"];
  const statusPool: ComplaintStatus[] = ["submitted", "under_review", "verified", "assigned", "in_progress", "completed", "rejected"];

  const locations: Record<string, Array<{ lat: number; lng: number }>> = {
    "Banjara Hills": [{ lat: 17.4239, lng: 78.4437 }, { lat: 17.4212, lng: 78.4477 }, { lat: 17.4268, lng: 78.4403 }],
    "Hitec City": [{ lat: 17.4435, lng: 78.3772 }, { lat: 17.4482, lng: 78.3789 }, { lat: 17.4406, lng: 78.3822 }],
    "Gachibowli": [{ lat: 17.4401, lng: 78.3489 }, { lat: 17.4366, lng: 78.3531 }, { lat: 17.4452, lng: 78.3411 }],
    "Old City": [{ lat: 17.3616, lng: 78.4747 }, { lat: 17.3644, lng: 78.4682 }, { lat: 17.3572, lng: 78.4788 }],
    "Secunderabad": [{ lat: 17.4399, lng: 78.4983 }, { lat: 17.4346, lng: 78.5012 }, { lat: 17.4455, lng: 78.4938 }],
    "Madhapur": [{ lat: 17.4483, lng: 78.3915 }, { lat: 17.4459, lng: 78.3954 }, { lat: 17.4511, lng: 78.3862 }],
    "Ameerpet": [{ lat: 17.4373, lng: 78.4464 }, { lat: 17.4357, lng: 78.4512 }, { lat: 17.4409, lng: 78.4429 }],
    "Kukatpally": [{ lat: 17.4849, lng: 78.3995 }, { lat: 17.4881, lng: 78.4033 }, { lat: 17.4802, lng: 78.3942 }],
  };

  const titles = [
    "Deep pothole near bus stop",
    "Cracked asphalt on main road",
    "Large sinkhole opening at junction",
    "Rutting along traffic lane",
    "Broken surface after heavy rain",
    "Pothole cluster on service road",
    "Edge damage on highway shoulder",
    "Depression in road near drain",
    "Pothole at signal crossing",
    "Crack lines across full lane width",
    "Sunken manhole surround",
    "Worn-out surface on collector road",
    "Pothole with sharp edges",
    "Severe rutting on flyover ramp",
    "Sinkhole next to pedestrian crossing",
    "Multiple potholes on school road",
    "Damaged junction surface",
    "Crack and water ingress on ramp",
    "Pothole near petrol pump",
    "Patching failure on ring road",
    "Deep crater on residential street",
    "Loose paving near metro station",
    "Pothole on cycle lane",
    "Edge breakage near divider",
    "Depression causing vehicle damage",
    "Cracked drain cover surround",
    "Pothole after flyover pillar",
    "Rutting on bus lane",
    "Surface peeling on main road",
    "Pothole at U-turn point",
  ];

  const descTemplates = [
    "Noticed this while driving home. Multiple vehicles were seen slowing down abruptly. Needs urgent attention.",
    "The damage has been growing over the last two weeks. Rainwater is pooling inside, making it worse.",
    "This has caused two minor accidents this week. Visibility is poor during evening hours.",
    "Happens to be on the daily commute route for school buses. Risk is high during peak hours.",
    "The repair done last season has already failed. The area needs proper excavation and relaying.",
  ];

  const districtArr = Object.keys(locations);
  const reporterSet = [citizenId, ...citizenIds];
  const contractorSet = [contractorAId, contractorBId, contractorCId, contractorDId];

  const completedFeedback = [
    { rating: 5, comment: "Excellent work! The road is smooth now. Very prompt service." },
    { rating: 4, comment: "Good repair quality. Took a few days but worth the wait." },
    { rating: 5, comment: "Very impressed with the speed. Well done to the team." },
    { rating: 3, comment: "Work done but the patch is slightly uneven. Acceptable overall." },
    { rating: 4, comment: "Satisfied with the result. Thanks to the municipal team." },
    { rating: 5, comment: "The new surface is much better than before. Great work!" },
  ];

  let reportNum = 1000;

  const makeAi = (type: RoadDamageType, severity: Severity, seedNum: number) => {
    const conf = 88 + ((seedNum * 7) % 11);
    const recs: Record<Severity, string> = {
      low: "Schedule routine inspection. Low-priority patching recommended within 30 days.",
      medium: "Plan repair within the next 2 weeks. Monitor drainage to prevent expansion.",
      high: "Immediate repair required. Potential risk to vehicles and two-wheelers.",
      critical: "Urgent intervention required. Isolate area with signage and repair within 24 hours.",
    };
    const tags = [
      type.replace("_", " "),
      severity === "critical" ? "hazard" : severity === "high" ? "high-risk" : "maintenance",
      seedNum % 3 === 0 ? "water-damage" : "wear-and-tear",
    ];
    return {
      detected: type,
      severity,
      confidence: conf,
      recommendation: recs[severity],
      isRoadImage: true,
      tags,
      model: "yolov8-road-damage-v2",
      analyzedAt: nowIso(),
      raw: {
        detections: [
          { label: type.replace("_", " "), confidence: conf / 100, bbox: [120, 160, 240, 300] },
          { label: "road-surface", confidence: 0.93, bbox: [40, 40, 400, 360] },
        ],
      },
    };
  };

  for (let i = 0; i < 42; i++) {
    const district = districtArr[i % districtArr.length];
    const spot = locations[district][i % 3];
    const type = typePool[i % typePool.length];
    const severity = severityPool[i % severityPool.length];
    const age = i % 6; // index used to spread creation dates
    const created = subtractDays(2 + i * 2.6 + age);
    const reporter = reporterSet[i % reporterSet.length];

    const status =
      i < 4
        ? statusPool[0]
        : i < 8
        ? statusPool[1]
        : i < 14
        ? statusPool[2]
        : i < 18
        ? statusPool[3]
        : i < 22
        ? statusPool[4]
        : i < 34
        ? statusPool[5]
        : statusPool[6];

    reportNum += 1;
    const reportNumber = `SPR-${reportNum.toString().padStart(4, "0")}`;
    const priority: Complaint["priority"] =
      severity === "critical" ? "critical" : severity === "high" ? "high" : severity === "medium" ? "medium" : "low";

    const complaint: Complaint = {
      id: generateId("cmp"),
      reportNumber,
      title: titles[i % titles.length],
      description: descTemplates[i % descTemplates.length],
      images: [],
      location: { lat: spot.lat + (i % 3) * 0.0012, lng: spot.lng + (i % 2) * 0.0014 },
      address: `Near ${district} Main Road, ${district}`,
      district,
      type,
      status,
      priority,
      reporter,
      aiAnalysis: makeAi(type, severity, i),
      timestamps: { created, updated: addDays(created, 1) },
    };

    if (status === "under_review") complaint.verifiedAt = addDays(created, 0.3);

    if (status === "verified") {
      complaint.verifiedBy = adminId;
      complaint.verifiedAt = addDays(created, 0.5);
    }

    if (status === "assigned" || status === "in_progress") {
      complaint.verifiedBy = adminId;
      complaint.verifiedAt = addDays(created, 0.5);
      complaint.assignedContractor = contractorSet[i % 4];
      complaint.assignedAt = addDays(created, 1);
      if (status === "in_progress") {
        complaint.startedAt = addDays(created, 1.5);
        complaint.completion = {
          beforeImages: [],
          afterImages: [],
          notes: "Work in progress",
          completedBy: contractorSet[i % 4],
        };
      }
    }

    if (status === "completed") {
      complaint.verifiedBy = adminId;
      complaint.verifiedAt = addDays(created, 0.5);
      complaint.assignedContractor = contractorSet[i % 4];
      complaint.assignedAt = addDays(created, 1);
      complaint.startedAt = addDays(created, 1.5);
      const completedAt = addDays(created, 2.5 + (i % 3));
      complaint.completedAt = completedAt;
      complaint.timestamps.updated = completedAt;
      complaint.completion = {
        beforeImages: [],
        afterImages: [],
        notes: `Repaired via ${contractorSet[i % 4] === contractorAId ? "asphalt overlay" : "full-depth patching"}. Surface leveled and compacted.`,
        repairType: i % 2 === 0 ? "asphalt-patching" : "full-depth-repair",
        completedBy: contractorSet[i % 4],
        completedAt,
      };
      const fb = completedFeedback[i % completedFeedback.length];
      complaint.feedback = { rating: fb.rating, comment: fb.comment, createdAt: addDays(completedAt, 0.4) };
    }

    if (status === "rejected") {
      complaint.rejectedReason = "Area already scheduled for redevelopment. Marked as duplicate of ongoing project.";
    }

    await complaints.create(complaint);
  }

  // A duplicate linked to an existing complaint
  const dupeSource = (await complaints.find({ status: "completed" }, { sort: { "timestamps.created": -1 }, limit: 1 }))[0];
  if (dupeSource) {
    const dup = complainDraft({
      title: "Same pothole near bus stop (duplicate)",
      description: "Reporting the same pothole reported last week.",
      location: { lat: dupeSource.location.lat + 0.0004, lng: dupeSource.location.lng - 0.0002 },
      district: dupeSource.district,
      type: dupeSource.type,
      status: "rejected",
      priority: "low",
      reporter: citizenIds[1],
      duplicateOf: dupeSource.id,
      aiAnalysis: { ...(dupeSource.aiAnalysis as NonNullable<Complaint["aiAnalysis"]>), confidence: 0.99 },
      rejectedReason: "Duplicate complaint. Linked to an existing active report.",
      timestamps: { created: subtractDays(1), updated: subtractDays(1) },
    });
    const dupDoc: Complaint = { ...dup, id: generateId("cmp"), reportNumber: `SPR-${(reportNum + 1).toString().padStart(4, "0")}` };
    await complaints.create(dupDoc);
  }

  /* ---------- Notifications ---------- */

  const notificationTemplates: Array<{
    user: string;
    type: NotificationItem["type"];
    title: string;
    message: string;
    link?: string;
    daysAgo: number;
  }> = [
    { user: citizenId, type: "complaint", title: "Complaint registered", message: "Your complaint SPR-1042 has been registered and is under AI review.", link: "/complaints/SPR-1042", daysAgo: 9 },
    { user: citizenId, type: "ai", title: "AI analysis complete", message: "AI detected a High severity pothole with 94% confidence in SPR-1042.", link: "/complaints/SPR-1042", daysAgo: 8 },
    { user: citizenId, type: "complaint", title: "Complaint verified", message: "SPR-1042 was verified by the municipality and marked for repair.", link: "/complaints/SPR-1042", daysAgo: 6 },
    { user: citizenId, type: "assignment", title: "Contractor assigned", message: "City Paving Co has been assigned to repair SPR-1042.", link: "/complaints/SPR-1042", daysAgo: 5 },
    { user: citizenId, type: "completion", title: "Repair completed", message: "Great news! The pothole in SPR-1042 has been repaired. Please share your feedback.", link: "/complaints/SPR-1042", daysAgo: 3 },
    { user: contractorAId, type: "assignment", title: "New work assignment", message: "SPR-1045 assigned to your team. Estimated 2 day repair window.", link: "/contractor/jobs/SPR-1045", daysAgo: 4 },
    { user: contractorAId, type: "completion", title: "Job completed", message: "SPR-1031 marked as completed and submitted for verification.", link: "/contractor/jobs/SPR-1031", daysAgo: 6 },
    { user: contractorBId, type: "assignment", title: "New work assignment", message: "SPR-1040 assigned to Metro Road Works.", link: "/contractor/jobs/SPR-1040", daysAgo: 2 },
    { user: adminId, type: "complaint", title: "New complaint submitted", message: "3 new complaints await verification today.", link: "/admin/complaints", daysAgo: 1 },
    { user: adminId, type: "info", title: "Weekly report ready", message: "Your weekly road-damage analytics report is ready to download.", link: "/admin/analytics", daysAgo: 0 },
    { user: adminId, type: "feedback", title: "New citizen feedback", message: "A citizen rated the completed repair 5/5.", link: "/admin/reports", daysAgo: 2 },
    { user: citizenId, type: "info", title: "Welcome to Smart Pothole Reporter", message: "Help keep our city roads safe by reporting road damage in under 60 seconds.", daysAgo: 20 },
    { user: contractorCId, type: "assignment", title: "New work assignment", message: "SPR-1038 assigned to City Paving Co.", link: "/contractor/jobs/SPR-1038", daysAgo: 1 },
  ];

  for (const n of notificationTemplates) {
    await notifications.create({
      id: generateId("ntf"),
      user: n.user,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.daysAgo > 6,
      createdAt: subtractDays(n.daysAgo),
    });
  }

  /* ---------- Activity logs ---------- */

  const logActions: Array<{ action: string; description: string; daysAgo: number }> = [
    { action: "complaint.submitted", description: "New complaint SPR-1042 submitted by Priya Sharma", daysAgo: 9 },
    { action: "ai.analyzed", description: "AI analyzed SPR-1042 — detected High severity pothole (94%)", daysAgo: 8 },
    { action: "complaint.verified", description: "Aarav Mehta verified SPR-1042", daysAgo: 6 },
    { action: "complaint.assigned", description: "Aarav Mehta assigned SPR-1042 to City Paving Co", daysAgo: 5 },
    { action: "complaint.in_progress", description: "City Paving Co started repair on SPR-1042", daysAgo: 4 },
    { action: "complaint.completed", description: "City Paving Co completed repair of SPR-1042", daysAgo: 3 },
    { action: "feedback.submitted", description: "Priya Sharma rated repair of SPR-1042 5/5", daysAgo: 2 },
    { action: "user.registered", description: "New citizen account registered: Farhan Ali", daysAgo: 3 },
    { action: "complaint.verified", description: "Aarav Mehta verified SPR-1039", daysAgo: 2 },
    { action: "complaint.assigned", description: "Aarav Mehta assigned SPR-1038 to City Paving Co", daysAgo: 1 },
  ];

  for (const l of logActions) {
    await logs.create({
      id: generateId("log"),
      action: l.action,
      user: adminId,
      userName: "System",
      description: l.description,
      createdAt: subtractDays(l.daysAgo),
    });
  }

  /* ---------- Citizen statistics seed ---------- */
  for (let i = 0; i < 6; i++) {
    const c = extraCitizens[i];
    await notifications.create({
      id: generateId("ntf"),
      user: citizenIds[i],
      type: i % 3 === 0 ? "complaint" : "completion",
      title: i % 3 === 0 ? "Complaint resolved" : "Status update",
      message: `Your recent report in ${c.district} has been updated.`,
      read: false,
      createdAt: subtractDays(i + 1),
    });
  }

  console.log(`[seed] Seeded ${allRows.length} users, ${reportNum - 1000 + 1} complaints, ${notificationTemplates.length + 6} notifications, ${logActions.length} activity logs`);
};

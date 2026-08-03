import {
  ActivityLogModel,
  ComplaintModel,
  NotificationModel,
  UserModel,
} from "../models/index.js";
import type { Collection, Filter, FindOptions, UpdateOp } from "./store.js";
import type { ActivityLog, Complaint, NotificationItem, User } from "../types/index.js";

type ModelLike = {
  create: (doc: Record<string, unknown>) => Promise<unknown>;
  insertMany: (docs: Record<string, unknown>[]) => Promise<unknown>;
  find: (filter?: Record<string, unknown>) => unknown;
  findOne: (filter?: Record<string, unknown>) => unknown;
  findById: (id: string) => unknown;
  findOneAndUpdate: (filter: Record<string, unknown>, update: Record<string, unknown>, opts?: Record<string, unknown>) => unknown;
  findByIdAndUpdate: (id: string, update: Record<string, unknown>, opts?: Record<string, unknown>) => unknown;
  findByIdAndDelete: (id: string) => unknown;
  deleteOne: (filter: Record<string, unknown>) => unknown;
  countDocuments: (filter?: Record<string, unknown>) => unknown;
  lean: () => unknown;
  sort: (sort: Record<string, 1 | -1>) => unknown;
  skip: (n: number) => unknown;
  limit: (n: number) => unknown;
};

type ModelTuple = { lean(): unknown };

const strip = (doc: unknown): Record<string, unknown> => {
  if (!doc || typeof doc !== "object") return {} as Record<string, unknown>;
  const d = doc as Record<string, unknown>;
  const { _id, __v, ...rest } = d;
  return rest;
};

const execLean = (query: unknown): Promise<Record<string, unknown>[]> => {
  const q = query as { lean: () => unknown };
  return Promise.resolve(q.lean() as Promise<Record<string, unknown>[]>);
};

export class MongoCollection<T extends { id: string }> implements Collection<T> {
  constructor(private model: ModelLike) {}

  async create(doc: T): Promise<T> {
    await this.model.create(doc as unknown as Record<string, unknown>);
    return doc;
  }

  async insertMany(docs: T[]): Promise<T[]> {
    await this.model.insertMany(docs as unknown as Record<string, unknown>[]);
    return docs;
  }

  async find(filter: Filter<T>, options: FindOptions<T> = {}): Promise<T[]> {
    let query = this.model.find(filter as Record<string, unknown>) as unknown as ModelTuple;
    if (options.sort) {
      query = (query as unknown as { sort: (s: Record<string, 1 | -1>) => unknown }).sort(options.sort as Record<string, 1 | -1>) as unknown as ModelTuple;
    }
    if (options.skip) {
      query = (query as unknown as { skip: (n: number) => unknown }).skip(options.skip) as unknown as ModelTuple;
    }
    if (options.limit) {
      query = (query as unknown as { limit: (n: number) => unknown }).limit(options.limit) as unknown as ModelTuple;
    }
    const raw = await execLean(query);
    return raw.map((d) => strip(d) as unknown as T);
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    const raw = await execLean(this.model.findOne(filter as Record<string, unknown>) as ModelTuple);
    return raw[0] ? (strip(raw[0]) as unknown as T) : null;
  }

  async findById(id: string): Promise<T | null> {
    const raw = await execLean(this.model.findById(id) as ModelTuple);
    return raw[0] ? (strip(raw[0]) as unknown as T) : null;
  }

  async updateById(id: string, update: UpdateOp<T>): Promise<T | null> {
    const raw = await execLean(
      this.model.findByIdAndUpdate(id, update as Record<string, unknown>, { new: true }) as ModelTuple
    );
    return raw[0] ? (strip(raw[0]) as unknown as T) : null;
  }

  async updateOne(filter: Filter<T>, update: UpdateOp<T>): Promise<T | null> {
    const raw = await execLean(
      this.model.findOneAndUpdate(filter as Record<string, unknown>, update as Record<string, unknown>, { new: true }) as ModelTuple
    );
    return raw[0] ? (strip(raw[0]) as unknown as T) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    return Boolean(await this.model.findByIdAndDelete(id));
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter as Record<string, unknown>) as Promise<number>;
  }

  async all(): Promise<T[]> {
    return this.find({});
  }
}

export const mongoCollections = {
  users: new MongoCollection<User>(UserModel as unknown as ModelLike),
  complaints: new MongoCollection<Complaint>(ComplaintModel as unknown as ModelLike),
  notifications: new MongoCollection<NotificationItem>(NotificationModel as unknown as ModelLike),
  activityLogs: new MongoCollection<ActivityLog>(ActivityLogModel as unknown as ModelLike),
};

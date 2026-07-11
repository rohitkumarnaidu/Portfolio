import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface StoreEntry<T> {
  id: string;
  data: T;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

@Injectable()
export class InMemoryStore {
  private readonly logger = new Logger(InMemoryStore.name);
  private stores = new Map<string, Map<string, StoreEntry<unknown>>>();

  getCollection<T>(name: string): Map<string, StoreEntry<T>> {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return this.stores.get(name) as Map<string, StoreEntry<T>>;
  }

  private getEntries<T>(collection: string, includeDeleted = false): T[] {
    const store = this.getCollection<T>(collection);
    const entries = Array.from(store.values());
    const filtered = includeDeleted
      ? entries
      : entries.filter((e) => !e.deleted_at);
    return filtered
      .map((e) => e.data)
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }

  findAll<T>(collection: string): T[] {
    return this.getEntries<T>(collection, false);
  }

  findAllIncludingDeleted<T>(collection: string): T[] {
    return this.getEntries<T>(collection, true);
  }

  findAllDeleted<T>(collection: string): T[] {
    const store = this.getCollection<T>(collection);
    return Array.from(store.values())
      .filter((e) => e.deleted_at)
      .map((e) => e.data)
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }

  findById<T>(collection: string, id: string): T | undefined {
    return this.getCollection<T>(collection).get(id)?.data;
  }

  create<T>(collection: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>, id?: string): T {
    const now = new Date().toISOString();
    const entryId = id || uuidv4();
    const entry = {
      id: entryId,
      ...data,
      created_at: now,
      updated_at: now,
    } as unknown as T;
    const storeEntry: StoreEntry<T> = { id: entryId, data: entry, created_at: now, updated_at: now };
    this.getCollection<T>(collection).set(entryId, storeEntry);
    return entry;
  }

  update<T>(collection: string, id: string, data: Partial<T>): T | undefined {
    const store = this.getCollection<T>(collection);
    const existing = store.get(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const updated = { ...existing.data, ...data, id, updated_at: now } as T;
    store.set(id, { ...existing, data: updated, updated_at: now });
    return updated;
  }

  delete(collection: string, id: string): boolean {
    const store = this.getCollection(collection);
    const existing = store.get(id);
    if (!existing) return false;
    if (existing.deleted_at) return false;
    existing.deleted_at = new Date().toISOString();
    return true;
  }

  hardDelete(collection: string, id: string): boolean {
    return this.getCollection(collection).delete(id);
  }

  restore(collection: string, id: string): boolean {
    const store = this.getCollection(collection);
    const existing = store.get(id);
    if (!existing?.deleted_at) return false;
    delete existing.deleted_at;
    return true;
  }

  findOneBy<T>(collection: string, predicate: (item: T) => boolean): T | undefined {
    const store = this.getCollection<T>(collection);
    for (const entry of store.values()) {
      if (predicate(entry.data)) return entry.data;
    }
    return undefined;
  }

  findBy<T>(collection: string, predicate: (item: T) => boolean): T[] {
    const store = this.getCollection<T>(collection);
    const results: T[] = [];
    for (const entry of store.values()) {
      if (predicate(entry.data)) results.push(entry.data);
    }
    return results.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }

  count(collection: string, predicate?: (item: unknown) => boolean): number {
    const store = this.getCollection(collection);
    let count = 0;
    for (const entry of store.values()) {
      if (entry.deleted_at) continue;
      if (!predicate || predicate(entry.data)) count++;
    }
    return count;
  }

  seed<T>(collection: string, items: T[]): void {
    const store = this.getCollection<T>(collection);
    for (const item of items) {
      const record = item as Record<string, unknown>;
      const id = (record.id as string) || uuidv4();
      if (!store.has(id)) {
        const now = new Date().toISOString();
        store.set(id, {
          id,
          data: { ...item, created_at: now, updated_at: now } as T,
          created_at: now,
          updated_at: now,
        });
      }
    }
    this.logger.log(`Seeded ${items.length} items into "${collection}" collection`);
  }
}

import { InMemoryStore } from './in-memory.store';

interface Item {
  id: string;
  title: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe('collections', () => {
    it('creates a collection on first access and reuses it afterwards', () => {
      const first = store.getCollection('projects');
      const second = store.getCollection('projects');

      expect(first).toBe(second);
      expect(first.size).toBe(0);
    });

    it('keeps separate collections apart', () => {
      store.create('projects', { title: 'A' } as Omit<Item, 'id'>);
      store.create('skills', { title: 'B' } as Omit<Item, 'id'>);

      expect(store.count('projects')).toBe(1);
      expect(store.count('skills')).toBe(1);
    });
  });

  describe('create', () => {
    it('assigns an id and timestamps', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);

      expect(created.id).toEqual(expect.any(String));
      expect(created.created_at).toEqual(expect.any(String));
      expect(created.updated_at).toEqual(expect.any(String));
      expect(store.findById<Item>('projects', created.id)).toEqual(created);
    });

    it('uses a supplied id when one is given', () => {
      const created = store.create<Item>(
        'projects',
        { title: 'First' } as Omit<Item, 'id'>,
        'fixed-id',
      );

      expect(created.id).toBe('fixed-id');
      expect(store.findById<Item>('projects', 'fixed-id')).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('sorts by display_order and falls back to zero', () => {
      store.create<Item>('projects', { title: 'C', display_order: 3 } as Omit<Item, 'id'>);
      store.create<Item>('projects', { title: 'A' } as Omit<Item, 'id'>);
      store.create<Item>('projects', { title: 'B', display_order: 1 } as Omit<Item, 'id'>);

      expect(store.findAll<Item>('projects').map((i) => i.title)).toEqual(['A', 'B', 'C']);
    });

    it('excludes soft deleted entries', () => {
      const kept = store.create<Item>('projects', { title: 'Kept' } as Omit<Item, 'id'>);
      const removed = store.create<Item>('projects', { title: 'Removed' } as Omit<Item, 'id'>);
      store.delete('projects', removed.id);

      expect(store.findAll<Item>('projects').map((i) => i.id)).toEqual([kept.id]);
    });

    it('includes soft deleted entries when asked', () => {
      const removed = store.create<Item>('projects', { title: 'Removed' } as Omit<Item, 'id'>);
      store.delete('projects', removed.id);

      expect(store.findAllIncludingDeleted<Item>('projects')).toHaveLength(1);
    });

    it('returns only deleted entries from findAllDeleted', () => {
      store.create<Item>('projects', { title: 'Kept' } as Omit<Item, 'id'>);
      const removed = store.create<Item>('projects', { title: 'Removed' } as Omit<Item, 'id'>);
      store.delete('projects', removed.id);

      expect(store.findAllDeleted<Item>('projects').map((i) => i.title)).toEqual(['Removed']);
    });
  });

  describe('update', () => {
    it('merges the patch and refreshes updated_at', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);

      const updated = store.update<Item>('projects', created.id, { title: 'Renamed' });

      expect(updated).toMatchObject({ id: created.id, title: 'Renamed' });
      expect(updated?.updated_at).toEqual(expect.any(String));
    });

    it('returns undefined for an unknown id', () => {
      expect(store.update<Item>('projects', 'missing', { title: 'x' })).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('soft deletes an entry and reports success', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);

      expect(store.delete('projects', created.id)).toBe(true);
      expect(store.findAll<Item>('projects')).toHaveLength(0);
    });

    it('returns false for unknown or already deleted entries', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);
      store.delete('projects', created.id);

      expect(store.delete('projects', 'missing')).toBe(false);
      expect(store.delete('projects', created.id)).toBe(false);
    });

    it('removes the entry entirely with hardDelete', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);

      expect(store.hardDelete('projects', created.id)).toBe(true);
      expect(store.hardDelete('projects', created.id)).toBe(false);
      expect(store.findById<Item>('projects', created.id)).toBeUndefined();
    });

    it('brings a soft deleted entry back with restore', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);
      store.delete('projects', created.id);

      expect(store.restore('projects', created.id)).toBe(true);
      expect(store.findAll<Item>('projects')).toHaveLength(1);
    });

    it('returns false when restoring an entry that is not deleted', () => {
      const created = store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);

      expect(store.restore('projects', created.id)).toBe(false);
      expect(store.restore('projects', 'missing')).toBe(false);
    });
  });

  describe('queries', () => {
    it('finds a single entry by predicate', () => {
      store.create<Item>('projects', { title: 'First' } as Omit<Item, 'id'>);
      store.create<Item>('projects', { title: 'Second' } as Omit<Item, 'id'>);

      expect(store.findOneBy<Item>('projects', (i) => i.title === 'Second')?.title).toBe('Second');
      expect(store.findOneBy<Item>('projects', (i) => i.title === 'Missing')).toBeUndefined();
    });

    it('finds every entry matching a predicate, sorted', () => {
      store.create<Item>('projects', { title: 'B', display_order: 2 } as Omit<Item, 'id'>);
      store.create<Item>('projects', { title: 'A', display_order: 1 } as Omit<Item, 'id'>);
      store.create<Item>('projects', { title: 'C', display_order: 3 } as Omit<Item, 'id'>);

      expect(
        store.findBy<Item>('projects', (i) => i.display_order !== 3).map((i) => i.title),
      ).toEqual(['A', 'B']);
    });

    it('counts entries, skipping soft deleted ones', () => {
      store.create<Item>('projects', { title: 'A' } as Omit<Item, 'id'>);
      const removed = store.create<Item>('projects', { title: 'B' } as Omit<Item, 'id'>);
      store.delete('projects', removed.id);

      expect(store.count('projects')).toBe(1);
      expect(store.count('projects', (i) => (i as Item).title === 'A')).toBe(1);
      expect(store.count('projects', (i) => (i as Item).title === 'B')).toBe(0);
    });
  });

  describe('seed', () => {
    it('inserts items and stamps them with timestamps', () => {
      store.seed<Item>('projects', [{ id: 'a', title: 'A' } as Item]);

      const seeded = store.findById<Item>('projects', 'a');
      expect(seeded?.title).toBe('A');
      expect(seeded?.created_at).toEqual(expect.any(String));
    });

    it('generates an id when the item does not have one', () => {
      store.seed<Item>('projects', [{ title: 'A' } as Item]);

      expect(store.count('projects')).toBe(1);
    });

    it('does not overwrite an existing entry', () => {
      store.seed<Item>('projects', [{ id: 'a', title: 'A' } as Item]);
      store.seed<Item>('projects', [{ id: 'a', title: 'Replaced' } as Item]);

      expect(store.findById<Item>('projects', 'a')?.title).toBe('A');
    });
  });
});

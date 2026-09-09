export type Prayer = { id: string; name: string };

export class SpotlightRotation {
  private active = new Map<string, Prayer>();
  private cycle: string[] = [];
  private priority: string[] = [];
  private arrivals = new Set<string>();
  private initialized = false;
  private normalNext = false;
  private last: string | undefined;

  noteArrival(id: string) {
    if (!this.active.has(id)) this.arrivals.add(id);
  }

  reconcile(prayers: Prayer[]) {
    const active = new Map(prayers.map((prayer) => [prayer.id, prayer]));
    this.cycle = this.cycle.filter((id) => active.has(id));
    this.priority = this.priority.filter((id) => active.has(id));
    if (this.initialized) {
      // Realtime arrival order first; snapshots are newest-first, so reverse
      // their fallback order for additions recovered during reconciliation.
      const additions = new Set([...this.arrivals, ...prayers.map(({ id }) => id).reverse()]);
      for (const id of additions) {
        if (active.has(id) && !this.active.has(id)) this.priority.push(id);
      }
    }
    this.arrivals.clear();
    this.active = active;
    this.initialized = true;
    if (!this.priority.length) this.normalNext = false;
  }

  next(): Prayer | null {
    if (!this.active.size) return null;
    if (!this.cycle.length && !this.priority.length) {
      this.cycle = [...this.active.keys()];
      // Fisher-Yates: one shuffled cycle, rather than a fresh draw per slot.
      for (let i = this.cycle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cycle[i], this.cycle[j]] = [this.cycle[j], this.cycle[i]];
      }
      if (this.cycle.length > 1 && this.cycle[0] === this.last) {
        [this.cycle[0], this.cycle[1]] = [this.cycle[1], this.cycle[0]];
      }
    }

    // Finish every unseen request before starting another cycle. When the
    // normal cycle is exhausted, drain priority rather than repeat old names.
    const usePriority = this.priority.length > 0 && (!this.normalNext || !this.cycle.length);
    const id = usePriority ? this.priority.shift()! : this.cycle.shift()!;
    this.normalNext = usePriority;
    this.last = id;
    return this.active.get(id)!;
  }
}

import { Booking, BTreeKeyItem, BTreeNodeUI, SearchStep } from '../types';

/**
 * ADSA Concept: B-Tree Index with Degree t = 3.
 * Minimum keys per non-root node: t - 1 = 2
 * Maximum keys per node: 2t - 1 = 5
 * Maximum child pointers: 2t = 6
 */
export class BTreeNodeModel {
  t: number;
  keys: BTreeKeyItem[];
  children: BTreeNodeModel[];
  isLeaf: boolean;
  id: string;

  constructor(t: number, isLeaf: boolean) {
    this.t = t;
    this.isLeaf = isLeaf;
    this.keys = [];
    this.children = [];
    this.id = 'node_' + Math.random().toString(36).substring(2, 9);
  }

  searchWithSteps(key: string, steps: SearchStep[]): Booking | null {
    const nodeKeys = this.keys.map(k => k.key);
    let i = 0;
    while (i < this.keys.length && key.localeCompare(this.keys[i].key) > 0) {
      i++;
    }

    if (i < this.keys.length && this.keys[i].key === key) {
      steps.push({
        nodeId: this.id,
        keysInNode: nodeKeys,
        comparison: `Matched key '${key}' at position ${i} in node [${nodeKeys.join(', ')}]`,
        action: `Key located! Direct pointer returned to Booking record.`,
        found: true,
      });
      return this.keys[i].booking;
    }

    if (this.isLeaf) {
      steps.push({
        nodeId: this.id,
        keysInNode: nodeKeys,
        comparison: `Key '${key}' not found in leaf node [${nodeKeys.join(', ')}]`,
        action: `Leaf reached. Search terminates: Booking record does not exist.`,
        found: false,
      });
      return null;
    }

    const nextBranchDesc =
      i === 0
        ? `key < ${this.keys[0].key} -> traverse child[0]`
        : i === this.keys.length
        ? `key > ${this.keys[this.keys.length - 1].key} -> traverse child[${i}]`
        : `${this.keys[i - 1].key} < key < ${this.keys[i].key} -> traverse child[${i}]`;

    steps.push({
      nodeId: this.id,
      keysInNode: nodeKeys,
      comparison: `Key '${key}' not in current internal node [${nodeKeys.join(', ')}]`,
      action: `Navigating to child pointer ${i} (${nextBranchDesc})`,
      found: false,
    });

    return this.children[i].searchWithSteps(key, steps);
  }

  insertNonFull(key: string, booking: Booking) {
    let i = this.keys.length - 1;

    if (this.isLeaf) {
      while (i >= 0 && this.keys[i].key.localeCompare(key) > 0) {
        i--;
      }
      if (i >= 0 && this.keys[i].key === key) {
        // Update booking if key exists
        this.keys[i].booking = booking;
        return;
      }
      this.keys.splice(i + 1, 0, { key, booking });
    } else {
      while (i >= 0 && this.keys[i].key.localeCompare(key) > 0) {
        i--;
      }
      i++;

      if (this.children[i].keys.length === 2 * this.t - 1) {
        this.splitChild(i, this.children[i]);
        if (this.keys[i].key.localeCompare(key) < 0) {
          i++;
        }
      }
      this.children[i].insertNonFull(key, booking);
    }
  }

  splitChild(i: number, y: BTreeNodeModel) {
    const z = new BTreeNodeModel(y.t, y.isLeaf);
    const medianIndex = this.t - 1;
    const medianItem = y.keys[medianIndex];

    for (let j = 0; j < this.t - 1; j++) {
      z.keys.push(y.keys[medianIndex + 1 + j]);
    }

    if (!y.isLeaf) {
      for (let j = 0; j < this.t; j++) {
        z.children.push(y.children[this.t + j]);
      }
    }

    y.keys = y.keys.slice(0, medianIndex);
    if (!y.isLeaf) {
      y.children = y.children.slice(0, this.t);
    }

    this.children.splice(i + 1, 0, z);
    this.keys.splice(i, 0, medianItem);
  }

  toUI(depth: number = 0): BTreeNodeUI {
    return {
      id: this.id,
      keys: [...this.keys],
      isLeaf: this.isLeaf,
      depth,
      children: this.children.map(c => c.toUI(depth + 1)),
    };
  }

  inOrderTraversal(acc: Booking[]) {
    for (let i = 0; i < this.keys.length; i++) {
      if (!this.isLeaf && this.children[i]) {
        this.children[i].inOrderTraversal(acc);
      }
      acc.push(this.keys[i].booking);
    }
    if (!this.isLeaf && this.children[this.keys.length]) {
      this.children[this.keys.length].inOrderTraversal(acc);
    }
  }
}

export class BTreeIndex {
  root: BTreeNodeModel | null;
  t: number;
  size: number;

  constructor(t: number = 3) {
    this.t = t;
    this.root = null;
    this.size = 0;
  }

  search(key: string): { booking: Booking | null; steps: SearchStep[] } {
    const steps: SearchStep[] = [];
    if (!this.root || !key) {
      return { booking: null, steps };
    }
    const booking = this.root.searchWithSteps(key.trim(), steps);
    return { booking, steps };
  }

  insert(key: string, booking: Booking) {
    if (!this.root) {
      this.root = new BTreeNodeModel(this.t, true);
      this.root.keys.push({ key, booking });
      this.size++;
      return;
    }

    if (this.root.keys.length === 2 * this.t - 1) {
      const s = new BTreeNodeModel(this.t, false);
      s.children.push(this.root);
      s.splitChild(0, this.root);

      let i = 0;
      if (s.keys[0].key.localeCompare(key) < 0) {
        i++;
      }
      s.children[i].insertNonFull(key, booking);
      this.root = s;
    } else {
      this.root.insertNonFull(key, booking);
    }
    this.size++;
  }

  getAllBookings(): Booking[] {
    const acc: Booking[] = [];
    if (this.root) {
      this.root.inOrderTraversal(acc);
    }
    return acc;
  }

  getTreeUI(): BTreeNodeUI | null {
    if (!this.root) return null;
    return this.root.toUI(0);
  }

  clear() {
    this.root = null;
    this.size = 0;
  }
}

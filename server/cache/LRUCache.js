import { Node, DoublyLinkedList } from './DoublyLinkedList.js';

export class LRUCache {
  constructor(capacity = 200) {
    this.capacity = capacity;
    this.map = new Map();
    this.list = new DoublyLinkedList();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) {
      this.stats.misses++;
      return null;
    }

    // Lazy expiration check
    if (node.expiryTime && Date.now() > node.expiryTime) {
      this.list.removeNode(node);
      this.map.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    this.list.moveToHead(node);
    return node.value;
  }

  set(key, value, ttlInSeconds = null) {
    const expiryTime = ttlInSeconds ? Date.now() + (ttlInSeconds * 1000) : null;
    const existingNode = this.map.get(key);

    if (existingNode) {
      existingNode.value = value;
      existingNode.expiryTime = expiryTime;
      this.list.moveToHead(existingNode);
      return;
    }

    // Capacity eviction
    if (this.map.size >= this.capacity) {
      const evicted = this.list.removeTail();
      if (evicted) {
        this.map.delete(evicted.key);
        this.stats.evictions++;
      }
    }

    const newNode = new Node(key, value, expiryTime);
    this.list.addHead(newNode);
    this.map.set(key, newNode);
  }

  invalidate(keyPattern) {
    // If it's a specific key, delete it. If it contains a prefix or is a wildcard, delete all matching keys.
    for (const [key, node] of this.map.entries()) {
      if (key === keyPattern || key.startsWith(keyPattern)) {
        this.list.removeNode(node);
        this.map.delete(key);
      }
    }
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRatio: parseFloat(hitRatio.toFixed(2)),
      itemCount: this.map.size,
      heapUsed: process.memoryUsage().heapUsed,
    };
  }
}

// Global cache instance with a default capacity of 200 items
export const cacheInstance = new LRUCache(200);

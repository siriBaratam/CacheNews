export class Node {
  constructor(key, value, expiryTime = null) {
    this.key = key;
    this.value = value;
    this.expiryTime = expiryTime; // timestamp in milliseconds when this expires, or null
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addHead(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  removeTail() {
    if (!this.tail) return null;
    const node = this.tail;
    this.removeNode(node);
    return node;
  }

  moveToHead(node) {
    if (node === this.head) return;
    this.removeNode(node);
    this.addHead(node);
  }
}

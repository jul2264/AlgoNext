import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, BookOpen, Layers, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award, ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  // Representing the visual linked list nodes
  nodes: { val: number; nextVal: number | string | null; label?: string }[];
  activeIndex?: number;
  pointers?: { label: string; index: number }[];
  highlightIndices?: number[];
  line: number;
}

// Visualizer steps configuration for Linked Lists
const VISUALIZATION_STEPS: Record<'traversal' | 'insert-head' | 'insert-tail' | 'delete' | 'reverse', VisStep[]> = {
  traversal: [
    {
      step: 0,
      description: 'Initial state of the linked list. Traversal starts at the HEAD pointer (index 0).',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Visit Node 10. Access the value (10) and follow the next pointer to index 1.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      line: 4
    },
    {
      step: 2,
      description: 'Follow pointer to Node 20. Access the value (20) and read the next reference pointing to index 2.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 1,
      pointers: [{ label: 'curr', index: 1 }],
      line: 5
    },
    {
      step: 3,
      description: 'Follow pointer to Node 30. Access the value (30). The next pointer is NULL, indicating the end of the list.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 2,
      pointers: [{ label: 'curr', index: 2 }],
      line: 5
    },
    {
      step: 4,
      description: 'Current reaches NULL. The linear traversal loop terminates.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [],
      line: 4
    }
  ],
  'insert-head': [
    {
      step: 0,
      description: 'Initial list: HEAD points to Node 20. We want to insert a new node with value 10 at the beginning.',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Step 1: Allocate a new node in memory with data 10 and next pointing to NULL.',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null },
        { val: 10, nextVal: null, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2],
      line: 1
    },
    {
      step: 2,
      description: 'Step 2: Connect the new node. Point new_node.next to the current HEAD node (Node 20).',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null },
        { val: 10, nextVal: 20, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2, 0],
      line: 3
    },
    {
      step: 3,
      description: 'Step 3: Update HEAD to reference the new node (Node 10). The insertion at head is complete.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'HEAD', index: 0 }],
      highlightIndices: [0],
      line: 4
    }
  ],
  'insert-tail': [
    {
      step: 0,
      description: 'Initial list. To insert at the end, we first need to traverse the list and find the tail node.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Step 1: Create the new node with data 30 and next pointing to NULL.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null },
        { val: 30, nextVal: null, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2],
      line: 1
    },
    {
      step: 2,
      description: 'Step 2: Traverse to find the tail node. Node 20 is the tail since its next is NULL.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null, label: 'tail' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 1,
      pointers: [{ label: 'curr', index: 1 }, { label: 'new_node', index: 2 }],
      highlightIndices: [1],
      line: 3
    },
    {
      step: 3,
      description: 'Step 3: Update the tail node\'s pointer. Connect Node 20\'s next pointer to the new node (30).',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }],
      highlightIndices: [1, 2],
      line: 4
    }
  ],
  delete: [
    {
      step: 0,
      description: 'Initial state: We want to delete Node 20. Traversal will find the node preceding the target.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Step 1: Locate the predecessor node (Node 10) which is right before the target Node 20.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      highlightIndices: [0],
      line: 4
    },
    {
      step: 2,
      description: 'Step 2: Reassign pointers. Point Node 10\'s next directly to Node 20\'s next (Node 30).',
      nodes: [
        { val: 10, nextVal: 30 },
        { val: 20, nextVal: 30, label: 'orphaned' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      highlightIndices: [0, 2],
      line: 6
    },
    {
      step: 3,
      description: 'Step 3: Node 20 is completely bypassed. Garbage collection (or delete) reclaims Node 20\'s memory.',
      nodes: [
        { val: 10, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 6
    }
  ],
  reverse: [
    {
      step: 0,
      description: 'Initial list. Reversal requires keeping track of three pointers: prev, current, and next.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Step 1: Point Node 10\'s next to prev (NULL). Shift pointers (prev=10, current=20).',
      nodes: [
        { val: 10, nextVal: null, label: 'prev' },
        { val: 20, nextVal: 30, label: 'curr' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }, { label: 'curr', index: 1 }],
      highlightIndices: [0],
      line: 6
    },
    {
      step: 2,
      description: 'Step 2: Point Node 20\'s next to prev (Node 10). Shift pointers (prev=20, current=30).',
      nodes: [
        { val: 20, nextVal: 10, label: 'prev' },
        { val: 10, nextVal: null },
        { val: 30, nextVal: null, label: 'curr' }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }, { label: 'curr', index: 2 }],
      highlightIndices: [0, 1],
      line: 6
    },
    {
      step: 3,
      description: 'Step 3: Point Node 30\'s next to prev (Node 20). Shift pointers (prev=30, current=NULL).',
      nodes: [
        { val: 30, nextVal: 20, label: 'prev' },
        { val: 20, nextVal: 10 },
        { val: 10, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }],
      highlightIndices: [0, 1],
      line: 6
    },
    {
      step: 4,
      description: 'Step 4: Update HEAD pointer to prev (Node 30). The reversed linked list is complete.',
      nodes: [
        { val: 30, nextVal: 20 },
        { val: 20, nextVal: 10 },
        { val: 10, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 9
    }
  ]
};

const PROBLEM_SAMPLE_CODES = {
  'Reverse Linked List': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

# Run Reversal
h = Node(1, Node(2, Node(3)))
rev = reverse_list(h)
print(f"Reversed list head: {rev.val} -> {rev.next.val}")`,

  'Detect Cycle': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Run Cycle Detection
h = Node(10)
h.next = Node(20)
h.next.next = h # creates cycle
print(f"Cycle detected: {has_cycle(h)}")`,

  'Merge Two Sorted Lists': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_lists(l1, l2):
    dummy = Node()
    tail = dummy
    while l1 and l2:
        if l1.val < l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next

# Run Merge
l1 = Node(1, Node(3))
l2 = Node(2, Node(4))
merged = merge_lists(l1, l2)
print(f"Merged: {merged.val} -> {merged.next.val} -> {merged.next.next.val}")`,

  'Find Middle Node': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def find_middle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# Run Middle search
h = Node(1, Node(2, Node(3, Node(4))))
mid = find_middle(h)
print(f"Middle node value: {mid.val}")`,

  'Remove Nth Node From End': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    first = dummy
    second = dummy
    for _ in range(n + 1):
        first = first.next
    while first:
        first = first.next
        second = second.next
    second.next = second.next.next
    return dummy.next

# Run removal
h = Node(1, Node(2, Node(3, Node(4))))
head = remove_nth_from_end(h, 2) # Removes 3
print(f"List values: {head.val} -> {head.next.val} -> {head.next.next.val}")`,

  'Palindrome Linked List': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def is_palindrome(head):
    # Find middle
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    # Reverse second half
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    # Compare halves
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True

# Run Palindrome check
h = Node(1, Node(2, Node(2, Node(1))))
print(f"Is palindrome: {is_palindrome(h)}")`,

  'Intersection of Linked Lists': `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def get_intersection_node(headA, headB):
    pA, pB = headA, headB
    while pA != pB:
        pA = pA.next if pA else headB
        pB = pB.next if pB else headA
    return pA

# Run intersection lookup
shared = Node(8, Node(10))
l1 = Node(4, Node(1, shared))
l2 = Node(5, Node(6, Node(1, shared)))
inter = get_intersection_node(l1, l2)
print(f"Intersection node: {inter.val}")`,

  'LRU Cache': `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def remove(self, node):
        p, n = node.prev, node.next
        p.next, n.prev = n, p

    def insert(self, node):
        p, n = self.tail.prev, self.tail
        p.next = n.prev = node
        node.prev, node.next = p, n

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self.remove(node)
            self.insert(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self.insert(node)
        if len(self.cache) > self.cap:
            lru = self.head.next
            self.remove(lru)
            del self.cache[lru.key]

# Run LRU
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(f"Get(1): {cache.get(1)}")
cache.put(3, 3) # evicts key 2
print(f"Get(2): {cache.get(2)}")`
};

const CODE_IMPLEMENTATIONS = {
  python: `# --- 1. Node Class ---
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# --- 2. Creating a Linked List ---
head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

# --- 3. Traversal ---
current = head
while current:
    print(current.data)
    current = current.next

# --- 4. Insert at Beginning ---
new_node = Node(5)
new_node.next = head
head = new_node

# --- 5. Delete a Node (deleting value 20) ---
current = head
while current and current.next:
    if current.next.data == 20:
        current.next = current.next.next
        break
    current = current.next

# --- 6. Reverse Linked List ---
prev = None
current = head
while current:
    next_node = current.next
    current.next = prev
    prev = current
    current = next_node
head = prev`,

  javascript: `// --- 1. Node Class ---
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// --- 2. Creating a Linked List ---
let head = new Node(10);
head.next = new Node(20);
head.next.next = new Node(30);

// --- 3. Traversal ---
let current = head;
while (current !== null) {
    console.log(current.data);
    current = current.next;
}

// --- 4. Insert at Beginning ---
let newNode = new Node(5);
newNode.next = head;
head = newNode;

// --- 5. Delete a Node (deleting value 20) ---
current = head;
while (current !== null && current.next !== null) {
    if (current.next.data === 20) {
        current.next = current.next.next;
        break;
    }
    current = current.next;
}

// --- 6. Reverse Linked List ---
let prev = null;
current = head;
while (current !== null) {
    let nextNode = current.next;
    current.next = prev;
    prev = current;
    current = nextNode;
}
head = prev;`,

  cpp: `#include <iostream>

// --- 1. Node Struct ---
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

int main() {
    // --- 2. Creating a Linked List ---
    Node* head = new Node(10);
    head->next = new Node(20);
    head->next->next = new Node(30);

    // --- 3. Traversal ---
    Node* current = head;
    while (current != nullptr) {
        std::cout << current->data << std::endl;
        current = current->next;
    }

    // --- 4. Insert at Beginning ---
    Node* newNode = new Node(5);
    newNode->next = head;
    head = newNode;

    // --- 5. Delete a Node (deleting value 20) ---
    current = head;
    while (current != nullptr && current->next != nullptr) {
        if (current->next->data == 20) {
            Node* temp = current->next;
            current->next = current->next->next;
            delete temp;
            break;
        }
        current = current->next;
    }

    // --- 6. Reverse Linked List ---
    Node* prev = nullptr;
    current = head;
    while (current != nullptr) {
        Node* nextNode = current->next;
        current->next = prev;
        prev = current;
        current = nextNode;
    }
    head = prev;

    return 0;
}`,

  java: `// --- 1. Node Class ---
class Node {
    int data;
    Node next;
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

public class Main {
    public static void main(String[] args) {
        // --- 2. Creating a Linked List ---
        Node head = new Node(10);
        head.next = new Node(20);
        head.next.next = new Node(30);

        // --- 3. Traversal ---
        Node current = head;
        while (current != null) {
            System.out.println(current.data);
            current = current.next;
        }

        // --- 4. Insert at Beginning ---
        Node newNode = new Node(5);
        newNode.next = head;
        head = newNode;

        // --- 5. Delete a Node (deleting value 20) ---
        current = head;
        while (current != null && current.next != null) {
            if (current.next.data == 20) {
                current.next = current.next.next;
                break;
            }
            current = current.next;
        }

        // --- 6. Reverse Linked List ---
        Node prev = null;
        current = head;
        while (current != null) {
            Node nextNode = current.next;
            current.next = prev;
            prev = current;
            current = nextNode;
        }
        head = prev;
    }
}`
};

const QUIZ_QUESTIONS = [
  {
    question: "Linked Lists store elements using:",
    options: ["Indices", "Hashes", "Nodes and pointers", "Matrices"],
    answer: 2,
    explanation: "A linked list stores data in individual objects called nodes, where each node holds its value and a pointer/reference to the next node."
  },
  {
    question: "Which structure allows dynamic memory allocation?",
    options: ["Array", "Linked List", "Matrix", "Heap Sort"],
    answer: 1,
    explanation: "Linked Lists dynamically allocate memory for nodes on the heap as they are added, avoiding the static sizing limitation of arrays."
  },
  {
    question: "Which operation is O(1) in linked lists?",
    options: ["Access by Index", "Search", "Insert at Head", "Traversal"],
    answer: 2,
    explanation: "Inserting a node at the head only requires updating pointers, which does not require traversing the list and runs in constant O(1) time."
  },
  {
    question: "Linked Lists use:",
    options: ["Contiguous memory", "Sequential memory blocks", "Scattered memory locations", "Stack memory only"],
    answer: 2,
    explanation: "Unlike arrays which require a single contiguous block of memory, linked list nodes can be scattered anywhere in the heap."
  },
  {
    question: "What does each singly linked list node contain?",
    options: ["Data only", "Pointer only", "Data and next pointer", "Previous pointer only"],
    answer: 2,
    explanation: "Singly linked list nodes contain a data field and a pointer referencing the next node in the sequence."
  },
  {
    question: "Which linked list supports backward traversal?",
    options: ["Singly Linked List", "Circular Linked List", "Doubly Linked List", "Array"],
    answer: 2,
    explanation: "Doubly linked lists contain both next and previous pointers, allowing nodes to be traversed in both directions."
  },
  {
    question: "What marks the end of a linked list?",
    options: ["0", "HEAD", "NULL", "Tail Index"],
    answer: 2,
    explanation: "The next pointer of the final node in a standard linked list is set to NULL, signaling that there are no further nodes."
  },
  {
    question: "What is the time complexity of linked list traversal?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "To traverse a list, we must visit every node from HEAD to the tail, requiring O(N) linear time."
  },
  {
    question: "Which algorithm detects cycles in linked lists?",
    options: ["Binary Search", "DFS", "Floyd’s Cycle Detection", "Merge Sort"],
    answer: 2,
    explanation: "Floyd's Cycle Detection (Tortoise and Hare) uses two pointers moving at different speeds to detect cycles in linear time."
  },
  {
    question: "Which pointer references the first node?",
    options: ["ROOT", "HEAD", "TOP", "FRONT"],
    answer: 1,
    explanation: "The entry point of a linked list is tracked via the HEAD pointer."
  },
  {
    question: "Why are insertions efficient in linked lists?",
    options: ["Direct indexing", "No shifting required", "Contiguous memory", "Cache optimization"],
    answer: 1,
    explanation: "Insertions in linked lists only require re-linking pointers. Unlike arrays, no elements need to be shifted in memory."
  },
  {
    question: "Which linked list connects the last node back to the first?",
    options: ["Doubly Linked List", "Dynamic Array", "Circular Linked List", "Stack"],
    answer: 2,
    explanation: "In a circular linked list, the tail node's next pointer references the HEAD node, forming a closed loop."
  },
  {
    question: "What is a major disadvantage of linked lists?",
    options: ["Dynamic growth", "Efficient insertions", "Slow access time", "Pointer support"],
    answer: 2,
    explanation: "Because nodes are not indexed, accessing a node requires linear O(N) traversal, which is slow compared to constant O(1) array access."
  },
  {
    question: "Which structure powers browser navigation history?",
    options: ["Array", "Heap", "Doubly Linked List", "Trie"],
    answer: 2,
    explanation: "Browser back and forward navigation history fits a doubly linked list structure, allowing forwards and backwards traversal."
  },
  {
    question: "Which operation reconnects pointers during deletion?",
    options: ["Shifting", "Traversal", "Pointer reassignment", "Heapify"],
    answer: 2,
    explanation: "Deleting a node involves reassigning the predecessor's next pointer to point to the successor node."
  },
  {
    question: "Linked Lists are commonly used in:",
    options: ["Hash table chaining", "Matrix multiplication", "Binary search", "Sorting networks"],
    answer: 0,
    explanation: "Separate chaining resolves hash table collisions by attaching a linked list to each bucket."
  },
  {
    question: "Which technique finds the middle node efficiently?",
    options: ["Prefix Sum", "Binary Search", "Fast and Slow Pointers", "Heap Traversal"],
    answer: 2,
    explanation: "A slow pointer moves 1 step while a fast pointer moves 2 steps. When the fast pointer reaches the end, the slow pointer points to the middle."
  },
  {
    question: "Which linked list problem commonly uses reversal?",
    options: ["Palindrome Detection", "DFS", "Segment Trees", "Graph Coloring"],
    answer: 0,
    explanation: "Validating a palindrome linked list often involves finding the middle, reversing the second half, and comparing node values."
  },
  {
    question: "Why are linked lists less cache-friendly than arrays?",
    options: ["Fixed size", "Pointer arithmetic", "Non-contiguous memory", "Dynamic indexing"],
    answer: 2,
    explanation: "Because nodes are scattered in memory rather than contiguous, traversals trigger frequent CPU cache misses."
  },
  {
    question: "Which linked list variant stores both previous and next references?",
    options: ["Singly Linked List", "Circular Array", "Doubly Linked List", "Stack"],
    answer: 2,
    explanation: "Doubly linked lists maintain node links in both directions using next and previous pointers."
  }
];

export function LinkedListsPage() {
  const navigate = useNavigate();

  // Progress management (8 checkpoints)
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_linked_lists');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load linked lists progress:', e);
    }
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
  });

  const toggleSection = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: !prev[sectionNum] };
      localStorage.setItem('dsa_progress_linked_lists', JSON.stringify(updated));
      return updated;
    });
  };

  const SECTION_WEIGHTS: Record<number, number> = { 1: 10, 2: 15, 3: 10, 4: 15, 5: 15, 6: 10, 7: 10, 8: 15 };
  const progressPercent = Object.entries(completedSections)
    .filter(([, done]) => done)
    .reduce((sum, [key]) => sum + (SECTION_WEIGHTS[Number(key)] || 0), 0);

  // Visualization state
  const [activeVisTab, setActiveVisTab] = useState<'traversal' | 'insert-head' | 'insert-tail' | 'delete' | 'reverse'>('traversal');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<any>(null);

  useEffect(() => {
    setVisStep(0);
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVisTab]);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep] || activeSteps[0];

  const handlePlayToggle = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setVisStep((prev) => {
          if (prev >= activeSteps.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
      setPlayInterval(interval);
    }
  };

  const handleReset = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    }
    setVisStep(0);
  };

  const handleNext = () => {
    if (visStep < activeSteps.length - 1) {
      setVisStep(visStep + 1);
    }
  };

  const handlePrev = () => {
    if (visStep > 0) {
      setVisStep(visStep - 1);
    }
  };

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');

  // Quiz state
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>([]);

  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optIdx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    if (selectedOption === activeQuestions[currentQuizQuestion].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuizQuestion < activeQuestions.length - 1) {
      setCurrentQuizQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Mark Section 8 (Quiz) as completed
      setCompletedSections((prev) => {
        const updated = { ...prev, 8: true };
        localStorage.setItem('dsa_progress_linked_lists', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleRetryQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
    setCurrentQuizQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      {/* Header and Progress Bar */}
      <PageHeader
        centerContent={
          <div className="flex flex-col gap-2 w-full select-none">
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-text-muted">PROGRESS</span>
              <span className="text-accent-secondary font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-accent-secondary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,204,0.3)]" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dsa/linear-structures')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.3)]">Linked Lists</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Dynamic size and pointer-based sequence allocation
            </p>
          </div>
        </div>
      </PageHeader>

      {/* 1. INTRODUCTION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[1] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              1. Introduction
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(1)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[1] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[1] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[1] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] uppercase">
              What is a Linked List?
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                A <strong className="text-text-primary font-semibold">Linked List</strong> is a linear data structure where elements are stored as separate objects called nodes.
              </p>
              <p>
                Each node contains:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-text-primary">Data:</strong> The actual value stored in the node.</li>
                <li><strong className="text-text-primary">Pointer/Reference:</strong> The address pointing to the next node in the sequence.</li>
              </ul>
              
              <div className="mt-4">
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-2">Basic Structure:</strong>
                <div className="bg-bg-primary/50 border border-border-default/50 rounded-xl p-4 flex flex-col font-mono text-xs select-none">
                  <div className="w-full flex justify-center pb-1">
                    <div className="flex items-start gap-4 justify-center px-2">
                      {/* Node 1 & Data description */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-accent-secondary bg-bg-secondary/40 border border-border-default/30 px-3 py-1.5 rounded-lg font-bold">[10]</span>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">data</span>
                      </div>

                      <div className="flex items-center text-accent-secondary pt-2">
                        <ArrowRight size={14} className="opacity-70" />
                      </div>

                      {/* Node 2 & Pointer description */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-accent-secondary bg-bg-secondary/40 border border-border-default/30 px-3 py-1.5 rounded-lg font-bold">[20]</span>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">data</span>
                      </div>

                      <div className="flex items-center text-accent-secondary pt-2">
                        <ArrowRight size={14} className="opacity-70" />
                      </div>

                      {/* Node 3 & NULL description */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-accent-secondary bg-bg-secondary/40 border border-border-default/30 px-3 py-1.5 rounded-lg font-bold">[30 | X]</span>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">X = NULL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.3rem] uppercase">
              Why Linked Lists Exist
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Standard arrays have limitations:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>They have a <strong className="text-text-primary">fixed size</strong> (cannot dynamically grow in memory without copying).</li>
                <li>Insertions and deletions inside arrays are <strong className="text-text-primary">highly expensive</strong> (<strong className="text-accent-primary font-mono">O(N)</strong> due to index shifting).</li>
              </ul>
              <p>
                Linked Lists solve these problems by:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>Allowing <strong className="text-text-primary">dynamic memory allocation</strong> (nodes are allocated individually on the heap as needed).</li>
                <li>Enabling <strong className="text-text-primary">efficient pointer-only insertions/removals</strong> (<strong className="text-accent-primary font-mono">O(1)</strong>) without shifting elements.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-base font-bold text-accent-tertiary font-mono mb-[0.3rem] uppercase">
              Key Characteristics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mt-2">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-text-primary">
                    <th className="pr-4 pb-2">Feature</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-secondary divide-y divide-white/5 font-sans">
                  <tr>
                    <td className="pr-4 py-2.5 font-mono font-semibold text-text-primary">Dynamic Size</td>
                    <td className="py-2.5">Grows/shrinks during runtime by allocating individual nodes.</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-2.5 font-mono font-semibold text-text-primary">Non-Contiguous</td>
                    <td className="py-2.5">Nodes can exist anywhere in RAM, connected only via pointers.</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-2.5 font-mono font-semibold text-text-primary">Pointer-Based</td>
                    <td className="py-2.5">Connections are created using reference addresses.</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-2.5 font-mono font-semibold text-text-primary">Sequential Access</td>
                    <td className="py-2.5">Cannot access elements directly by index; requires traversal.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] uppercase">
              Types of Linked Lists
            </h3>
            <div className="space-y-4 font-mono">
              <div>
                <span className="text-accent-secondary text-sm font-bold block mb-1">1. Singly Linked List</span>
                <div className="bg-bg-primary/40 p-2 rounded border border-border-default/30 flex items-center gap-1 text-sm">
                  <span>[10]</span> <ArrowRight size={12} /> <span>[20]</span> <ArrowRight size={12} /> <span>[30]</span> <ArrowRight size={12} /> <span>NULL</span>
                </div>
                <span className="text-text-secondary/80 text-sm block mt-1.5 font-sans leading-relaxed">Each node points only forward to the next node.</span>
              </div>
              <div>
                <span className="text-accent-primary text-sm font-bold block mb-1">2. Doubly Linked List</span>
                <div className="bg-bg-primary/40 p-2 rounded border border-border-default/30 flex items-center gap-1 text-sm">
                  <span>NULL</span> <span>&larr; [10] &rarr;</span> <span>&larr; [20] &rarr;</span> <span>&larr; [30] &rarr;</span> <span>NULL</span>
                </div>
                <span className="text-text-secondary/80 text-sm block mt-1.5 font-sans leading-relaxed">Nodes contain both previous and next pointers.</span>
              </div>
              <div>
                <span className="text-accent-tertiary text-sm font-bold block mb-1">3. Circular Linked List</span>
                <div className="bg-bg-primary/40 p-2 rounded border border-border-default/30 flex items-center gap-1 text-sm">
                  <span>[10]</span> <ArrowRight size={12} /> <span>[20]</span> <ArrowRight size={12} /> <span>[30]</span>
                  <span className="text-accent-tertiary text-xs font-semibold ml-auto flex items-center gap-1 self-center">
                    <RotateCcw size={12} /> loops to Head
                  </span>
                </div>
                <span className="text-text-secondary/80 text-sm block mt-1.5 font-sans leading-relaxed">The last node points back to the first node.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.3rem] uppercase">
            Real-World Analogy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-secondary leading-relaxed mt-2">
            <div>
              <strong className="text-text-primary block mb-1 font-mono uppercase text-sm tracking-wider">1. Train Compartments</strong>
              <p>Train compartments are hooked sequentially. To access the 5th compartment, you must walk through compartments 1, 2, 3, and 4 first.</p>
            </div>
            <div>
              <strong className="text-text-primary block mb-1 font-mono uppercase text-sm tracking-wider">2. Treasure Hunt Clues</strong>
              <p>Clue 1 tells you the location of Clue 2. Clue 2 tells you the location of Clue 3. You cannot skip clues because the locations are not known beforehand.</p>
            </div>
            <div>
              <strong className="text-text-primary block mb-1 font-mono uppercase text-sm tracking-wider">3. Browser History</strong>
              <p>Browsing backwards and forwards page-by-page references previous and next links, matching the behavior of a doubly linked list.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE VISUALIZATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Interactive Visualization
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(2)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[2] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[2] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[2] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Visualizer Mode Switchers */}
          <div className="flex border-b border-border-default/50 gap-4 overflow-x-auto">
            {([
              { id: 'traversal', label: 'Traversal' },
              { id: 'insert-head', label: 'Insert Head' },
              { id: 'insert-tail', label: 'Insert Tail' },
              { id: 'delete', label: 'Delete Node' },
              { id: 'reverse', label: 'Reverse List' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveVisTab(tab.id);
                  handleReset();
                }}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === tab.id 
                    ? 'border-accent-primary text-accent-primary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-text-secondary uppercase">
                  Step {visStep + 1} of {activeSteps.length}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReset} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw size={16} className="opacity-70" />
                  </button>
                  <button 
                    onClick={handlePrev} 
                    disabled={visStep === 0}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Prev"
                  >
                    <SkipForward size={16} className="rotate-180 opacity-70" />
                  </button>
                  <button 
                    onClick={handlePlayToggle} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={16} className="opacity-70" /> : <Play size={16} className="opacity-70" />}
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={visStep === activeSteps.length - 1}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next"
                  >
                    <SkipForward size={16} className="opacity-70" />
                  </button>
                </div>
              </div>

              {/* Action Description */}
              <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <AlertCircle className="text-accent-primary shrink-0 mt-0.5 opacity-70" size={18} />
                <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
              </div>

              {/* Pseudocode panel */}
              <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                  pseudocode
                </div>
                {activeVisTab === 'traversal' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>curr = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>while curr is not NULL:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>    visit(curr.val)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">4</span>
                      <span>    curr = curr.next</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'insert-head' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>new_node = Node(10)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>new_node.next = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>HEAD = new_node</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'insert-tail' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>new_node = Node(30)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>curr = tail_node</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>curr.next = new_node</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'delete' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span># Search Node 20</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>prev = node_before(20)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>prev.next = prev.next.next</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'reverse' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>prev = NULL, curr = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>nxt = curr.next; curr.next = prev</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 9 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>HEAD = prev</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex flex-col justify-center items-center min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>HEAP MEMORY NODES</span>
              </div>

              {/* Graphical Nodes Row */}
              <div className="flex-1 flex items-center justify-center w-full py-12 overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-4 px-4">
                  {activeStepData.nodes.map((node, idx) => {
                    const isActive = activeStepData.activeIndex === idx;
                    const isHighlighted = activeStepData.highlightIndices?.includes(idx);
                    const pointerLabel = activeStepData.pointers?.find(p => p.index === idx)?.label;

                    let nodeStyle = 'border-border-default bg-bg-secondary text-text-secondary';
                    if (isActive) {
                      nodeStyle = 'border-accent-primary bg-accent-primary/15 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.2)]';
                    } else if (isHighlighted) {
                      nodeStyle = 'border-accent-secondary bg-accent-secondary/15 text-accent-secondary shadow-[0_0_12px_rgba(0,255,204,0.2)]';
                    }

                    return (
                      <div key={idx} className="flex items-center gap-2 sm:gap-4 relative">
                        {/* Connecting Arrow from predecessor */}
                        {idx > 0 && (
                          <div className="flex flex-col items-center justify-center text-text-muted select-none">
                            <ArrowRight size={20} className={isHighlighted ? "text-accent-secondary animate-pulse" : "text-text-muted/60"} />
                          </div>
                        )}

                        <div className="flex flex-col items-center gap-1 relative">
                          <motion.div
                            layout
                            className={`border rounded-xl flex overflow-hidden font-mono font-bold text-xs sm:text-sm shadow-md ${nodeStyle}`}
                          >
                            {/* Data side */}
                            <div className="px-3.5 py-2.5 sm:px-4 bg-bg-secondary/40 border-r border-border-default/40 flex items-center justify-center">
                              {node.val}
                            </div>
                            {/* Next reference side */}
                            <div className="px-3.5 py-2.5 sm:px-4 bg-bg-primary/20 text-text-muted flex items-center justify-center select-none font-sans">
                              {node.nextVal !== null ? '•' : 'X'}
                            </div>
                          </motion.div>
                          
                          <span className="text-[10px] text-text-muted font-mono mt-1 select-none">Node [{idx}]</span>

                          {/* Top Tag Label (new_node/prev/etc.) */}
                          {node.label && (
                            <div className="absolute -top-7 px-2 py-0.5 bg-bg-secondary border border-border-default rounded text-[9px] font-mono font-bold uppercase whitespace-nowrap text-text-secondary select-none">
                              {node.label}
                            </div>
                          )}

                          {/* Pointer Label under the node */}
                          {pointerLabel && (
                            <div className="absolute -bottom-8 px-2 py-0.5 bg-accent-primary text-bg-primary rounded text-[9px] font-mono font-bold uppercase whitespace-nowrap shadow-md select-none">
                              {pointerLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BASIC OPERATIONS AND COMPLEXITIES */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Table className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[3] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              3. Basic Operations and Complexities
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(3)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[3] 
                ? 'bg-accent-tertiary border-accent-tertiary text-bg-primary shadow-[0_0_15px_rgba(255,224,74,0.35)] hover:shadow-[0_0_20px_rgba(255,224,74,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-tertiary/35 text-accent-tertiary/50 shadow-[0_0_8px_rgba(255,224,74,0.1)] hover:border-accent-tertiary hover:text-accent-tertiary hover:shadow-[0_0_15px_rgba(255,224,74,0.3)]'
            }`}
            title={completedSections[3] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[3] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Complexity Table Card */}
          <div className="lg:col-span-5 neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem] uppercase">
              Time Complexity Table
            </h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-secondary border-b border-white/20 font-mono text-sm uppercase tracking-wider text-text-primary divide-x divide-white/20">
                    <th className="px-4 py-3">Operation</th>
                    <th className="px-4 py-3">Complexity</th>
                  </tr>
                </thead>
                <tbody className="text-base text-text-secondary divide-y divide-white/10 font-sans">
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Access</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(N)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Traversal</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(N)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Search</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(N)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Insert at Head</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(1)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Insert at Tail</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(N)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Delete at Head</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(1)</td>
                  </tr>
                  <tr className="divide-x divide-white/10">
                    <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">Delete by Value</td>
                    <td className="px-4 py-2.5 font-mono text-accent-tertiary font-bold">O(N)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Explanations Card */}
          <div className="lg:col-span-7 neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                  <span>Constant Time Insert</span>
                  <span className="text-accent-primary font-extrabold text-lg font-mono">O(1)</span>
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Inserting at the head is extremely fast because it only requires creating a node and re-linking the HEAD reference. No elements are moved in memory.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                  <span>Linear Traversal</span>
                  <span className="text-accent-secondary font-extrabold text-lg font-mono">O(N)</span>
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Searching or accessing requires sequentially visiting each node starting from the head. In the worst case, you must visit all $N$ nodes.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                  <span>Why Access is Slow</span>
                  <span className="text-accent-tertiary font-extrabold text-lg font-mono">O(N)</span>
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Unlike arrays, linked lists do not support mathematical index offsets. Since nodes are scattered in memory, finding the 10th node requires stepping through the first 9 nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERNAL WORKING */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[4] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              4. Internal Working
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(4)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[4] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[4] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[4] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Node Representation & Memory Layout */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase">
              1. Node Structure & Memory Layout
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Node Structure</strong>
                <p>Each node contains the value and the reference address of the successor node in RAM:</p>
                <div className="grid grid-cols-3 gap-2 font-mono text-sm text-center bg-bg-primary/50 p-2.5 rounded-lg border border-border-default/20 text-accent-secondary mt-2 max-w-xs mx-auto">
                  <div>[10 | 5000]</div>
                  <div>[20 | 9000]</div>
                  <div>[30 | NULL]</div>
                </div>
              </div>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Memory Layout</strong>
                <p>Unlike arrays which use a single contiguous block, linked lists are scattered dynamically in heap memory:</p>
                <div className="space-y-1.5 font-mono text-sm bg-bg-primary/30 p-2.5 rounded-lg border border-border-default/20 mt-2 max-w-xs mx-auto">
                  <div className="flex justify-between gap-4"><span>Address 1000 &rarr;</span> <span className="text-accent-secondary font-bold">[10 | 5000]</span></div>
                  <div className="flex justify-between gap-4"><span>Address 5000 &rarr;</span> <span className="text-accent-secondary font-bold">[20 | 9000]</span></div>
                  <div className="flex justify-between gap-4"><span>Address 9000 &rarr;</span> <span className="text-accent-secondary font-bold">[30 | NULL]</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pointer Traversal & Fast Insert */}
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.5rem] uppercase">
              2. Pointer Traversal & Insertion
            </h3>
            <div className="space-y-4 text-sm text-text-secondary leading-relaxed mt-2">
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">1. Start at HEAD</strong>
                <p className="text-text-secondary mt-0.5">Traversal always begins from the HEAD node.</p>
              </div>
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">2. Follow the Next Pointer</strong>
                <p className="text-text-secondary mt-0.5">Each node stores a reference to the next node in the sequence.</p>
              </div>
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">3. Stop at NULL</strong>
                <p className="text-text-secondary mt-0.5">Traversal ends when the current node's next pointer becomes NULL.</p>
              </div>
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">4. No Direct Indexing</strong>
                <p className="text-text-secondary mt-0.5">Unlike arrays, linked lists cannot access elements using an index.</p>
              </div>
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">5. Fast Insertions</strong>
                <p className="text-text-secondary mt-0.5">Adding a node only requires updating pointers; existing nodes do not need to move.</p>
              </div>
              <div>
                <strong className="text-text-primary font-mono uppercase tracking-wider block">6. Efficient for Dynamic Data</strong>
                <p className="text-text-secondary mt-0.5">Linked lists are ideal when frequent insertions and deletions are required.</p>
              </div>
            </div>
          </div>

          {/* Card 3: CPU Cache Overhead */}
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase">
              3. Hardware Performance Limitations
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">CPU Cache Friendliness</strong>
                <p>
                  Modern CPUs fetch contiguous memory segments into cache lines (spatial locality) beforehand. Because linked list nodes are scattered randomly across RAM, traversing them results in frequent <strong className="text-text-primary">CPU cache misses</strong>.
                </p>
              </div>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Pointer Dereference Overhead</strong>
                <p>
                  Every hop to a node requires resolving a pointer reference, adding translation steps. This makes linked lists slower than arrays in practice on real systems, despite their <strong className="text-accent-tertiary font-mono">O(1)</strong> theoretical insertion efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Doubly Linked Lists */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase">
              4. Doubly Linked Lists (DLL)
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Node Structure</strong>
                <p>A DLL node contains references pointing both forward and backward:</p>
                <div className="bg-bg-primary/50 border border-border-default/50 rounded-xl p-2.5 font-mono text-center text-accent-secondary text-sm">
                  [ prev_ptr | data | next_ptr ]
                </div>
              </div>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Advantages vs Disadvantages</strong>
                <div className="grid grid-cols-2 gap-4 font-mono text-sm bg-bg-primary/30 p-2.5 rounded-lg border border-border-default/20">
                  <div>
                    <span className="text-accent-secondary font-bold block mb-1 text-sm uppercase">Pros</span>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>&bull; Bidirectional traversal</li>
                      <li>&bull; Simpler deletions</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-accent-secondary font-bold block mb-1 text-sm uppercase">Cons</span>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>&bull; Extra memory (prev)</li>
                      <li>&bull; Complex pointer updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CODE IMPLEMENTATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[5] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              5. Code Implementation
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(5)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[5] 
                ? 'bg-accent-tertiary border-accent-tertiary text-bg-primary shadow-[0_0_15px_rgba(255,224,74,0.35)] hover:shadow-[0_0_20px_rgba(255,224,74,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-tertiary/35 text-accent-tertiary/50 shadow-[0_0_8px_rgba(255,224,74,0.1)] hover:border-accent-tertiary hover:text-accent-tertiary hover:shadow-[0_0_15px_rgba(255,224,74,0.3)]'
            }`}
            title={completedSections[5] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[5] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Language Tabs */}
          <div className="flex border-b border-border-default/50 gap-6 overflow-x-auto">
            {(['python', 'javascript', 'cpp', 'java'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeCodeTab === lang 
                    ? 'border-accent-tertiary text-accent-tertiary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Active Code Segment */}
          <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-x-auto relative max-h-[450px]" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <pre className="text-text-primary text-sm md:text-base py-2">{CODE_IMPLEMENTATIONS[activeCodeTab]}</pre>
          </div>
        </div>
      </section>

      {/* 6. COMMON FOUNDATIONAL PROBLEMS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[6] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              6. Common Foundational Problems
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(6)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[6] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[6] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[6] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Reverse Linked List', type: 'Pointers / Reversal', desc: 'Reverse links of a singly linked list iteratively in-place.' },
            { title: 'Detect Cycle', type: 'Floyd Tortoise & Hare', desc: 'Check if a list contains loops using fast/slow pointers.' },
            { title: 'Merge Two Sorted Lists', type: 'Two Pointers', desc: 'Combine two sorted linked lists into one sorted list.' },
            { title: 'Find Middle Node', type: 'Two Pointers', desc: 'Identify the middle node of a list in a single traversal pass.' },
            { title: 'Remove Nth Node From End', type: 'Pointers / Offset', desc: 'Delete the Nth node from the tail using fast/slow offsets.' },
            { title: 'Palindrome Linked List', type: 'Reversal / Compare', desc: 'Determine if a list reads same forwards and backwards.' },
            { title: 'Intersection of Linked Lists', type: 'Two Pointers', desc: 'Find the node where two singly linked lists merge.' },
            { title: 'LRU Cache', type: 'DLL & Hashing', desc: 'Design a Least Recently Used cache with DLL operations.' }
          ].map((prob, idx) => (
            <div 
              key={idx} 
              className="neon-card neon-card-pink flex flex-col justify-between h-full group hover:border-accent-primary/50" 
              style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary border border-border-default/50 uppercase select-none">
                  {prob.type}
                </span>
                <h4 className="text-lg font-bold text-text-primary mt-3 group-hover:text-accent-primary transition-colors">
                  {prob.title}
                </h4>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  {prob.desc}
                </p>
              </div>
              <button 
                onClick={() => navigate('/playground', { 
                  state: { 
                    code: PROBLEM_SAMPLE_CODES[prob.title as keyof typeof PROBLEM_SAMPLE_CODES], 
                    language: 'python', 
                    execute: true 
                  } 
                })}
                className="mt-6 text-sm font-mono font-bold text-accent-primary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start cursor-pointer"
              >
                Playground &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REAL-WORLD APPLICATIONS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[7] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              7. Real-World Applications
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(7)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[7] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[7] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[7] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Browser Navigation', desc: 'Back and forward history is stored using a doubly linked list.' },
            { title: 'Music Playlists', desc: 'Songs linked sequentially allow going back to previous or forwarding to next songs.' },
            { title: 'Undo/Redo Systems', desc: 'Text editors track states sequentially using linked nodes.' },
            { title: 'Memory Allocation', desc: 'Operating systems track unallocated and free RAM blocks using linked structures.' },
            { title: 'Hash Table Chaining', desc: 'Separate chaining uses singly linked lists to handle hash key collisions.' },
            { title: 'Image Viewers', desc: 'Sequential slide navigation uses next and previous image links.' },
            { title: 'Blockchain Structures', desc: 'Cryptographic block headers link to parent block hashes, forming a sequential chain.' }
          ].map((app, idx) => (
            <div 
              key={idx} 
              className="neon-card flex flex-col justify-start" 
              style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] uppercase">
                {app.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {app.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. QUIZ SECTION */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[8] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              8. Linked Lists Quiz
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-primary uppercase tracking-wider select-none">
                  QUESTION {currentQuizQuestion + 1} OF {activeQuestions.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-semibold text-text-primary leading-relaxed">
                  {activeQuestions[currentQuizQuestion].question}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQuestions[currentQuizQuestion].options.map((option, idx) => {
                    let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                    if (selectedOption === idx) {
                      if (isAnswered) {
                        optionStyle = idx === activeQuestions[currentQuizQuestion].answer
                          ? "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                          : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                      } else {
                        optionStyle = "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                      }
                    } else if (isAnswered && idx === activeQuestions[currentQuizQuestion].answer) {
                      optionStyle = "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleOptionSelect(idx)}
                        className={`text-left py-2.5 px-4 rounded-xl transition-all duration-200 leading-relaxed cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 border-current">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswered ? (
                <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6 font-sans">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase tracking-wider ${selectedOption === activeQuestions[currentQuizQuestion].answer ? 'text-success' : 'text-error'}`}>
                      {selectedOption === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeQuestions[currentQuizQuestion].explanation}
                  </p>
                  
                  <div className="pt-6 mt-4 border-t border-border-default/20">
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-4 bg-accent-primary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,45,120,0.25)] hover:shadow-[0_0_20px_rgba(255,45,120,0.45)] cursor-pointer"
                    >
                      {currentQuizQuestion < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    disabled={selectedOption === null}
                    onClick={handleAnswerSubmit}
                    className={`w-full py-4 bg-transparent border font-mono font-bold text-base tracking-wider uppercase rounded-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer ${
                      selectedOption === null 
                        ? 'border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary/10 hover:shadow-[0_0_15px_rgba(255,224,74,0.2)] disabled:opacity-40' 
                        : 'border-success text-success hover:bg-success/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] shadow-[0_0_10px_rgba(0,255,204,0.15)]'
                    }`}
                  >
                    Submit Answer
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-6 select-none">
              <Award className="text-accent-primary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-primary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetryQuiz}
                  className="px-14 py-4 bg-bg-secondary border border-border-default text-text-primary font-mono font-bold text-base tracking-wider uppercase rounded-lg hover:border-accent-primary/50 hover:text-accent-primary transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

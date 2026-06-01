import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  SkipForward, 
  Play, 
  Pause, 
  AlertCircle, 
  Award, 
  CheckCircle2, 
  XCircle,
  Network,
  Check,
  Layers
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface TreeNode {
  id: string;
  label: string;
  cx: number;
  cy: number;
  isRoot?: boolean;
  isLeaf?: boolean;
  highlighted?: boolean;
  isTraversed?: boolean;
  traverseOrder?: number;
}

interface TreeEdge {
  from: string;
  to: string;
  highlighted?: boolean;
  hasArrow?: boolean;
}

interface VisStep {
  title: string;
  description: string;
  conceptInfo: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  showOrder?: boolean;
  isRecursiveFlowchart?: boolean;
}

const activeSteps: VisStep[] = [
  {
    title: 'Root Node',
    description: 'Every tree begins from the root. It is the starting point of the structure and has no parent.',
    conceptInfo: '10 is the:\n\nROOT NODE\n\nEvery tree begins from the root.',
    nodes: [
      { id: '10', label: '10', cx: 150, cy: 70, isRoot: true, highlighted: true }
    ],
    edges: []
  },
  {
    title: 'Parent & Child',
    description: 'Nodes are connected by edges. Parent nodes point to their children. Here, 10 is the parent of 20 and 30.',
    conceptInfo: '10 is parent of 20 and 30\n20 and 30 are children of 10',
    nodes: [
      { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
      { id: '20', label: '20', cx: 90, cy: 120, highlighted: false },
      { id: '30', label: '30', cx: 210, cy: 120, highlighted: false }
    ],
    edges: [
      { from: '10', to: '20', highlighted: true, hasArrow: true },
      { from: '10', to: '30', highlighted: true, hasArrow: true }
    ]
  },
  {
    title: 'Leaf Node',
    description: 'Leaf nodes are nodes at the very bottom of the tree that have no children (out-degree of 0). Here, 40, 50, and 30 are leaves.',
    conceptInfo: 'Leaf Nodes:\n\n40, 50, 30\n\nLeaf nodes have:\n\nno children',
    nodes: [
      { id: '10', label: '10', cx: 150, cy: 50, isRoot: true },
      { id: '20', label: '20', cx: 90, cy: 110 },
      { id: '30', label: '30', cx: 210, cy: 110, isLeaf: true, highlighted: true },
      { id: '40', label: '40', cx: 50, cy: 170, isLeaf: true, highlighted: true },
      { id: '50', label: '50', cx: 130, cy: 170, isLeaf: true, highlighted: true }
    ],
    edges: [
      { from: '10', to: '20' },
      { from: '10', to: '30' },
      { from: '20', to: '40' },
      { from: '20', to: '50' }
    ]
  },
  {
    title: 'Binary Tree',
    description: 'A Binary Tree is a tree structure where each node can have a maximum of 2 children (left and right).',
    conceptInfo: 'Binary Tree Visualization\n\nA Binary Tree allows:\n\nMaximum 2 children per node',
    nodes: [
      { id: '1', label: '1', cx: 150, cy: 60, isRoot: true },
      { id: '2', label: '2', cx: 90, cy: 130 },
      { id: '3', label: '3', cx: 210, cy: 130 }
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' }
    ]
  },
  {
    title: 'Binary Search Tree (BST)',
    description: 'In a Binary Search Tree, for any given node: values in its left subtree are less than the node, and values in its right subtree are greater.',
    conceptInfo: 'Binary Search Tree (BST)\n\nBST Rule:\n\nLeft < Root < Right\n\nExample:\n        [50]\n       /    \\\n    [30]   [70]\n    / \\     / \\\n [20][40][60][80]',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105 },
      { id: '20', label: '20', cx: 60, cy: 165, isLeaf: true },
      { id: '40', label: '40', cx: 120, cy: 165, isLeaf: true },
      { id: '60', label: '60', cx: 180, cy: 165, isLeaf: true },
      { id: '80', label: '80', cx: 240, cy: 165, isLeaf: true }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'BST Search - Step 1',
    description: 'We search for 60. First, we compare 60 with root 50. Since 60 > 50, we traverse right.',
    conceptInfo: 'BST Search Visualization\n\nSearch 60.\n\nStep 1\n60 > 50 → move right',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, highlighted: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105 },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165 },
      { id: '80', label: '80', cx: 240, cy: 165 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70', highlighted: true, hasArrow: true },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'BST Search - Step 2',
    description: 'Next, compare target 60 with 70. Since 60 < 70, we traverse left.',
    conceptInfo: 'BST Search Visualization\n\nSearch 60.\n\nStep 2\n60 < 70 → move left',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105, highlighted: true },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165 },
      { id: '80', label: '80', cx: 240, cy: 165 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60', highlighted: true, hasArrow: true },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'BST Search - Step 3',
    description: 'Finally, compare target 60 with node 60. Values match. Found target!',
    conceptInfo: 'BST Search Visualization\n\nSearch 60.\n\nStep 3\nFound 60',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105 },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165, highlighted: true },
      { id: '80', label: '80', cx: 240, cy: 165 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'Inorder Traversal',
    description: 'Inorder traversal recursively visits the left subtree, then the root node, and then the right subtree. It yields sorted keys in a BST.',
    conceptInfo: 'Inorder Traversal\n\nRule:\nLeft → Root → Right\n\nExample:\n20 → 30 → 40 → 50 → 60 → 70 → 80',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, isTraversed: true, traverseOrder: 4 },
      { id: '30', label: '30', cx: 95, cy: 105, isTraversed: true, traverseOrder: 2 },
      { id: '70', label: '70', cx: 205, cy: 105, isTraversed: true, traverseOrder: 6 },
      { id: '20', label: '20', cx: 60, cy: 165, isTraversed: true, traverseOrder: 1 },
      { id: '40', label: '40', cx: 120, cy: 165, isTraversed: true, traverseOrder: 3 },
      { id: '60', label: '60', cx: 180, cy: 165, isTraversed: true, traverseOrder: 5 },
      { id: '80', label: '80', cx: 240, cy: 165, isTraversed: true, traverseOrder: 7 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ],
    showOrder: true
  },
  {
    title: 'Preorder Traversal',
    description: 'Preorder traversal visits the root node first, then recursively traverses the left and right subtrees.',
    conceptInfo: 'Preorder Traversal\n\nRule:\nRoot → Left → Right\n\nExample:\n50 → 30 → 20 → 40 → 70 → 60 → 80',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, isTraversed: true, traverseOrder: 1 },
      { id: '30', label: '30', cx: 95, cy: 105, isTraversed: true, traverseOrder: 2 },
      { id: '70', label: '70', cx: 205, cy: 105, isTraversed: true, traverseOrder: 5 },
      { id: '20', label: '20', cx: 60, cy: 165, isTraversed: true, traverseOrder: 3 },
      { id: '40', label: '40', cx: 120, cy: 165, isTraversed: true, traverseOrder: 4 },
      { id: '60', label: '60', cx: 180, cy: 165, isTraversed: true, traverseOrder: 6 },
      { id: '80', label: '80', cx: 240, cy: 165, isTraversed: true, traverseOrder: 7 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ],
    showOrder: true
  },
  {
    title: 'Postorder Traversal',
    description: 'Postorder traversal recursively traverses the left and right subtrees first, and visits the root node last.',
    conceptInfo: 'Postorder Traversal\n\nRule:\nLeft → Right → Root\n\nExample:\n20 → 40 → 30 → 60 → 80 → 70 → 50',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, isTraversed: true, traverseOrder: 7 },
      { id: '30', label: '30', cx: 95, cy: 105, isTraversed: true, traverseOrder: 3 },
      { id: '70', label: '70', cx: 205, cy: 105, isTraversed: true, traverseOrder: 6 },
      { id: '20', label: '20', cx: 60, cy: 165, isTraversed: true, traverseOrder: 1 },
      { id: '40', label: '40', cx: 120, cy: 165, isTraversed: true, traverseOrder: 2 },
      { id: '60', label: '60', cx: 180, cy: 165, isTraversed: true, traverseOrder: 4 },
      { id: '80', label: '80', cx: 240, cy: 165, isTraversed: true, traverseOrder: 5 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ],
    showOrder: true
  },
  {
    title: 'Level Order Traversal',
    description: 'Level order traversal (BFS) visits nodes level by level from top to bottom, using a Queue.',
    conceptInfo: 'Level Order Traversal\n\nUses:\nQueue (FIFO)\n\nExample:\n50 → 30 → 70 → 20 → 40 → 60 → 80',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, isTraversed: true, traverseOrder: 1 },
      { id: '30', label: '30', cx: 95, cy: 105, isTraversed: true, traverseOrder: 2 },
      { id: '70', label: '70', cx: 205, cy: 105, isTraversed: true, traverseOrder: 3 },
      { id: '20', label: '20', cx: 60, cy: 165, isTraversed: true, traverseOrder: 4 },
      { id: '40', label: '40', cx: 120, cy: 165, isTraversed: true, traverseOrder: 5 },
      { id: '60', label: '60', cx: 180, cy: 165, isTraversed: true, traverseOrder: 6 },
      { id: '80', label: '80', cx: 240, cy: 165, isTraversed: true, traverseOrder: 7 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ],
    showOrder: true
  },
  {
    title: 'Tree Height',
    description: 'The height of a tree is the length of the longest path from the root to a leaf node. Here, the height is 3.',
    conceptInfo: 'Tree Height Visualization\n\nHeight:\n3\n\nLongest path:\n10 → 20 → 30',
    nodes: [
      { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
      { id: '20', label: '20', cx: 110, cy: 110, highlighted: true },
      { id: '30', label: '30', cx: 70, cy: 170, isLeaf: true, highlighted: true }
    ],
    edges: [
      { from: '10', to: '20', highlighted: true },
      { from: '20', to: '30', highlighted: true }
    ]
  },
  {
    title: 'Recursive Traversal Flow',
    description: 'Trees are heavily recursion-based. Traversing a subtree involves visiting the current node, then traversing left, and then traversing right.',
    conceptInfo: 'Recursive Traversal Flow\n\nVisit Node\n   ↓\nTraverse Left\n   ↓\nTraverse Right\n\nTrees are heavily recursion-based.',
    nodes: [],
    edges: [],
    isRecursiveFlowchart: true
  },
  {
    title: 'Real-time BST Insertion - Step 1',
    description: 'We want to insert 65. Compare 65 with root 50. Since 65 > 50, traverse right to 70.',
    conceptInfo: 'Real-Time BST Insertion\n\nInsert 65.\n\n65 > 50 → right',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true, highlighted: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105 },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165 },
      { id: '80', label: '80', cx: 240, cy: 165 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70', highlighted: true, hasArrow: true },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'Real-time BST Insertion - Step 2',
    description: 'Compare 65 with 70. Since 65 < 70, traverse left to 60.',
    conceptInfo: 'Real-Time BST Insertion\n\nInsert 65.\n\n65 < 70 → left',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105, highlighted: true },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165 },
      { id: '80', label: '80', cx: 240, cy: 165 }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60', highlighted: true, hasArrow: true },
      { from: '70', to: '80' }
    ]
  },
  {
    title: 'Real-time BST Insertion - Step 3',
    description: 'Compare 65 with 60. Since 65 > 60, traverse right. Since 60\'s right child is empty, insert 65 here.',
    conceptInfo: 'Real-Time BST Insertion\n\nInsert 65.\n\n65 > 60 → right\n\nFinal:\n        [50]\n       /    \\\n    [30]   [70]\n           /\n         [60]\n            \\\n            [65]',
    nodes: [
      { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
      { id: '30', label: '30', cx: 95, cy: 105 },
      { id: '70', label: '70', cx: 205, cy: 105 },
      { id: '20', label: '20', cx: 60, cy: 165 },
      { id: '40', label: '40', cx: 120, cy: 165 },
      { id: '60', label: '60', cx: 180, cy: 165 },
      { id: '80', label: '80', cx: 240, cy: 165 },
      { id: '65', label: '65', cx: 205, cy: 220, isLeaf: true, highlighted: true }
    ],
    edges: [
      { from: '50', to: '30' },
      { from: '50', to: '70' },
      { from: '30', to: '20' },
      { from: '30', to: '40' },
      { from: '70', to: '60' },
      { from: '70', to: '80' },
      { from: '60', to: '65', highlighted: true, hasArrow: true }
    ]
  }
];

const VISUALIZATION_STEPS: Record<string, VisStep[]> = {
  anatomy: [
    activeSteps[0], // Root Node
    activeSteps[1], // Parent & Child
    activeSteps[2], // Leaf Node
    activeSteps[3]  // Binary Tree
  ],
  bstSearch: [
    activeSteps[4], // Binary Search Tree (BST) Concept
    activeSteps[5], // BST Search - Step 1
    activeSteps[6], // BST Search - Step 2
    activeSteps[7]  // BST Search - Step 3
  ],
  bstInsertion: [
    activeSteps[14], // Real-time BST Insertion - Step 1
    activeSteps[15], // Real-time BST Insertion - Step 2
    activeSteps[16]  // Real-time BST Insertion - Step 3
  ],
  traversals: [
    activeSteps[8],  // Inorder Traversal
    activeSteps[9],  // Preorder Traversal
    activeSteps[10], // Postorder Traversal
    activeSteps[11]  // Level Order Traversal
  ],
  heightFlow: [
    activeSteps[12], // Tree Height
    activeSteps[13]  // Recursive Traversal Flow
  ]
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const quizQuestionsPool: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the top-most node in a tree called?",
    options: ["Leaf", "Edge", "Root", "Child"],
    answer: "Root",
    explanation: "The root of a tree is the unique top-most starting node. It has no parents."
  },
  {
    id: 2,
    question: "Which node has no children?",
    options: ["Parent Node", "Root Node", "Leaf Node", "Internal Node"],
    answer: "Leaf Node",
    explanation: "Leaf nodes are the terminal nodes of a tree structure, meaning they have an out-degree of 0 (no children)."
  },
  {
    id: 3,
    question: "A Binary Tree allows a maximum of:",
    options: ["1 child", "2 children", "3 children", "Unlimited children"],
    answer: "2 children",
    explanation: "By definition, each node in a Binary Tree can have at most 2 children: a left child and a right child."
  },
  {
    id: 4,
    question: "BST rule is:",
    options: ["Left > Root > Right", "Left < Root < Right", "Root < Left < Right", "Right < Left < Root"],
    answer: "Left < Root < Right",
    explanation: "For any node in a Binary Search Tree (BST), the left child's value must be strictly smaller than the parent node, and the right child's value must be strictly larger."
  },
  {
    id: 5,
    question: "Average BST search complexity is:",
    options: ["O(N²)", "O(N)", "O(log N)", "O(1)"],
    answer: "O(log N)",
    explanation: "On average, a search in a BST splits the search space in half at each step, resulting in a time complexity of O(log N)."
  },
  {
    id: 6,
    question: "Which traversal follows Left → Root → Right?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    answer: "Inorder",
    explanation: "Inorder traversal visits the left subtree, then the current root node, and then the right subtree."
  },
  {
    id: 7,
    question: "Which traversal visits Root first?",
    options: ["Inorder", "Preorder", "Postorder", "BFS"],
    answer: "Preorder",
    explanation: "Preorder traversal visits the current node (root) first, before traversing its left and right subtrees."
  },
  {
    id: 8,
    question: "Which traversal uses a queue?",
    options: ["DFS", "Inorder", "Level Order", "Postorder"],
    answer: "Level Order",
    explanation: "Level order traversal visits nodes level-by-level (BFS) using a Queue data structure (FIFO) to track siblings."
  },
  {
    id: 9,
    question: "Trees are heavily based on:",
    options: ["Iteration only", "Dynamic arrays", "Recursion", "Hashing"],
    answer: "Recursion",
    explanation: "Trees are recursive data structures (subtrees are trees themselves), making recursive traversal methods highly intuitive and common."
  },
  {
    id: 10,
    question: "Which node connects parent and child?",
    options: ["Pointer", "Edge", "Height", "Heap"],
    answer: "Edge",
    explanation: "In graph theory and tree structures, an edge is the connection line or pointer between two adjacent nodes (e.g., parent to child)."
  },
  {
    id: 11,
    question: "What is the height of a tree?",
    options: ["Total nodes", "Longest root-to-leaf path", "Total edges only", "Leaf count"],
    answer: "Longest root-to-leaf path",
    explanation: "The height of a tree is defined as the maximum path length (number of levels or nodes/edges) from the root down to the deepest leaf node."
  },
  {
    id: 12,
    question: "Which tree type is optimized for searching?",
    options: ["Heap", "Trie", "Binary Search Tree", "Graph"],
    answer: "Binary Search Tree",
    explanation: "A Binary Search Tree is specifically structured so that search lookups can bypass entire subtrees, yielding optimized search times."
  },
  {
    id: 13,
    question: "Worst-case BST search becomes:",
    options: ["O(log N)", "O(1)", "O(N)", "O(N²)"],
    answer: "O(N)",
    explanation: "In a fully skewed BST (which behaves like a linked list), searching behaves like a linear scan, requiring O(N) comparisons."
  },
  {
    id: 14,
    question: "Which traversal visits children before root?",
    options: ["Postorder", "Preorder", "Inorder", "BFS"],
    answer: "Postorder",
    explanation: "Postorder traversal visits the left subtree and right subtree completely before returning to visit the root node."
  },
  {
    id: 15,
    question: "Which application uses trees heavily?",
    options: ["File Systems", "Queue Scheduling", "Linear Search", "Stack Overflow"],
    answer: "File Systems",
    explanation: "File systems organize directories and subdirectories hierarchically, which is naturally modeled as a tree structure."
  },
  {
    id: 16,
    question: "Which structure powers autocomplete systems?",
    options: ["Stack", "Trie", "Queue", "Heap"],
    answer: "Trie",
    explanation: "A Trie (prefix tree) is a specialized search tree used to store associative keys, making it highly efficient for prefix-based autocomplete searches."
  },
  {
    id: 17,
    question: "Which tree is self-balancing?",
    options: ["Heap", "AVL Tree", "Trie", "Graph"],
    answer: "AVL Tree",
    explanation: "An AVL tree is a self-balancing binary search tree that maintains height balances to ensure O(log N) operations in all cases."
  },
  {
    id: 18,
    question: "Which traversal produces sorted output in BST?",
    options: ["Preorder", "Postorder", "Inorder", "BFS"],
    answer: "Inorder",
    explanation: "An inorder traversal (Left → Root → Right) visits BST elements in strictly increasing order."
  },
  {
    id: 19,
    question: "Which tree structure is used in databases?",
    options: ["Stack Tree", "Linked Tree", "B/B+ Trees", "Circular Tree"],
    answer: "B/B+ Trees",
    explanation: "B-Trees and B+ Trees are multi-way search trees optimized for reading and writing large blocks of data, making them perfect for file systems and database indices."
  },
  {
    id: 20,
    question: "Why are trees efficient?",
    options: ["Sequential traversal only", "Hierarchical organization and fast searching", "Contiguous memory storage", "Constant-time sorting"],
    answer: "Hierarchical organization and fast searching",
    explanation: "Trees provide a structured, hierarchical layout that enables operations (like search, insertion, deletion) to run in logarithmic O(log N) time."
  }
];

export function BasicTreesPage() {
  const navigate = useNavigate();
  const [activeVisTab, setActiveVisTab] = useState<'anatomy' | 'bstSearch' | 'bstInsertion' | 'traversals' | 'heightFlow'>('anatomy');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<any>(null);

  // Section completion state
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_basic_trees');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load basic trees progress:', e);
    }
    return { 1: false, 2: false };
  });

  const [progressPercent, setProgressPercent] = useState(0);

  // Toggle completed state of a section
  const toggleSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('dsa_progress_basic_trees', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const SECTION_WEIGHTS: Record<number, number> = { 1: 50, 2: 50 };
    const score = Object.entries(completedSections)
      .filter(([, done]) => done)
      .reduce((sum, [k]) => sum + (SECTION_WEIGHTS[Number(k)] || 0), 0);
    setProgressPercent(score);
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Quiz state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    // Select 5 random questions from pool
    const shuffled = [...quizQuestionsPool].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  // Sync section completions to localStorage
  const completeSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: true };
      localStorage.setItem('dsa_progress_basic_trees', JSON.stringify(updated));
      return updated;
    });
  };

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep];

  const handleTabChange = (tab: 'anatomy' | 'bstSearch' | 'bstInsertion' | 'traversals' | 'heightFlow') => {
    setActiveVisTab(tab);
    setVisStep(0);
    setIsPlaying(false);
  };

  // Visualizer controls
  const handleReset = () => {
    setVisStep(0);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setVisStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (visStep === activeSteps.length - 1) {
      setIsPlaying(false);
      completeSection(1); // Mark visualizer section completed
      return;
    }
    setVisStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setVisStep((prev) => {
          if (prev === activeSteps.length - 1) {
            setIsPlaying(false);
            completeSection(1);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }

    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, activeSteps]);

  // Quiz Handlers
  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    const currentQ = activeQuestions[currentQuizQuestion];
    const isCorrect = currentQ.options[selectedOption] === currentQ.answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuizQuestion === activeQuestions.length - 1) {
      setShowQuizResult(true);
      completeSection(2); // Mark quiz section completed
    } else {
      setCurrentQuizQuestion((prev) => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...quizQuestionsPool].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
    setCurrentQuizQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizScore(0);
    setShowQuizResult(false);
  };

  return (
    <div 
      className="w-full mx-auto pt-16 pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dsa/trees')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
              Basic Trees
            </h1>
            <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
              1. Interactive Visualization
            </p>
          </div>
          {/* Completion Bar */}
          <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-xs select-none">
            <span className="text-text-muted">COURSE PROGRESS</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-bg-secondary h-2.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-accent-secondary h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <span className="text-text-primary font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* SECTION 1: VISUALIZER */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center gap-2">
              <Layers className="text-accent-secondary opacity-70" size={24} />
              <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[1] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
                1. Interactive Visualization
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

          <div className="neon-card neon-card-cyan flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            {/* Operations switch tabs */}
            <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
              <button
                onClick={() => handleTabChange('anatomy')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'anatomy' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Tree Anatomy
              </button>
              <button
                onClick={() => handleTabChange('bstSearch')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'bstSearch' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                BST Search
              </button>
              <button
                onClick={() => handleTabChange('bstInsertion')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'bstInsertion' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                BST Insertion
              </button>
              <button
                onClick={() => handleTabChange('traversals')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'traversals' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Tree Traversals
              </button>
              <button
                onClick={() => handleTabChange('heightFlow')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'heightFlow' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Height & Flow
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls panel */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-text-secondary uppercase">
                    Step {visStep + 1} of {activeSteps.length}
                  </span>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleReset}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button 
                      onClick={handlePrev}
                      disabled={visStep === 0}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <SkipForward size={16} className="rotate-180" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Auto Play"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={visStep === activeSteps.length - 1}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Description Card - styled exactly like queues page */}
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Concept Details Box - styled exactly like queues page */}
                {activeStepData.conceptInfo && (
                  <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                    <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                      concept details
                    </div>
                    <div className="space-y-1 select-none">
                      <p className="text-text-secondary whitespace-pre-line leading-relaxed">{activeStepData.conceptInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area Column */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Network size={14} className="opacity-70 text-accent-secondary" />
                <span>TREE STACK BUFFER</span>
              </div>

              {activeStepData.isRecursiveFlowchart ? (
                /* Flowchart Visualization */
                <div className="flex flex-col items-center justify-center p-4 bg-bg-secondary rounded-xl border border-border-default/50 max-w-[21rem] mx-auto w-full gap-2 font-mono text-sm select-none">
                  <div className="p-3 bg-accent-secondary/15 border border-accent-secondary text-accent-secondary rounded-lg text-center font-bold w-full shadow-[0_0_12px_rgba(0,255,204,0.15)]">
                    Visit Current Node
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className="p-3 bg-bg-primary border border-border-default/40 text-text-secondary rounded-lg text-center w-full">
                    Traverse Left Subtree
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className="p-3 bg-bg-primary border border-border-default/40 text-text-secondary rounded-lg text-center w-full">
                    Traverse Right Subtree
                  </div>
                  <div className="text-[10px] text-text-muted/75 mt-2 text-center uppercase tracking-wide">
                    Uses Recursion Stack
                  </div>
                </div>
              ) : (
                /* SVG Tree Visualization */
                <svg className="w-full h-full max-h-[250px] max-w-sm mt-4 select-none" viewBox="0 0 300 240">
                  <style>{`
                    @keyframes nodePop {
                      0% {
                        transform: scale(0);
                        opacity: 0;
                      }
                      100% {
                        transform: scale(1);
                        opacity: 1;
                      }
                    }
                    @keyframes edgeDraw {
                      0% {
                        stroke-dashoffset: 100;
                      }
                      100% {
                        stroke-dashoffset: 0;
                      }
                    }
                    .node-animate {
                      animation: nodePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    }
                    .edge-animate {
                      stroke-dasharray: 100;
                      stroke-dashoffset: 100;
                      animation: edgeDraw 0.5s ease-in-out forwards;
                    }
                  `}</style>

                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="17.5"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2.5 L 10 5 L 0 7.5 z" fill="var(--color-border-default)" className="opacity-40" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="17.5"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2.5 L 10 5 L 0 7.5 z" fill="var(--color-accent-secondary)" />
                    </marker>
                  </defs>

                  {/* Draw Edges */}
                  {activeStepData.edges.map((edge, idx) => {
                    const fromNode = activeStepData.nodes.find(n => n.id === edge.from);
                    const toNode = activeStepData.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <line
                        key={`edge-${visStep}-${idx}`}
                        x1={fromNode.cx}
                        y1={fromNode.cy}
                        x2={toNode.cx}
                        y2={toNode.cy}
                        stroke={edge.highlighted ? "var(--color-accent-secondary)" : "var(--color-border-default)"}
                        strokeWidth={edge.highlighted ? 3 : 2}
                        className={`edge-animate transition-all duration-300 ${edge.highlighted ? '' : 'opacity-40'}`}
                        style={{ animationDelay: '0.1s' }}
                        markerEnd={edge.hasArrow ? (edge.highlighted ? "url(#arrow-active)" : "url(#arrow)") : undefined}
                      />
                    );
                  })}

                  {/* Draw Nodes */}
                  {activeStepData.nodes.map((node) => (
                    <g 
                      key={`node-${visStep}-${node.id}`} 
                      className="node-animate transition-all duration-300"
                      style={{ 
                        transformOrigin: `${node.cx}px ${node.cy}px`,
                        animationDelay: node.isRoot ? '0s' : '0.25s'
                      }}
                    >
                      {/* Node Circle */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={16}
                        fill="var(--color-bg-secondary)"
                        stroke={
                          node.highlighted 
                            ? "var(--color-accent-secondary)" 
                            : node.isRoot 
                            ? "var(--color-border-default)" 
                            : "var(--color-border-default)"
                        }
                        strokeWidth={node.highlighted ? 3 : 1.5}
                        className={`transition-all duration-300 ${
                          node.highlighted 
                            ? 'shadow-[0_0_12px_rgba(0,255,204,0.3)] filter drop-shadow-[0_0_6px_rgba(0,255,204,0.15)]' 
                            : 'opacity-90'
                        }`}
                      />
                      {/* Node Text Label */}
                      <text
                        x={node.cx}
                        y={node.cy + 4}
                        textAnchor="middle"
                        className={`font-mono text-[11px] font-bold select-none transition-all duration-300 fill-text-primary ${
                          node.highlighted ? 'fill-accent-secondary font-extrabold' : ''
                        }`}
                      >
                        {node.label}
                      </text>

                      {/* Optional Traversal Order Tag */}
                      {activeStepData.showOrder && node.isTraversed && node.traverseOrder && (
                        <g>
                          <circle
                            cx={node.cx + 12}
                            cy={node.cy - 12}
                            r={7.5}
                            className="fill-accent-secondary stroke-bg-primary stroke-1"
                          />
                          <text
                            x={node.cx + 12}
                            y={node.cy - 9.5}
                            textAnchor="middle"
                            className="font-mono text-[8px] font-extrabold fill-bg-primary select-none"
                          >
                            {node.traverseOrder}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>
      </section>

        {/* SECTION 2: QUIZ */}
        {activeQuestions.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center gap-2">
                <Award className="text-accent-secondary opacity-70" size={24} />
                <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
                  2. Basic Trees Quiz
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-text-muted uppercase bg-bg-secondary px-3 py-1 rounded-md border border-border-default select-none">
                Random 5 MCQs
              </span>
            </div>

            {showQuizResult ? (
              /* Quiz Finished Summary */
              <div className="neon-card neon-card-cyan flex flex-col items-center justify-center p-8 text-center gap-4">
                <Award className="text-accent-secondary animate-bounce" size={48} />
                <h3 className="text-2xl font-bold text-text-primary font-display">Quiz Completed!</h3>
                <p className="text-text-secondary max-w-sm">
                  You scored <span className="text-accent-secondary font-bold text-lg">{quizScore}</span> out of <span className="font-bold text-lg">{activeQuestions.length}</span>.
                </p>
                
                <div className="w-full max-w-xs bg-bg-secondary h-2.5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div 
                    className="bg-accent-secondary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(quizScore / activeQuestions.length) * 100}%` }} 
                  />
                </div>

                <div className="flex gap-4 w-full max-w-xs mt-6">
                  <button
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 bg-transparent border border-accent-secondary text-accent-secondary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-accent-secondary/10 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dsa/trees')}
                    className="flex-1 py-3 bg-accent-secondary text-bg-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              /* MCQ Active Question Display */
              <div className="neon-card neon-card-cyan" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
                <div className="flex justify-between items-center mb-6 font-mono text-xs text-text-muted border-b border-border-default/20 pb-4">
                  <span>QUESTION {currentQuizQuestion + 1} OF {activeQuestions.length}</span>
                  <span>SCORE: {quizScore} / {currentQuizQuestion}</span>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-8 font-sans">
                  {activeQuestions[currentQuizQuestion].question}
                </h3>

                <div className="flex flex-col gap-3 font-mono">
                  {activeQuestions[currentQuizQuestion].options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const optionLetter = String.fromCharCode(65 + idx);

                    let optionBtnClass = 'border-border-default text-text-secondary hover:bg-bg-tertiary';
                    if (isSelected) {
                      if (isAnswered) {
                        optionBtnClass = option === activeQuestions[currentQuizQuestion].answer
                          ? 'border-success text-success bg-success/10 shadow-[0_0_12px_rgba(0,255,204,0.15)] font-bold'
                          : 'border-error text-error bg-error/10 font-bold';
                      } else {
                        optionBtnClass = 'border-accent-secondary text-accent-secondary bg-accent-secondary/5 font-bold';
                      }
                    } else if (isAnswered && option === activeQuestions[currentQuizQuestion].answer) {
                      optionBtnClass = 'border-success text-success bg-success/10 font-bold';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-300 cursor-pointer ${optionBtnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 border-current">
                            {optionLetter}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isAnswered ? (
                  /* Question Answer Feedback */
                  <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6 font-sans">
                    <div className="flex items-center gap-2">
                      {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? (
                        <CheckCircle2 className="text-success" size={20} />
                      ) : (
                        <XCircle className="text-error" size={20} />
                      )}
                      <span className={`text-sm font-bold uppercase tracking-wider ${activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'text-success' : 'text-error'}`}>
                        {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {activeQuestions[currentQuizQuestion].explanation}
                    </p>
                    
                    <div className="pt-6 mt-4 border-t border-border-default/20">
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-4 bg-accent-secondary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,204,0.25)] hover:shadow-[0_0_25px_rgba(0,255,204,0.45)] cursor-pointer"
                      >
                        {currentQuizQuestion < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Answer Submit Option Button */
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      disabled={selectedOption === null}
                      onClick={handleAnswerSubmit}
                      className={`w-full py-4 bg-transparent border font-mono font-bold text-base tracking-wider uppercase rounded-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer ${
                        selectedOption === null 
                          ? 'border-accent-secondary text-accent-secondary hover:bg-accent-secondary/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.2)] disabled:opacity-40' 
                          : 'border-success text-success hover:bg-success/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] shadow-[0_0_10px_rgba(0,255,204,0.15)]'
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

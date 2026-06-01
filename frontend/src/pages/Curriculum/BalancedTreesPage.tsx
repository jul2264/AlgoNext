import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  SkipForward, 
  Play, 
  Pause, 
  Award, 
  Layers,
  AlertCircle,
  Network
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
  color?: 'red' | 'black'; // Red-Black Trees
  label2?: string; // balance factor, (val, priority), etc.
  isError?: boolean; // Highlight node in red for imbalance
  isWarning?: boolean; // Highlight node in yellow for rotation focus
  isSuccess?: boolean; // Highlight node in red/pink for balanced state
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
  nodes: TreeNode[];
  edges: TreeEdge[];
  line?: number; // Highlighted pseudocode line
}

const PSEUDOCODE_MAP: Record<string, string[]> = {
  avlBF: [
    "BF = height(left) - height(right)",
    "IF BF < -1 or BF > 1:",
    "    Imbalance detected -> Rotate node"
  ],
  avlLL: [
    "IF balance > 1 AND key < left.key:",
    "    # LL Imbalance detected",
    "    rotateRight(node) -> restore balance"
  ],
  avlRR: [
    "IF balance < -1 AND key > right.key:",
    "    # RR Imbalance detected",
    "    rotateLeft(node) -> restore balance"
  ],
  rbRules: [
    "Root must be BLACK",
    "RED nodes cannot have RED children",
    "Paths must have equal BLACK node count"
  ],
  rbBalance: [
    "IF uncle is RED: Recolor parent, uncle & grandparent",
    "IF uncle is BLACK: Perform rotation and recolor"
  ],
  treap: [
    "Value matches BST (Left < Parent < Right)",
    "Priority matches Heap (Parent > Child)",
    "Random priorities maintain average balance"
  ],
  splay: [
    "Search for target node in BST",
    "Splay accessed node to the root via rotations",
    "Accessed node becomes root for O(1) future lookups"
  ]
};

const VISUALIZATION_STEPS: Record<string, VisStep[]> = {
  avlBF: [
    {
      title: 'Balance Factor Calculation',
      description: 'Each node in an AVL tree maintains a Balance Factor (BF), calculated as: BF = Height(Left Subtree) - Height(Right Subtree). Let\'s calculate BF for the root node 20.',
      nodes: [
        { id: '20', label: '20', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, highlighted: true },
        { id: '10', label: '10', label2: 'BF: 0', cx: 90, cy: 140 },
        { id: '30', label: '30', label2: 'BF: 0', cx: 210, cy: 140 }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 1
    },
    {
      title: 'Valid AVL Node Rule',
      description: 'An AVL tree is balanced if every node has a Balance Factor of -1, 0, or +1. If any node\'s BF is outside this range, a rotation is required to restore balance.',
      nodes: [
        { id: '20', label: '20', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, highlighted: true },
        { id: '10', label: '10', label2: 'BF: 0', cx: 90, cy: 140, highlighted: true },
        { id: '30', label: '30', label2: 'BF: 0', cx: 210, cy: 140, highlighted: true }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 2
    }
  ],
  avlLL: [
    {
      title: 'Insert 30',
      description: 'Starting with an empty tree. Insert the first node 30 as the root. Height is 1, Balance Factor is 0.',
      nodes: [
        { id: '30', label: '30', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, highlighted: true }
      ],
      edges: [],
      line: 1
    },
    {
      title: 'Insert 20',
      description: 'Compare 20 with root node 30. Since 20 < 30, recursively insert 20 into the left subtree of 30. Height of 30 becomes 2, BF becomes +1.',
      nodes: [
        { id: '30', label: '30', label2: 'BF: +1', cx: 150, cy: 70, isRoot: true },
        { id: '20', label: '20', label2: 'BF: 0', cx: 90, cy: 130, highlighted: true }
      ],
      edges: [
        { from: '30', to: '20', highlighted: true }
      ],
      line: 1
    },
    {
      title: 'Insert 10 (Imbalance Created)',
      description: 'Compare 10 with 30 and 20. Since 10 < 20, insert 10 as the left child of 20. Height of 30 becomes 3, BF becomes +2. Node 30 is now unbalanced!',
      nodes: [
        { id: '30', label: '30', label2: 'BF: +2', cx: 150, cy: 70, isRoot: true },
        { id: '20', label: '20', label2: 'BF: +1', cx: 90, cy: 130 },
        { id: '10', label: '10', label2: 'BF: 0', cx: 45, cy: 190, highlighted: true }
      ],
      edges: [
        { from: '30', to: '20' },
        { from: '20', to: '10', highlighted: true }
      ],
      line: 1
    },
    {
      title: 'Detect Imbalance',
      description: 'Update height recursively and compute Balance Factor at each ancestor. Root node 30 has BF = Height(Left) - Height(Right) = 2 - 0 = +2. An imbalance is detected!',
      nodes: [
        { id: '30', label: '30', label2: 'BF: +2', cx: 150, cy: 70, isRoot: true, isError: true },
        { id: '20', label: '20', label2: 'BF: +1', cx: 90, cy: 130 },
        { id: '10', label: '10', label2: 'BF: 0', cx: 45, cy: 190 }
      ],
      edges: [
        { from: '30', to: '20' },
        { from: '20', to: '10' }
      ],
      line: 1
    },
    {
      title: 'Identify Left-Left (LL) Case',
      description: 'Since BF > 1 (+2) and the newly inserted key (10) < left child\'s key (20), we identify this as a Left-Left (LL) imbalance. This requires a Right Rotation of the root node 30.',
      nodes: [
        { id: '30', label: '30', label2: 'BF: +2', cx: 150, cy: 70, isRoot: true, isError: true },
        { id: '20', label: '20', label2: 'BF: +1', cx: 90, cy: 130, isWarning: true },
        { id: '10', label: '10', label2: 'BF: 0', cx: 45, cy: 190 }
      ],
      edges: [
        { from: '30', to: '20', highlighted: true },
        { from: '20', to: '10' }
      ],
      line: 2
    },
    {
      title: 'Execute Right Rotation',
      description: 'Perform a Right Rotation on node 30. Node 20 rotates up to become the new root. Node 30 becomes the right child of 20, and 10 remains the left child. Balance is restored!',
      nodes: [
        { id: '20', label: '20', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, isSuccess: true },
        { id: '10', label: '10', label2: 'BF: 0', cx: 90, cy: 140 },
        { id: '30', label: '30', label2: 'BF: 0', cx: 210, cy: 140 }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 3
    }
  ],
  avlRR: [
    {
      title: 'Insert 10',
      description: 'Starting with an empty tree. Insert the first node 10 as the root. Height is 1, Balance Factor is 0.',
      nodes: [
        { id: '10', label: '10', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, highlighted: true }
      ],
      edges: [],
      line: 1
    },
    {
      title: 'Insert 20',
      description: 'Compare 20 with root node 10. Since 20 > 10, insert it as the right child of 10. Height of 10 becomes 2, BF becomes -1.',
      nodes: [
        { id: '10', label: '10', label2: 'BF: -1', cx: 150, cy: 70, isRoot: true },
        { id: '20', label: '20', label2: 'BF: 0', cx: 210, cy: 130, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true }
      ],
      line: 1
    },
    {
      title: 'Insert 30 (Imbalance Created)',
      description: 'Compare 30 with 10 and 20. Since 30 > 20, insert 30 as the right child of 20. Height of 10 becomes 3, BF becomes -2. Node 10 is now unbalanced!',
      nodes: [
        { id: '10', label: '10', label2: 'BF: -2', cx: 150, cy: 70, isRoot: true },
        { id: '20', label: '20', label2: 'BF: -1', cx: 210, cy: 130 },
        { id: '30', label: '30', label2: 'BF: 0', cx: 270, cy: 190, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20' },
        { from: '20', to: '30', highlighted: true }
      ],
      line: 1
    },
    {
      title: 'Detect Imbalance',
      description: 'Update height recursively and compute Balance Factor at each ancestor. Root node 10 has BF = Height(Left) - Height(Right) = 0 - 2 = -2. An imbalance is detected!',
      nodes: [
        { id: '10', label: '10', label2: 'BF: -2', cx: 150, cy: 70, isRoot: true, isError: true },
        { id: '20', label: '20', label2: 'BF: -1', cx: 210, cy: 130 },
        { id: '30', label: '30', label2: 'BF: 0', cx: 270, cy: 190 }
      ],
      edges: [
        { from: '10', to: '20' },
        { from: '20', to: '30' }
      ],
      line: 1
    },
    {
      title: 'Identify Right-Right (RR) Case',
      description: 'Since BF < -1 (-2) and the newly inserted key (30) > right child\'s key (20), we identify this as a Right-Right (RR) imbalance. This requires a Left Rotation of the root node 10.',
      nodes: [
        { id: '10', label: '10', label2: 'BF: -2', cx: 150, cy: 70, isRoot: true, isError: true },
        { id: '20', label: '20', label2: 'BF: -1', cx: 210, cy: 130, isWarning: true },
        { id: '30', label: '30', label2: 'BF: 0', cx: 270, cy: 190 }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true },
        { from: '20', to: '30' }
      ],
      line: 2
    },
    {
      title: 'Execute Left Rotation',
      description: 'Perform a Left Rotation on node 10. Node 20 rotates up to become the new root. Node 10 becomes the left child of 20, and 30 remains the right child. Balance is restored!',
      nodes: [
        { id: '20', label: '20', label2: 'BF: 0', cx: 150, cy: 80, isRoot: true, isSuccess: true },
        { id: '10', label: '10', label2: 'BF: 0', cx: 90, cy: 140 },
        { id: '30', label: '30', label2: 'BF: 0', cx: 210, cy: 140 }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 3
    }
  ],
  rbRules: [
    {
      title: 'Rule 1: Root is always BLACK',
      description: 'Red-Black trees use a color bit (RED or BLACK) to maintain soft balance. The root node of a Red-Black Tree must always be BLACK. Node 20 is black.',
      nodes: [
        { id: '20', label: '20', color: 'black', cx: 150, cy: 80, isRoot: true, highlighted: true },
        { id: '10', label: '10', color: 'red', cx: 90, cy: 140 },
        { id: '30', label: '30', color: 'red', cx: 210, cy: 140 }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 1
    },
    {
      title: 'Rule 2: Red nodes cannot have Red children',
      description: 'No two RED nodes can be adjacent (a RED node cannot have a RED child). Since node 10 is RED, its children 5 and 15 must be BLACK. Consecutive RED nodes are invalid.',
      nodes: [
        { id: '20', label: '20', color: 'black', cx: 150, cy: 70, isRoot: true },
        { id: '10', label: '10', color: 'red', cx: 90, cy: 130, highlighted: true },
        { id: '30', label: '30', color: 'red', cx: 210, cy: 130 },
        { id: '5', label: '5', color: 'black', cx: 50, cy: 190, highlighted: true },
        { id: '15', label: '15', color: 'black', cx: 130, cy: 190, highlighted: true }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' },
        { from: '10', to: '5' },
        { from: '10', to: '15' }
      ],
      line: 2
    },
    {
      title: 'Rule 3: Equal Black Path Lengths',
      description: 'Every path from root to a leaf node must contain exactly the same number of BLACK nodes. In this tree, paths 20 → 10 → 5 and 20 → 10 → 15 each contain exactly 2 black nodes.',
      nodes: [
        { id: '20', label: '20', color: 'black', cx: 150, cy: 70, isRoot: true, highlighted: true },
        { id: '10', label: '10', color: 'red', cx: 90, cy: 130 },
        { id: '30', label: '30', color: 'red', cx: 210, cy: 130 },
        { id: '5', label: '5', color: 'black', cx: 50, cy: 190, highlighted: true },
        { id: '15', label: '15', color: 'black', cx: 130, cy: 190, highlighted: true }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' },
        { from: '10', to: '5' },
        { from: '10', to: '15' }
      ],
      line: 3
    }
  ],
  rbBalance: [
    {
      title: 'Red-Black Balancing: Recoloring & Rotations',
      description: 'Unlike AVL Trees which strictly rotate immediately on imbalance, Red-Black Trees often restore balance through node recoloring. This reduces rotation overhead and yields faster insertions.',
      nodes: [
        { id: '20', label: '20', color: 'black', cx: 150, cy: 80, isRoot: true },
        { id: '10', label: '10', color: 'red', cx: 90, cy: 140, highlighted: true },
        { id: '30', label: '30', color: 'red', cx: 210, cy: 140, highlighted: true }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' }
      ],
      line: 1
    }
  ],
  treap: [
    {
      title: 'Value (BST) Property',
      description: 'A Treap assigns a random priority to each key. It maintains the BST property for its keys: Left child value (30) < Root value (50) < Right child value (70).',
      nodes: [
        { id: '50', label: '50', label2: 'p: 90', cx: 150, cy: 80, isRoot: true, highlighted: true },
        { id: '30', label: '30', label2: 'p: 70', cx: 90, cy: 140, highlighted: true },
        { id: '70', label: '70', label2: 'p: 60', cx: 210, cy: 140, highlighted: true }
      ],
      edges: [
        { from: '50', to: '30' },
        { from: '50', to: '70' }
      ],
      line: 1
    },
    {
      title: 'Priority (Heap) Property',
      description: 'Simultaneously, a Treap maintains the Max-Heap property for node priorities: Parent priority (90) must be greater than children priorities (70 and 60).',
      nodes: [
        { id: '50', label: '50', label2: 'p: 90', cx: 150, cy: 80, isRoot: true, highlighted: true },
        { id: '30', label: '30', label2: 'p: 70', cx: 90, cy: 140, highlighted: true },
        { id: '70', label: '70', label2: 'p: 60', cx: 210, cy: 140, highlighted: true }
      ],
      edges: [
        { from: '50', to: '30' },
        { from: '50', to: '70' }
      ],
      line: 2
    },
    {
      title: 'Treap Balancing & Insertion',
      description: 'When inserting a node, its value is placed according to BST rules, and a random priority is generated. Rotations are then executed to bubble the node up until its Max-Heap priority holds. Random priorities keep the tree balanced on average.',
      nodes: [
        { id: '50', label: '50', label2: 'p: 90', cx: 150, cy: 80, isRoot: true },
        { id: '30', label: '30', label2: 'p: 70', cx: 90, cy: 140 },
        { id: '70', label: '70', label2: 'p: 60', cx: 210, cy: 140 }
      ],
      edges: [
        { from: '50', to: '30' },
        { from: '50', to: '70' }
      ],
      line: 3
    }
  ],
  splay: [
    {
      title: 'Splay Tree Search Access (Before Splay)',
      description: 'Splay trees dynamically adjust. When a node is searched, it is splayed to the root. Let\'s search for node 40 in this BST.',
      nodes: [
        { id: '20', label: '20', cx: 150, cy: 70, isRoot: true },
        { id: '10', label: '10', cx: 90, cy: 130 },
        { id: '50', label: '50', cx: 210, cy: 130 },
        { id: '40', label: '40', cx: 175, cy: 190, highlighted: true }
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '50' },
        { from: '50', to: '40', highlighted: true }
      ],
      line: 1
    },
    {
      title: 'Splay Tree Search Access (After Splaying)',
      description: 'After accessing 40, splaying rotations rotate node 40 up to the root. Now, future access to 40 will be immediate O(1) time. This optimizes trees for locally clustered lookups.',
      nodes: [
        { id: '40', label: '40', cx: 150, cy: 80, isRoot: true, isSuccess: true },
        { id: '20', label: '20', cx: 90, cy: 140 },
        { id: '50', label: '50', cx: 210, cy: 140 },
        { id: '10', label: '10', cx: 50, cy: 200 }
      ],
      edges: [
        { from: '40', to: '20' },
        { from: '40', to: '50' },
        { from: '20', to: '10' }
      ],
      line: 3
    }
  ]
};

const TABS = [
  { id: 'avlBF', label: 'AVL: Balance Factor' },
  { id: 'avlLL', label: 'AVL: LL Imbalance (Right Rotate)' },
  { id: 'avlRR', label: 'AVL: RR Imbalance (Left Rotate)' },
  { id: 'rbRules', label: 'Red-Black: Rules' },
  { id: 'rbBalance', label: 'Red-Black: Balancing' },
  { id: 'treap', label: 'Treap: BST + Heap' },
  { id: 'splay', label: 'Splay: Search Access' }
];

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the main goal of a balanced tree?",
    options: ["Reduce memory usage", "Keep tree height small", "Remove recursion", "Eliminate nodes"],
    answer: "Keep tree height small",
    explanation: "The main goal of balanced trees is to minimize the height (keep it at O(log N)), which guarantees log-time operations for lookups, insertions, and deletions."
  },
  {
    question: "A skewed BST behaves like a:",
    options: ["Heap", "Queue", "Linked List", "Trie"],
    answer: "Linked List",
    explanation: "When a BST is completely unbalanced (skewed), every node has only one child, transforming the tree structurally and algorithmically into a sequential Linked List with O(N) search."
  },
  {
    question: "Balanced trees provide average search complexity of:",
    options: ["O(N²)", "O(N)", "O(log N)", "O(1)"],
    answer: "O(log N)",
    explanation: "Because a balanced tree keeps its height tightly bounded by log2(N), searching for elements takes logarithmic time, O(log N)."
  },
  {
    question: "Which tree is strictly balanced?",
    options: ["AVL Tree", "Treap", "Heap", "Trie"],
    answer: "AVL Tree",
    explanation: "AVL trees are strictly height-balanced, requiring that the height difference between left and right subtrees differs by at most 1 for every single node."
  },
  {
    question: "AVL Trees use:",
    options: ["Colors", "Balance Factors", "Hash Functions", "Queues"],
    answer: "Balance Factors",
    explanation: "AVL Trees calculate and inspect node Balance Factors (Left Height - Right Height) to discover and localize height imbalances."
  },
  {
    question: "Valid AVL balance factor values are:",
    options: ["-1, 0, +1", "-2, 0, +2", "Any value", "Positive only"],
    answer: "-1, 0, +1",
    explanation: "An AVL node is in balance if and only if its balance factor is either -1, 0, or +1."
  },
  {
    question: "Which operation restores AVL balance?",
    options: ["Traversal", "Rotation", "Search", "Hashing"],
    answer: "Rotation",
    explanation: "Tree Rotations (Left and Right pointer adjustments) are executed to pivot nodes and restore AVL balance without violating BST ordering."
  },
  {
    question: "Which rotation fixes a Left-Left imbalance?",
    options: ["RR", "LR", "RL", "Right Rotation"],
    answer: "Right Rotation",
    explanation: "A Left-Left (LL) imbalance indicates a left-heavy branch. It is resolved by performing a single Right Rotation around the unbalanced ancestor."
  },
  {
    question: "Red-Black Trees use:",
    options: ["Heights", "Colors", "Hashes", "Arrays"],
    answer: "Colors",
    explanation: "Red-Black Trees use a color property (RED or BLACK) on each node to track and verify balance properties during updates."
  },
  {
    question: "What color must the root be in a Red-Black Tree?",
    options: ["Red", "Blue", "Black", "Green"],
    answer: "Black",
    explanation: "According to the fundamental rules of Red-Black Trees, the root node must always be BLACK."
  },
  {
    question: "Can a red node have a red child?",
    options: ["Yes", "No"],
    answer: "No",
    explanation: "No, a RED node cannot have a RED child. Red nodes must only have BLACK children, preventing consecutive red nodes along any path."
  },
  {
    question: "Which balanced tree is used by many standard libraries?",
    options: ["Trie", "Red-Black Tree", "Heap", "Graph"],
    answer: "Red-Black Tree",
    explanation: "Red-Black Trees are used by C++ std::map, Java TreeMap, and many other standard library sets/maps due to efficient recoloring and faster real-world insertions."
  },
  {
    question: "A Treap combines:",
    options: ["Queue + Stack", "BST + Heap", "AVL + Trie", "Graph + Tree"],
    answer: "BST + Heap",
    explanation: "A Treap (Tree + Heap) maintains keys in binary search tree order and priorities in heap order simultaneously."
  },
  {
    question: "Treaps maintain balance using:",
    options: ["Colors", "Random Priorities", "Heights", "Queues"],
    answer: "Random Priorities",
    explanation: "By generating random priorities for nodes upon insertion and adjusting via rotations, Treaps remain balanced with high probability."
  },
  {
    question: "Which tree moves frequently used nodes toward the root?",
    options: ["AVL", "Treap", "Splay Tree", "Heap"],
    answer: "Splay Tree",
    explanation: "Splay Trees rotate accessed nodes to the root (splaying) on every lookup, dynamically optimizing access times for frequently used keys."
  },
  {
    question: "Splay Trees are:",
    options: ["Color-based", "Self-adjusting", "Heap-based", "Static"],
    answer: "Self-adjusting",
    explanation: "Splay Trees are self-adjusting binary search trees that rearrange their structure dynamically based on node access patterns."
  },
  {
    question: "Which AVL imbalance requires a Left Rotation?",
    options: ["RR", "LL", "LR", "RL"],
    answer: "RR",
    explanation: "A Right-Right (RR) imbalance indicates a right-heavy subtree, which is fixed by a single Left Rotation."
  },
  {
    question: "Which AVL imbalance requires two rotations?",
    options: ["LL", "RR", "LR", "None"],
    answer: "LR",
    explanation: "Double rotations are required for zig-zag imbalances. A Left-Right (LR) imbalance requires a Left Rotation on the child followed by a Right Rotation on the parent."
  },
  {
    question: "What happens if a BST is not balanced?",
    options: ["Search becomes faster", "Height decreases", "Search may become O(N)", "Rotations disappear"],
    answer: "Search may become O(N)",
    explanation: "Without balancing guarantees, insertions can result in a skewed tree, degrading search, insertion, and deletion times to linear O(N) complexity."
  },
  {
    question: "Which balanced tree provides amortized complexity?",
    options: ["AVL", "Red-Black", "Splay Tree", "Trie"],
    answer: "Splay Tree",
    explanation: "Splay Trees do not guarantee O(log N) for single operations, but guarantee O(log N) average cost over a sequence of operations (amortized complexity)."
  }
];

export function BalancedTreesPage() {
  const navigate = useNavigate();
  
  // Section completion state
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('dsa_progress_balanced_trees');
    return saved ? JSON.parse(saved) : { 1: false, 2: false };
  });

  useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Visualizer Tab & Steps
  const [activeVisTab, setActiveVisTab] = useState<string>('avlBF');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab] || [];
  const activeStepData = activeSteps[currentStep] || { title: '', description: '', nodes: [], edges: [] };
  const activeStepPseudocode = PSEUDOCODE_MAP[activeVisTab] || [];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, [activeVisTab]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < activeSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
            return prev;
          }
        });
      }, 2500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, activeSteps]);

  const handlePlayPause = () => {
    if (currentStep === activeSteps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Quiz state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    const currentQ = activeQuestions[currentQuizQuestion];
    if (currentQ.options[selectedOption] === currentQ.answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuizQuestion === activeQuestions.length - 1) {
      setShowQuizResult(true);
      setCompletedSections(prev => {
        const updated = { ...prev, 1: true, 2: true };
        localStorage.setItem('dsa_progress_balanced_trees', JSON.stringify(updated));
        return updated;
      });
    } else {
      setCurrentQuizQuestion(prev => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dsa/trees')}
              className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-primary hover:text-accent-primary transition-colors group cursor-pointer"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
                <span className="text-accent-primary">Balanced</span> Trees
              </h1>
              <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
                Self-Balancing Tree Structures
              </p>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* SECTION 1: VISUALIZATION */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center gap-2">
              <Layers className="text-accent-primary opacity-70" size={24} />
              <h2 className="text-2xl font-bold font-display text-text-primary">
                1. Interactive Visualization
              </h2>
            </div>
          </div>

          <div className="neon-card neon-card-pink" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
            {/* Visualizer Custom Operation Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-border-default/20 pb-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveVisTab(tab.id)}
                  className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all duration-200 cursor-pointer ${
                    activeVisTab === tab.id
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Visualizer Controls & Description & Pseudocode */}
              <div className="flex flex-col gap-3">
                
                {/* Step indicator and Controls Row */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold font-mono text-white uppercase tracking-wider select-none">
                    STEP {currentStep + 1} OF {activeSteps.length}
                  </span>
                  
                  {/* Playback Control Icons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="p-1 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title="Reset Sequence"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={handleStepBackward}
                      disabled={currentStep === 0}
                      className="p-1 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <SkipForward size={16} className="rotate-180" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="p-1 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Auto Play"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={handleStepForward}
                      disabled={currentStep === activeSteps.length - 1}
                      className="p-1 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Description Text Box with AlertCircle */}
                <div className="bg-bg-secondary/40 border border-border-default/50 rounded-xl p-4 flex gap-3 text-left shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200">
                  <AlertCircle className="text-accent-primary shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeStepData.description}
                  </p>
                </div>

                {/* Highlighted Pseudocode Box */}
                {activeStepPseudocode.length > 0 && (
                  <div className="w-full bg-bg-secondary/40 rounded-xl border border-border-default/50 p-4 flex flex-col font-mono text-xs select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                    <div className="text-[10px] text-text-muted/75 font-bold uppercase tracking-wider mb-3 px-3">
                      Pseudocode
                    </div>
                    <div className="space-y-1.5">
                      {activeStepPseudocode.map((codeLine, idx) => {
                        const lineNum = idx + 1;
                        const isLineHighlighted = activeStepData.line === lineNum;
                        return (
                          <div 
                            key={idx}
                            className={`flex gap-4 pl-3 pr-3 py-1.5 transition-all duration-300 ${
                              isLineHighlighted 
                                ? 'bg-accent-primary/10 border-l-[3px] border-accent-primary text-text-primary font-semibold rounded-r shadow-[0_0_10px_rgba(255,45,120,0.05)]' 
                                : 'border-l-[3px] border-transparent text-text-secondary/45'
                            }`}
                          >
                            <span className={`select-none w-3 text-right text-xs md:text-sm font-bold ${isLineHighlighted ? 'text-accent-primary' : 'text-text-muted/40'}`}>{lineNum}</span>
                            <span className="whitespace-pre text-xs md:text-sm tracking-wide">{codeLine}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visualization Board */}
              <div className="flex flex-col gap-4 relative">
                {/* SVG canvas representation */}
                <div className="w-full bg-bg-secondary/40 border border-border-default/50 rounded-xl flex flex-col p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] h-[320px] justify-center relative">
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                    <Network size={14} className="opacity-70 text-accent-primary" />
                    <span>Balanced Tree Buffer</span>
                  </div>

                  <svg className="w-full h-full mt-4" viewBox="0 0 320 220">
                    <style>{`
                      @keyframes nodePop {
                        0% { transform: scale(0); opacity: 0; }
                        80% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                      }
                      @keyframes edgeDraw {
                        to { stroke-dashoffset: 0; }
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

                    {/* Draw Edges */}
                    {activeStepData.edges.map((edge) => {
                      const fromNode = activeStepData.nodes.find(n => n.id === edge.from);
                      const toNode = activeStepData.nodes.find(n => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      return (
                        <line
                          key={`edge-${activeVisTab}-${edge.from}-${edge.to}`}
                          x1={fromNode.cx}
                          y1={fromNode.cy}
                          x2={toNode.cx}
                          y2={toNode.cy}
                          stroke={edge.highlighted ? "var(--color-accent-primary)" : "var(--color-border-default)"}
                          strokeWidth={edge.highlighted ? 3 : 2}
                          className="edge-animate opacity-75"
                          style={{ animationDelay: '0.1s' }}
                        />
                      );
                    })}

                    {/* Draw Nodes */}
                    {activeStepData.nodes.map((node) => {
                      // Color selection
                      let nodeFill = "var(--color-bg-secondary)";
                      let nodeStroke = "var(--color-border-default)";
                      let textFill = "var(--color-text-primary)";
                      
                      if (node.color === 'red') {
                        nodeFill = "rgba(255, 45, 120, 0.15)";
                        nodeStroke = "var(--color-error)";
                        textFill = "var(--color-error)";
                      } else if (node.color === 'black') {
                        nodeFill = "#0c0d12";
                        nodeStroke = "rgba(255, 255, 255, 0.4)";
                        textFill = "rgba(255, 255, 255, 0.9)";
                      } else if (node.isError) {
                        nodeFill = "rgba(255, 45, 120, 0.15)";
                        nodeStroke = "var(--color-error)";
                        textFill = "var(--color-error)";
                      } else if (node.isWarning) {
                        nodeFill = "rgba(255, 224, 74, 0.15)";
                        nodeStroke = "var(--color-accent-tertiary)";
                        textFill = "var(--color-accent-tertiary)";
                      } else if (node.isSuccess) {
                        nodeFill = "rgba(255, 45, 120, 0.12)";
                        nodeStroke = "var(--color-accent-primary)";
                        textFill = "var(--color-accent-primary)";
                      } else if (node.highlighted) {
                        nodeStroke = "var(--color-accent-primary)";
                        textFill = "var(--color-accent-primary)";
                      }

                      return (
                        <g 
                          key={`node-${activeVisTab}-${node.id}`} 
                          className="node-animate"
                          style={{ 
                            transformOrigin: `${node.cx}px ${node.cy}px`,
                            animationDelay: node.isRoot ? '0s' : '0.2s'
                          }}
                        >
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.label2 && node.label2.includes('p:') ? 19 : 16}
                            fill={nodeFill}
                            stroke={nodeStroke}
                            strokeWidth={node.highlighted || node.isError || node.isWarning || node.isSuccess ? 2.5 : 1.5}
                            className={`transition-all duration-300 ${
                              node.highlighted || node.isSuccess
                                ? 'shadow-[0_0_12px_rgba(255,45,120,0.3)] filter drop-shadow-[0_0_6px_rgba(255,45,120,0.15)]' 
                                : ''
                            }`}
                          />

                          {/* Render Node Values */}
                          {node.label2 && node.label2.includes('p:') ? (
                            <>
                              <text
                                x={node.cx}
                                y={node.cy - 1}
                                textAnchor="middle"
                                className="font-mono text-[10px] font-bold fill-text-primary"
                              >
                                {node.label}
                              </text>
                              <text
                                x={node.cx}
                                y={node.cy + 9}
                                textAnchor="middle"
                                className="font-mono text-[8px] fill-text-muted"
                              >
                                {node.label2}
                              </text>
                            </>
                          ) : (
                            <text
                              x={node.cx}
                              y={node.cy + 4}
                              textAnchor="middle"
                              className="font-mono text-[11px] font-bold select-none"
                              fill={textFill}
                            >
                              {node.label}
                            </text>
                          )}

                          {/* Optional Balance Factor Badge Tag */}
                          {node.label2 && !node.label2.includes('p:') && (
                            <g>
                              <rect
                                x={node.cx - 15}
                                y={node.cy - 28}
                                width={30}
                                height={11}
                                rx={3}
                                className="fill-bg-secondary stroke-border-default/45 stroke-1"
                              />
                              <text
                                x={node.cx}
                                y={node.cy - 20}
                                textAnchor="middle"
                                className="font-mono text-[7px] font-extrabold fill-accent-primary"
                              >
                                {node.label2}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: QUIZ */}
        {activeQuestions.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center gap-2">
                <Award className="text-accent-primary opacity-70" size={24} />
                <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
                  2. Balanced Trees Quiz
                </h2>
              </div>
            </div>

            {showQuizResult ? (
              /* Quiz Finished Summary */
              <div className="neon-card neon-card-pink flex flex-col items-center justify-center p-8 text-center gap-4">
                <Award className="text-accent-primary animate-bounce" size={48} />
                <h3 className="text-2xl font-bold text-text-primary font-display">Quiz Completed!</h3>
                <p className="text-text-secondary max-w-sm">
                  You scored <span className="text-accent-primary font-bold text-lg">{quizScore}</span> out of <span className="font-bold text-lg">{activeQuestions.length}</span>.
                </p>
                
                <div className="w-full max-w-xs bg-bg-secondary h-2.5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div 
                    className="bg-accent-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(quizScore / activeQuestions.length) * 100}%` }} 
                  />
                </div>

                <div className="flex gap-4 w-full max-w-xs mt-6">
                  <button
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 bg-transparent border border-accent-primary text-accent-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-accent-primary/10 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dsa/trees')}
                    className="flex-1 py-3 bg-accent-primary text-bg-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              /* MCQ Active Question Display */
              <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
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
                        const isSelected = selectedOption === idx;
                        let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                        if (isSelected) {
                          if (isAnswered) {
                            optionStyle = option === activeQuestions[currentQuizQuestion].answer
                              ? "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]"
                              : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                          } else {
                            optionStyle = "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                          }
                        } else if (isAnswered && option === activeQuestions[currentQuizQuestion].answer) {
                          optionStyle = "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]";
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
                    /* Question Answer Feedback */
                    <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold uppercase tracking-wider ${activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'text-accent-primary' : 'text-error'}`}>
                          {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {activeQuestions[currentQuizQuestion].explanation}
                      </p>
                      
                      <div className="pt-6 mt-4 border-t border-border-default/20">
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-4 bg-accent-primary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,45,120,0.25)] hover:shadow-[0_0_25px_rgba(255,45,120,0.45)] cursor-pointer"
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
                            ? 'border-accent-primary text-accent-primary hover:bg-accent-primary/10 hover:shadow-[0_0_15px_rgba(255,45,120,0.2)] disabled:opacity-40' 
                            : 'border-accent-primary text-accent-primary hover:bg-accent-primary/10 hover:shadow-[0_0_15px_rgba(255,45,120,0.3)] shadow-[0_0_10px_rgba(255,45,120,0.15)]'
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

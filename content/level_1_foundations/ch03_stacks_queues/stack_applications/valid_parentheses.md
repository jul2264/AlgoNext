---
title: "Valid Parentheses"
difficulty: "easy"
category: "stack_applications"
tags: ["stack", "string"]
time_complexity: "O(n)"
space_complexity: "O(n)"
has_visualizer: true
visualizer_component: "StackViz"
---

# Valid Parentheses

## Description

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Examples

### Example 1
```
Input: s = "()"
Output: true
```

### Example 2
```
Input: s = "()[]{}"
Output: true
```

### Example 3
```
Input: s = "(]"
Output: false
```

### Example 4
```
Input: s = "([)]"
Output: false
```

### Example 5
```
Input: s = "{[]}"
Output: true
```

## Constraints

- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `'()[]{}'`

## Hints

1. Think about what data structure processes things in a "last in, first out" order.
2. When you encounter an opening bracket, push it onto a stack. When you encounter a closing bracket, check the top of the stack.
3. Use a hash map to store bracket pairs. Pop from the stack when you see a closing bracket and check if it matches.

## Starter Code

### Python
```python
def is_valid(s: str) -> bool:
    # Your code here
    pass
```

### C++
```cpp
#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here
    }
};
```

### Java
```java
import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}
```

## Solution

### Python
```python
def is_valid(s: str) -> bool:
    stack = []
    bracket_map = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in bracket_map:
            top = stack.pop() if stack else '#'
            if bracket_map[char] != top:
                return False
        else:
            stack.append(char)
    
    return len(stack) == 0
```

## Editorial

### Approach: Stack

Use a stack to keep track of opening brackets. When we encounter a closing bracket, we check if the top of the stack has the matching opening bracket.

**Algorithm:**
1. Create a hash map of closing → opening bracket pairs.
2. Iterate through each character in the string.
3. If it's a closing bracket, pop the stack and check for a match.
4. If it's an opening bracket, push it onto the stack.
5. At the end, the stack should be empty for a valid string.

**Time Complexity:** O(n) — single pass through the string.
**Space Complexity:** O(n) — stack can hold up to n/2 opening brackets.

## Test Cases

```json
[
  {"input": "()", "expected_output": "true", "is_hidden": false},
  {"input": "()[]{}", "expected_output": "true", "is_hidden": false},
  {"input": "(]", "expected_output": "false", "is_hidden": false},
  {"input": "{[]}", "expected_output": "true", "is_hidden": false},
  {"input": "((()))", "expected_output": "true", "is_hidden": true},
  {"input": "(()", "expected_output": "false", "is_hidden": true}
]
```

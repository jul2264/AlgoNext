---
title: "Valid Parentheses"
slug: "valid-parentheses"
difficulty: "easy"
category: "Stacks"
chapter: "Stacks & Queues"
level: "Level 1: Foundations"
time_complexity: "O(n)"
space_complexity: "O(n)"
tags: ["Stack", "String"]
hints:
  - "Use a stack of characters."
  - "When you encounter an opening bracket, push it to the top of the stack."
  - "When you encounter a closing bracket, check if the top of the stack was the opening for it. If yes, pop it from the stack. Otherwise, return false."
has_visualizer: false
order: 2
---

## Description
Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Constraints
- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `'()[]{}'`.

## Starter Code (python)
```python
class Solution:
    def isValid(self, s: str) -> bool:
        pass
```

## Solution (python)
```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}

        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)

        return not stack
```

## Editorial
We can use a Stack to solve this problem efficiently. As we iterate through the string, if we encounter an opening bracket, we push it onto the stack. If we encounter a closing bracket, we check if the stack is empty. If it is, the string is invalid. If it's not empty, we pop the top element from the stack and check if it corresponds to the current closing bracket. If it doesn't, the string is invalid. If we successfully iterate through the entire string and the stack is empty, it means all opening brackets were properly closed, and the string is valid.

## Test Cases
```json
[
  {
    "input": "s = \"()\"",
    "output": "true",
    "is_hidden": false
  },
  {
    "input": "s = \"()[]{}\"",
    "output": "true",
    "is_hidden": false
  },
  {
    "input": "s = \"(]\"",
    "output": "false",
    "is_hidden": false
  },
  {
    "input": "s = \"([)]\"",
    "output": "false",
    "is_hidden": true
  }
]
```

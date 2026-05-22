---
title: "Two Sum"
slug: "two-sum"
difficulty: "easy"
category: "Arrays & Hashing"
chapter: "Arrays & Strings"
level: "Level 1: Foundations"
time_complexity: "O(n)"
space_complexity: "O(n)"
tags: ["Array", "Hash Table"]
hints:
  - "A really brute force way would be to search for all possible pairs of numbers but that would be too slow."
  - "Try to use a hash map to store the elements you've seen so far to speed up the lookup."
has_visualizer: false
order: 1
---

## Description
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Constraints
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.

## Starter Code (python)
```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass
```

## Solution (python)
```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
```

## Editorial
The optimal approach is to use a Hash Map. As we iterate through the array, we can check if `target - current_element` exists in our hash map. If it does, we have found our pair. If it doesn't, we add the current element and its index to the hash map. This allows us to find the pair in exactly one pass!

## Test Cases
```json
[
  {
    "input": "nums = [2,7,11,15]\ntarget = 9",
    "output": "[0,1]",
    "is_hidden": false
  },
  {
    "input": "nums = [3,2,4]\ntarget = 6",
    "output": "[1,2]",
    "is_hidden": false
  },
  {
    "input": "nums = [3,3]\ntarget = 6",
    "output": "[0,1]",
    "is_hidden": true
  }
]
```

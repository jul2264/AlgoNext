---
title: "Two Sum"
difficulty: "easy"
category: "traversal_manipulation"
tags: ["array", "hash-map"]
time_complexity: "O(n)"
space_complexity: "O(n)"
has_visualizer: true
visualizer_component: "ArrayViz"
---

# Two Sum

## Description

Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Examples

### Example 1
```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

### Example 2
```
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
```

### Example 3
```
Input: nums = [3, 3], target = 6
Output: [0, 1]
```

## Constraints

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.

## Hints

1. A brute force approach would involve checking every pair of numbers. Can you think of a way to reduce the time complexity?
2. What if you could look up the complement of the current number in constant time?
3. Use a hash map to store each number and its index as you iterate. For each number, check if `target - num` exists in the map.

## Starter Code

### Python
```python
def two_sum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass
```

### C++
```cpp
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};
```

### Java
```java
import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}
```

## Solution

### Python
```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

## Editorial

### Approach: Hash Map (One-Pass)

The key insight is that for each number `num`, we need to find if `target - num` exists in the array. A hash map gives us O(1) lookup.

**Algorithm:**
1. Create an empty hash map `seen`.
2. Iterate through the array with index `i` and value `num`.
3. Compute `complement = target - num`.
4. If `complement` is in `seen`, return `[seen[complement], i]`.
5. Otherwise, store `num: i` in `seen`.

**Why it works:** We build the map as we go, so each element only looks "backward" at previously seen elements. This guarantees we don't use the same element twice.

**Time Complexity:** O(n) — single pass through the array.
**Space Complexity:** O(n) — hash map stores at most n elements.

## Test Cases

```json
[
  {"input": "[2,7,11,15]\n9", "expected_output": "[0,1]", "is_hidden": false},
  {"input": "[3,2,4]\n6", "expected_output": "[1,2]", "is_hidden": false},
  {"input": "[3,3]\n6", "expected_output": "[0,1]", "is_hidden": false},
  {"input": "[1,5,3,7,2,8]\n10", "expected_output": "[1,3]", "is_hidden": true},
  {"input": "[-1,-2,-3,-4,-5]\n-8", "expected_output": "[2,4]", "is_hidden": true}
]
```

---
title: "Kadane's Maximum Subarray"
difficulty: "medium"
category: "traversal_manipulation"
tags: ["array", "dynamic-programming", "greedy"]
time_complexity: "O(n)"
space_complexity: "O(1)"
has_visualizer: true
visualizer_component: "ArrayViz"
---

# Maximum Subarray (Kadane's Algorithm)

## Description

Given an integer array `nums`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.

## Examples

### Example 1
```
Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: The subarray [4, -1, 2, 1] has the largest sum 6.
```

### Example 2
```
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
```

### Example 3
```
Input: nums = [5, 4, -1, 7, 8]
Output: 23
Explanation: The subarray [5, 4, -1, 7, 8] has the largest sum 23.
```

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`

## Hints

1. Think about what happens when you add a negative number to your running sum. At what point should you "restart"?
2. At each position, you have two choices: extend the previous subarray or start a new one from the current element.
3. Keep track of `current_sum = max(nums[i], current_sum + nums[i])` and update `max_sum` at each step.

## Starter Code

### Python
```python
def max_subarray(nums: list[int]) -> int:
    # Your code here
    pass
```

### C++
```cpp
#include <vector>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
    }
};
```

### Java
```java
class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}
```

## Solution

### Python
```python
def max_subarray(nums: list[int]) -> int:
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
```

## Editorial

### Approach: Kadane's Algorithm

The key insight is that at each position `i`, the maximum subarray ending at `i` is either:
1. The element `nums[i]` alone (start a new subarray), or
2. `nums[i]` plus the maximum subarray ending at `i-1` (extend the previous subarray).

We choose whichever is larger: `current_sum = max(nums[i], current_sum + nums[i])`.

If `current_sum + nums[i] < nums[i]`, it means the accumulated sum has become a liability — it's better to start fresh.

**Time Complexity:** O(n) — single pass.
**Space Complexity:** O(1) — only two variables.

## Test Cases

```json
[
  {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6", "is_hidden": false},
  {"input": "[1]", "expected_output": "1", "is_hidden": false},
  {"input": "[5,4,-1,7,8]", "expected_output": "23", "is_hidden": false},
  {"input": "[-1]", "expected_output": "-1", "is_hidden": true},
  {"input": "[-2,-1,-3,-4]", "expected_output": "-1", "is_hidden": true}
]
```

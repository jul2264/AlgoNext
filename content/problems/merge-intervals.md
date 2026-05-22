---
title: "Merge Intervals"
slug: "merge-intervals"
difficulty: "medium"
category: "Intervals"
chapter: "Advanced Patterns"
level: "Level 2: Intermediate"
time_complexity: "O(n log n)"
space_complexity: "O(n)"
tags: ["Array", "Sorting"]
hints:
  - "How can sorting the intervals help us?"
  - "Sort the intervals by their start time."
  - "If the current interval begins after the previous interval ends, then they do not overlap. Otherwise, they do overlap."
has_visualizer: false
order: 1
---

## Description
Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

## Constraints
- `1 <= intervals.length <= 10^4`
- `intervals[i].length == 2`
- `0 <= starti <= endi <= 10^4`

## Starter Code (python)
```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        pass
```

## Solution (python)
```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            # if the list of merged intervals is empty or if the current
            # interval does not overlap with the previous, simply append it.
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                # otherwise, there is overlap, so we merge the current and previous
                # intervals.
                merged[-1][1] = max(merged[-1][1], interval[1])

        return merged
```

## Editorial
The most elegant way to solve interval problems is often to sort the intervals by their start times. Once sorted, we know that any overlapping intervals will be adjacent to each other. We can then iterate through the sorted intervals and merge them. We maintain a list of merged intervals. For each interval, we check if it overlaps with the last interval in our merged list. If it does, we update the end time of the last merged interval. If it doesn't, we simply append the current interval to our merged list.

## Test Cases
```json
[
  {
    "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    "output": "[[1,6],[8,10],[15,18]]",
    "is_hidden": false
  },
  {
    "input": "intervals = [[1,4],[4,5]]",
    "output": "[[1,5]]",
    "is_hidden": false
  },
  {
    "input": "intervals = [[1,4],[0,4]]",
    "output": "[[0,4]]",
    "is_hidden": true
  }
]
```

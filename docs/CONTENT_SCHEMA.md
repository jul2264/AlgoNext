# Content Schema

## Problem Markdown Format

Each problem is a Markdown file with YAML frontmatter. The file is stored under:
```
content/<level>/<chapter>/<category>/<problem_slug>.md
```

### Frontmatter Fields

```yaml
---
title: "Two Sum"                    # Required
difficulty: "easy"                  # Required: easy | medium | hard
category: "traversal_manipulation"  # Required: matches parent folder name
tags: ["array", "hash-map"]         # Optional: topic tags
time_complexity: "O(n)"             # Optional: optimal complexity
space_complexity: "O(n)"            # Optional: optimal complexity
has_visualizer: true                # Optional: default false
visualizer_component: "ArrayViz"    # Optional: React component name
---
```

### Body Sections

The Markdown body should include these sections in order:

1. **# Title** — Problem name
2. **## Description** — Full problem statement
3. **## Examples** — 2-3 worked examples with input/output/explanation
4. **## Constraints** — Input constraints
5. **## Hints** — 3-tier progressive hints (vague → directional → near-solution)
6. **## Starter Code** — Code templates per language (Python, C++, Java)
7. **## Solution** — Reference solution per language
8. **## Editorial** — Detailed approach explanation
9. **## Test Cases** — JSON array of test case objects

### Test Case Format

```json
[
  {
    "input": "[2,7,11,15]\n9",
    "expected_output": "[0,1]",
    "is_hidden": false
  }
]
```

## Metadata Files

### `_level.json`
```json
{
  "title": "Foundations",
  "description": "...",
  "order": 1,
  "icon": "foundation",
  "badge_name": "Foundation Builder",
  "chapters": 4
}
```

### `_chapter.json`
```json
{
  "title": "Arrays & Strings",
  "description": "...",
  "order": 1,
  "icon": "array"
}
```

## Adding New Problems

1. Create a new `.md` file in the appropriate category folder
2. Follow the frontmatter + body format above
3. Run `python manage.py load_content --content-dir ../content/` to load into DB

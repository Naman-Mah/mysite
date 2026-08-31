---
title: Exploring Python and Go Syntax Highlighting
date: 2026-08-31
layout: default
description: Benchmarking syntax tokenizers across languages.
---

# Syntax Highlighting Across Languages

We hand-rolled regex/state-machine tokenizers for multiple languages.

## Python Example

```py
def calculate_factorial(n):
    # Calculate factorial recursively
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

print(calculate_factorial(5))
```

## Go Example

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}
```

Here is an animated GIF sample:

![Sample GIF](/assets/sample.gif)

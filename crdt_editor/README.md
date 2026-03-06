# OOP-based CRDT Concurrent Terminal Editor

This project is a minimal, interview-ready implementation of a concurrent terminal editor using the **LSEQ (Logoot-Undo sequence) CRDT algorithm**. 
It focuses heavily on maintaining a clean Object-Oriented structure and highlighting core Data Structures and Algorithms (DSA).

## Project Structure (For VSCode)

Your main folder in VSCode should look exactly like this:

```text
crdt_editor/
├── README.md              # Project overview & interview talking points
├── CMakeLists.txt         # Build script for the C++ terminal app
│
├── src/                   # 🖥️ Part 1: The Raw C++ CS Concepts
│   ├── main.cpp           # Terminal entry point (getch interactive demo)
│   ├── LSEQTree.hpp       # DSA Core: The prefix tree (Trie) enabling CRDT
│   ├── MessageBus.hpp     # OOP Core: Thread-safe Pub/Sub (Observer Pattern)
│   └── CRDTEditor.hpp     # OOP Core: Editor component handling operations
│
└── web/                   # 🌐 Part 2: The Google Docs Clone UI
    ├── index.html         # Minimal workspace canvas & DOM
    ├── style.css          # CSS handling the colored multiplayer cursors
    ├── crdt.js            # Vanilla JS port of LSEQTree & MessageBus (using BroadcastChannel)
    └── app.js             # UI Controller handling keystrokes and updating DOM
```

## How to Present in an Interview

1. **Open VSCode** to the `crdt_editor` folder.
2. **Show the Math (C++)**: Open `src/LSEQTree.hpp` to explain the "Fractional Indexing" algorithm and "N-Ary Prefix Tree" using Red-Black trees (`std::map`).
3. **Show the Web App (Result)**: 
   - Right-click `web/index.html` and select "Open in Default Browser" (or use VSCode Live Server).
   - Duplicate the browser tab, put them side-by-side.
   - Type in Tab 1, and show how the custom JS `BroadcastChannel` perfectly synchronizes the text over to Tab 2 without corrupting the strings, just like a real collaborative editor.

## How to Compile & Run (Terminal)
```bash
mkdir build && cd build
cmake ..
cmake --build .
./crdt_editor
```

## Interview Talking Points

### 1. Data Structures & Algorithms (DSA)
- **N-ary Prefix Tree (Trie):** The underlying document structure is an implicit tree where paths from root to leaf define fractional indexes (Identifiers). 
- **Red-Black Trees (`std::map`):** We mapped the N-ary tree children using `std::map`. Because it's backed by a Red-Black Tree, it guarantees that node lookups are bounded by $O(\log k)$ and that characters are **always inherently sorted lexicographically**.
- **Depth-First Search (DFS) Traversal:** Reconstructing the actual text document from the CRDT sequence requires an pre-order Depth-First Search over the nodes, skipping tombstones.

### 2. Object-Oriented Programming (OOP)
- **Observer Pattern (Pub/Sub):** The `MessageBus` decouples the network/concurrent transport layer from the local editor application logic.
- **Encapsulation & Access Control:** Remote CRDT complexities and position allocation math are safely encapsulated inside `LSEQTree`, exposing a clean `insert/remove` interface to the editor.
- **Concurrency primitives:** Used `std::mutex` and `std::lock_guard` inside the Editor to allow safely merging asynchronous typing events from the `MessageBus`.

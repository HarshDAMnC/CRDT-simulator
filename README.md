<h1 align="center">
  🌐 Concurrent Collaborative CRDT Editor
</h1>

<p align="center">
  <strong>A full-stack, peer-to-peer visual text editor engine demonstrating state-of-the-art decentralized document synchronization without a centralized conflict-resolution server.</strong>
</p>

---

## 📖 Project Overview

This project is an interview-ready, advanced implementation of a collaborative text editor (similar to Google Docs or Figma's text engine) built securely on strong Object-Oriented limits and robust Data Structure implementations.

Traditional collaborative applications rely on **Operational Transformation (OT)** requiring a central authoritative server to lock and sequence keystrokes. This project eschews OT in favor of a mathematically commutative **Conflict-Free Replicated Data Type (CRDT)** using the **LSEQ (Logoot-Undo sequence) algorithm**.

## 🚀 Key Features

* **Decentralized Synchronization**: Peer-to-peer cross-client replication using CRDTs.
* **Fractional Indexing Core Engine**: Resolves keystroke collisions deterministically via variable-depth Rational paths rather than conflicting integers.
* **Tombstone Deletions**: Retains chronological consistency by logically blinding variables instead of physically overwriting them in memory.
* **Real-time Diagnostic Debugger**: A specialized graphical sidebar dynamically mapping human characters to their exact physical index matrices on the UI for real-time memory introspection.
* **Euclidean Cursor Navigation**: Custom mathematical approximation grids to natively map exact 2D pixel coordinates seamlessly onto a purely 1D continuous string state array.

---

## 🧠 System Architecture

The project splits conceptually into a pure math computational background layer and an interactive DOM layout layer.

```mermaid
graph TD
    UI[Vanilla HTML/JS UI Layer] --> |Keystroke Input| buffer[Hidden Buffer Capture]
    buffer --> LSEQ[LSEQ CRDT Engine]
    LSEQ --> Tree[(In-Memory Prefix Tree)]
    LSEQ --> |Broadcast Channel| MessageBus((Pub/Sub Router))
    MessageBus -.-> |Cross-Tab Sync| Peers[Remote Browsers]
    Peers -> |Remote CRDT Patch| MessageBus
    MessageBus --> LSEQ
    Tree --> |DFS State Rebuild| Render[DOM Pixel Renderer]
    Render --> UI
```

---

## 🛠 Project Structure

```text
crdt_editor/
├── CMakeLists.txt         # Build script for the foundational C++ terminal engine
├── src/                   # 🖥️ Part 1: The Raw C++ CS Concepts
│   ├── main.cpp           
│   ├── LSEQTree.hpp       # DSA Core: The prefix tree (Trie) enabling CRDT
│   ├── MessageBus.hpp     # OOP Core: Thread-safe Pub/Sub (Observer Pattern)
│   └── CRDTEditor.hpp     
└── web/                   # 🌐 Part 2: The Google Docs Web Application Engine
    ├── app.js             # UI Controller, Euclidean cursor grid maths
    ├── crdt.js            # Vanilla JS Web Port of our C++ CRDT Engine
    ├── index.html         # Application layout and debugging visualization
    └── style.css          # Fluid layout and hacker-themed cyber debugging CSS
```

---

## 🔬 Core Algorithms & Data Structures

### 1. N-ary Prefix Tree (Trie)
The base LSEQ construct models data exactly as an infinitely expansive tree. Characters map dynamically to fractional boundaries avoiding integer bounds. 

### 2. Fractional Index Allocation Matrix (The Magic)
When `User A (Site 1)` and `User B (Site 2)` type concurrently on the same spatial line, their index vectors combine mathematically:
- `allocPos(prev, next)` looks for numerical cavities.
- If $Distance = 1$ (e.g. `[1]...[2]`), LSEQ expands horizontally into **Depth 1** creating `[1, 1]` allowing infinite spatial scaling mathematically without rewriting prior strings.
- **Tie Breaker**: Path overlaps natively collapse linearly against a globally unique Site Identifier guaranteeing pure deterministic sorting consistency.

### 3. Pre-Order Depth-First Search (DFS)
To safely project the non-linear math tree sequentially into modern JavaScript Strings without breaking HTML DOM rendering speed: a $O(N)$ DFS dynamically recreates the document on render bursts bypassing logically removed **Tombstone** records entirely.

---

## ⏱️ Time Complexities (Big O Analysis)

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Allocate Pos** | $\mathcal{O}(D)$ | $D$ is fractional depth. Generating sequences algorithmically walks the gaps between left/right coordinate sequences linearly. |
| **Insert Object** | $\mathcal{O}(D \cdot B)$ | Inserting into the multi-child structure where $B$ represents the branching factor of concurrent adjacent edits. |
| **Apply Tombstone**| $\mathcal{O}(D \cdot B)$ | Follows exactly the same path iteration, mutating the node metadata boolean rather than dropping the object. |
| **Render Engine** | $\mathcal{O}(N)$ | Pure graph traversal building an output render sequence against $N$ document nodes. |

---

## 💻 Design Patterns in Use

1. **Observer Pattern**: Utilized within the native `MessageBus` classes explicitly isolating complex network IO threading out of raw deterministic editor engines.
2. **Encapsulation**: Raw fractional trees and Red-Black algorithmic properties natively refuse to expose pointers directly preventing fatal memory corruptions externally.

---

## 🎮 How to Demo For Interviews

We built a seamless visual interface exactly meant to prove the theoretical concepts out smoothly.

1. **Start the Relay Server**: Open a terminal, `cd server`, run `npm install`, and then execute `node index.js`. It will host the WebSocket relay.
2. **Start the Web UI**: Right click `web/index.html` via VSCode and select **"Open with Live Server"** (or just open it natively inside any Firefox/Chrome browser).
3. **Setup Multiplayer**: Duplicate your browser tab. Better yet, open it on a completely different computer or phone connected to the same WiFi network (using your computer's local IP address).
4. **Show Off CRDT Conflict Resolution**: 
    - Type rapidly in Tab 1, it will synchronize immediately to Tab 2 through the WebSocket.
    - Type on the exact same line simultaneously; you will notice none of the characters get scrambled.
5. **Highlight the Memory Model**: As you add/remove content natively, guide your interviewer to your Right-Sidebar. This displays the actual Fractional Index variables in real-time, mapping every individual keystroke directly onto its LSEQ algorithm tree value! 

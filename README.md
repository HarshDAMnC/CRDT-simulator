<h1 align="center">
  🌐 Concurrent Collaborative CRDT Editor
</h1>

<p align="center">
  <strong>A full-stack, peer-to-peer visual text editor engine demonstrating state-of-the-art decentralized document synchronization across multiple devices without a centralized database.</strong>
</p>

---

## 📖 Project Overview

This project is an interview-ready, advanced implementation of a real-time collaborative text editor (similar to Google Docs). Traditional collaborative applications rely on **Operational Transformation (OT)** which requires a central authoritative server to lock and sequence keystrokes sequentially. 

This project eschews OT and central servers in favor of mathematically commutative **Conflict-Free Replicated Data Types (CRDTs)** using the **LSEQ (Logoot-Undo sequence) Algorithm**.

## 🚀 Key Features

* **True Cross-Device Synchronization**: Peer-to-peer mapping using a lightweight Node.js WebSocket relay router. 
* **Fractional Indexing Core Engine**: Resolves keystroke collisions deterministically via variable-depth Rational paths rather than conflicting integers.
* **Real-time Diagnostic Debugger**: A specialized graphical sidebar dynamically mapping human characters to their exact physical index matrices on the UI for real-time memory introspection.
* **Euclidean Cursor Navigation**: Custom mathematical approximation grids implicitly map exact 2D pixel coordinates seamlessly onto a purely 1D continuous string state array.
* **Tombstone Deletions**: Retains chronological consistency by logically blinding variables instead of physically overwriting them in memory.

---

## 🧠 System Architecture

The overarching architecture decouples the theoretical CRDT structure from the raw DOM and cleanly isolates network threading out of typical UI flows.

```mermaid
graph TD
    subgraph Client_A ["Browser Client 1 (PC)"]
        UI_A["HTML/JS DOM"] --> |Keystroke Input| buffer_A["Buffer Capture"]
        buffer_A --> LSEQ_A["LSEQ CRDT Engine"]
        LSEQ_A --> Tree_A[("In-Memory Prefix Tree")]
        LSEQ_A <--> |WebSocket JSON| MessageBus_A(("Message Bus"))
    end
    
    subgraph Server ["Node.js WebSocket Relay"]
        WS["ws:// Relay Core"]
    end
    
    subgraph Client_B ["Browser Client 2 (Phone)"]
        MessageBus_B(("Message Bus")) <--> |WebSocket JSON| LSEQ_B["LSEQ CRDT Engine"]
        LSEQ_B --> Tree_B[("In-Memory Prefix Tree")]
        LSEQ_B <-- |DFS State Rebuild| UI_B["HTML/JS DOM"]
    end

    MessageBus_A == Broadcasts ==> WS
    WS == Forwards ==> MessageBus_B
```

---

## 🔬 Deep Dive: Algorithms & Data Structures

### 1. The Fractional Index Allocation Matrix (LSEQ)
When `User A (Site 1)` and `User B (Site 2)` type concurrently on the same spatial line, their index vectors combine mathematically without clashing:
- `allocPos(prev, next)` calculates infinite numerical cavities instead of adjacent absolute index variables.
- If the integer distance collapses to $1$ (e.g. going between index `[1]` and index `[2]`), LSEQ expands horizontally into **Depth 1**, allocating `[1, 1]`. This guarantees infinite scaling horizontally across branches without shifting prior character strings.
- **Tie Breaker**: Simultaneous keystrokes falling into identical physical gaps collapse against a globally unique Site Identifier attached to every `IdNode`, forcing complete deterministic sorting synchronization.

### 2. Euclidean 2D Input Abstraction
CRDT paths yield a strict 1-Dimensional stream, meaning they natively do not understand HTML layouts, text wrapping, `ArrowUp`, `ArrowDown`, or physical click trajectories.
To simulate a word processor, the engine queries the native browser Layout pipeline:
- Calculates localized Euclidean grid spans via `.getBoundingClientRect()`.
- Projects interactions using exponentiated vertical pixel barriers: `Dist = (X - charX)² + (Y - charY * 5)²` ensuring exact target snapping mapped strictly to the closest rational CRDT element underneath it.

### 3. Pre-Order Depth-First Search (DFS)
To safely project the fractional mathematical tree cleanly onto vanilla browser APIs seamlessly: an $O(N)$ DFS dynamically recreates the flat-file sequence during aggressive DOM render bursts while skipping natively blinded **Tombstone** variables.

---

## ⏱️ Big-O Time Complexities

| Operation | Complexity | Description |
| :--- | :--- | :--- |
| **Allocate Gap** | $\mathcal{O}(D)$ | $D$ equals the current sub-sequence depth. Determining optimal paths mathematically spans differences left/right dynamically. |
| **Tree Insertion** | $\mathcal{O}(D \cdot B)$ | Inserting into an N-ary tree utilizing branching factor $B$. |
| **Tombstoning**| $\mathcal{O}(D \cdot B)$ | Flagging characters via boolean variables directly parallelizing normal logical branch iterations. |
| **Complete Render** | $\mathcal{O}(N)$ | Reconstructing string layout pipelines via Pre-order Depth First Search. Can be artificially throttled natively via Sub-Tree patching logic. |

---

## 🎮 How to Run and Demo For Interviews

This interface acts natively as an interactive presentation model meant to explicitly prove out these mathematical complexities to a technical observer.

#### 1. Start the Background Services
Open two localized command shells targeting the root directory:
**Terminal 1 (The Relay Router):**
```bash
cd server
npm install
node index.js
```
**Terminal 2 (The Static HTTP Interface):**
```bash
cd web
npx serve .
```

#### 2. Cross-Device Connectivity
1. Navigate directly to `http://localhost:3000` via your main PC's web browser.
2. Ensure your smart-phone or secondary laptop connects to the exact same Wi-Fi connection.
3. Access your host machines localized Internal IPv4 on your mobile browser over Port 3000. *(e.g. `http://192.168.1.5:3000`)*.

#### 3. Proving The Concepts
- **Show Off Conflict Resolution**: Rapidly input alternating data streams immediately side-by-side using the desktop setup against your synchronized mobile instance; notice sequence consistency stays mathematically intact without lag spikes. 
- **Present the Native Matrix Tracker**: Pull observer attention securely onto the **Right-Sidebar.** As letters populate the primary grid realistically, point explicitly to the corresponding numeric mappings populating adjacent to them, highlighting the variables physically generating the LSEQ framework branches!

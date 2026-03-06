/**
 * Port of the C++ LSEQTree to exact Javascript equivalents 
 */

class IdNode {
    constructor(digit, site) {
        this.digit = digit;
        this.site = site;
    }
}

class TreeNode {
    constructor(id, val, isTombstone = true) {
        this.id = id;
        this.val = val;
        this.isTombstone = isTombstone;
        this.children = []; // We will manually keep this array sorted simulating std::map
    }
}

class LSEQTree {
    constructor() {
        this.roots = []; // Sorted array simulating std::map<IdNode, TreeNode>
    }

    _compare(a, b) {
        if (a.digit !== b.digit) return a.digit - b.digit;
        return a.site - b.site;
    }

    _findOrInsertChild(childrenList, idNode) {
        for (let i = 0; i < childrenList.length; i++) {
            const cmp = this._compare(childrenList[i].id, idNode);
            if (cmp === 0) return childrenList[i];
            if (cmp > 0) {
                // Insert here to maintain sorted order
                const newNode = new TreeNode(idNode, '\0', true);
                childrenList.splice(i, 0, newNode);
                return newNode;
            }
        }
        // Append to end
        const newNode = new TreeNode(idNode, '\0', true);
        childrenList.push(newNode);
        return newNode;
    }

    _findChild(childrenList, idNode) {
        for (let child of childrenList) {
            if (this._compare(child.id, idNode) === 0) return child;
        }
        return null; // Not found
    }

    insert(pos, val) {
        if (!pos || pos.length === 0) return;
        
        let currentLevel = this.roots;
        let current = null;
        
        for (let i = 0; i < pos.length; i++) {
            const id = pos[i];
            current = this._findOrInsertChild(currentLevel, id);
            
            if (i === pos.length - 1) {
                current.val = val;
                current.isTombstone = false;
            }
            currentLevel = current.children;
        }
    }

    remove(pos) {
        if (!pos || pos.length === 0) return;
        
        let currentLevel = this.roots;
        let current = null;
        
        for (let i = 0; i < pos.length; i++) {
            const id = pos[i];
            current = this._findChild(currentLevel, id);
            if (!current) return; // Node doesn't exist
            currentLevel = current.children;
        }
        if (current) current.isTombstone = true;
    }

    // Pre-order DFS to yield final string and raw positions array
    getDocumentState() {
        let text = "";
        let visiblePositions = [];
        let currentPath = [];

        const dfs = (node) => {
            currentPath.push(node.id);
            if (!node.isTombstone) {
                text += node.val;
                visiblePositions.push([...currentPath]); // Clone array
            }
            for (let child of node.children) {
                dfs(child);
            }
            currentPath.pop();
        };

        for (let root of this.roots) {
            dfs(root);
        }

        return { text, positions: visiblePositions };
    }

    allocatePos(prev, next, site) {
        let res = [];
        let depth = 0;
        const BASE = 100;
        
        while (true) {
            let pDigit = (prev && depth < prev.length) ? prev[depth].digit : 0;
            let nDigit = (next && depth < next.length) ? next[depth].digit : BASE;
            
            let diff = nDigit - pDigit;
            if (diff > 1) {
                res.push(new IdNode(pDigit + 1, site));
                return res;
            } else {
                res.push(new IdNode(pDigit, (prev && depth < prev.length) ? prev[depth].site : site));
                depth++;
            }
        }
    }
}

// Javascript implementation of our MessageBus using BroadcastChannel for Cross-Tab Sync
class MessageBus {
    constructor() {
        this.subscribers = [];
        // The BroadcastChannel API natively syncs data between different tabs of the same domain
        this.channel = new BroadcastChannel('crdt_editor_sync');
        
        this.channel.onmessage = (event) => {
            const op = event.data;
            
            // FIX: When receiving data across BroadcastChannel, the IdNode class prototype is lost.
            // We must resurrect the raw plain array of objects back into actual IdNode instances
            // so our tree comparisons work!
            if (op.pos && Array.isArray(op.pos)) {
                op.pos = op.pos.map(node => new IdNode(node.digit, node.site));
            }

            for (let cb of this.subscribers) {
                cb(op);
            }
        };
    }
    
    subscribe(cb) {
        this.subscribers.push(cb);
    }
    
    broadcast(op) {
        // First, simulate local multi-user routing for elements inside THIS same tab
        setTimeout(() => {
            for (let cb of this.subscribers) {
                cb(op);
            }
        }, 10);
        
        // Second, physically broadcast the packet to all OTHER open tabs
        this.channel.postMessage(op);
    }
}

// Global Exports
window.LSEQTree = LSEQTree;
window.MessageBus = MessageBus;
window.OpType = { INSERT: 'INSERT', DELETE: 'DELETE' };

#pragma once
#include <vector>
#include <map>
#include <memory>
#include <string>

// DSA Concept: Fractional Indexing node representation
struct IdNode {
    int digit;
    int site; // Tie-breaker for identical positions
    
    // Crucial for std::map to maintain Red-Black tree properties
    bool operator<(const IdNode& o) const {
        if (digit != o.digit) return digit < o.digit;
        return site < o.site;
    }
    bool operator==(const IdNode& o) const {
        return digit == o.digit && site == o.site;
    }
};

using Position = std::vector<IdNode>;

// DSA Concept: N-Ary tree node containing tombstone data
struct TreeNode {
    IdNode id;
    char val;
    bool isTombstone;
    
    // We use std::map (Red-Black tree) so children are sorted naturally in O(N log N)
    std::map<IdNode, std::unique_ptr<TreeNode>> children;
    
    TreeNode(IdNode i, char v, bool tomb = true) 
        : id(i), val(v), isTombstone(tomb) {}
};


class LSEQTree {
    std::map<IdNode, std::unique_ptr<TreeNode>> roots;

public:
    void insert(const Position& pos, char val) {
        if (pos.empty()) return;
        
        std::map<IdNode, std::unique_ptr<TreeNode>>* currentLevel = &roots;
        TreeNode* current = nullptr;
        
        for (size_t i = 0; i < pos.size(); ++i) {
            const auto& id = pos[i];
            // Lazily evaluate branch prefixes that might not exist 
            if (currentLevel->find(id) == currentLevel->end()) {
                (*currentLevel)[id] = std::make_unique<TreeNode>(id, '\0', true);
            }
            
            current = (*currentLevel)[id].get();
            
            // Reached leaf representing exact position
            if (i == pos.size() - 1) {
                current->val = val;
                current->isTombstone = false;
            }
            currentLevel = &(current->children);
        }
    }

    void remove(const Position& pos) {
        if (pos.empty()) return;
        std::map<IdNode, std::unique_ptr<TreeNode>>* currentLevel = &roots;
        TreeNode* current = nullptr;
        
        for (size_t i = 0; i < pos.size(); ++i) {
            const auto& id = pos[i];
            if (currentLevel->find(id) == currentLevel->end()) return;
            current = (*currentLevel)[id].get();
            currentLevel = &(current->children);
        }
        if (current) current->isTombstone = true; // CRDT soft-delete logic
    }

    // DSA Concept: Pre-Order DFS to derive final string
    std::string getText() const {
        std::string res;
        for (const auto& [id, node] : roots) {
            dfs(node.get(), res);
        }
        return res;
    }

    // Returns all visible identifiers for calculating allocations bounds
    std::vector<Position> getAllPositions() const {
        std::vector<Position> visible;
        Position currentPath;
        for (const auto& [id, node] : roots) {
            dfsPosition(node.get(), currentPath, visible);
        }
        return visible;
    }

    // Allocates a string identity between left and right fractional trees
    Position allocatePos(const Position& prev, const Position& next, int site) {
        Position res;
        int depth = 0;
        int BASE = 100;
        
        while (true) {
            int pDigit = (depth < prev.size()) ? prev[depth].digit : 0;
            int nDigit = (depth < next.size()) ? next[depth].digit : BASE;
            
            int diff = nDigit - pDigit;
            if (diff > 1) {
                res.push_back({pDigit + 1, site});
                return res;
            } else {
                res.push_back({pDigit, (depth < prev.size()) ? prev[depth].site : site});
                depth++;
            }
        }
    }

private:
    void dfs(TreeNode* node, std::string& res) const {
        if (!node->isTombstone) res += node->val;
        for (const auto& [childId, childNode] : node->children) {
            dfs(childNode.get(), res);
        }
    }
    
    void dfsPosition(TreeNode* node, Position& currentPath, std::vector<Position>& visible) const {
        currentPath.push_back(node->id);
        if (!node->isTombstone) visible.push_back(currentPath);
        for (const auto& [childId, childNode] : node->children) {
            dfsPosition(childNode.get(), currentPath, visible);
        }
        currentPath.pop_back(); // backtrack
    }
};

#pragma once
#include "LSEQTree.hpp"
#include "MessageBus.hpp"
#include <mutex>

// OOP Concept: Encapsulation. Wraps CRDT rules locally and 
// responds intelligently to broad casted network events.
class CRDTEditor {
    int siteId;
    LSEQTree tree;
    MessageBus& bus;
    
    // Concurrency guard to protect the local LSEQTree 
    // from remote edits triggering concurrently while typing
    mutable std::mutex mtx; 

public:
    CRDTEditor(int id, MessageBus& b) : siteId(id), bus(b) {
        // Observer hook bridging network ops into local space
        bus.subscribe([this](const Operation& op) {
            if (op.originSite != this->siteId) {
                applyRemote(op);
            }
        });
    }

    void typeChar(size_t index, char c) {
        std::lock_guard<std::mutex> lock(mtx);
        
        auto positions = tree.getAllPositions();
        
        // Handle bounding constraints and base allocations
        Position prev = (index > 0 && index <= positions.size()) ? positions[index - 1] : Position();
        Position next = (index < positions.size()) ? positions[index] : Position();
        
        // Generate stateless mathematical identifier
        Position newPos = tree.allocatePos(prev, next, siteId);
        
        // Commutative Insert local tree
        tree.insert(newPos, c);
        
        // Broadcast immutable intent
        bus.broadcast({OpType::INSERT, newPos, c, siteId});
    }

    void deleteChar(size_t index) {
        std::lock_guard<std::mutex> lock(mtx);
        auto positions = tree.getAllPositions();
        
        if (index >= positions.size()) return;
        
        Position target = positions[index];
        tree.remove(target);
        bus.broadcast({OpType::DELETE, target, '\0', siteId});
    }

    std::string getDocument() const {
        std::lock_guard<std::mutex> lock(mtx);
        return tree.getText();
    }
    
    int getId() const { return siteId; }

private:
    void applyRemote(const Operation& op) {
        std::lock_guard<std::mutex> lock(mtx);
        if (op.type == OpType::INSERT) {
            tree.insert(op.pos, op.val);
        } else {
            tree.remove(op.pos);
        }
    }
};

#pragma once
#include <functional>
#include <vector>
#include <mutex>
#include "LSEQTree.hpp"

enum class OpType { INSERT, DELETE };

// Immutable event struct simulating network serialization payload
struct Operation {
    OpType type;
    Position pos;
    char val;
    int originSite;
};

// OOP Concept: Observer/Pub-Sub Pattern.
// Centralizes message distribution between concurrent client threads safely.
class MessageBus {
    using Callback = std::function<void(const Operation&)>;
    std::vector<Callback> subscribers;
    std::mutex mtx;

public:
    void subscribe(Callback cb) {
        std::lock_guard<std::mutex> lock(mtx);
        subscribers.push_back(cb);
    }

    void broadcast(const Operation& op) {
        std::lock_guard<std::mutex> lock(mtx);
        for (auto& cb : subscribers) {
            cb(op);
        }
    }
};

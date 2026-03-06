cmake_minimum_required(VERSION 3.10)
project(CRDT_Editor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Executable creation
add_executable(crdt_editor src/main.cpp)
target_include_directories(crdt_editor PRIVATE src)

# Ensure pthread support for the simulated network concurrency
find_package(Threads REQUIRED)
target_link_libraries(crdt_editor Threads::Threads)

# Multithreading vs Multiprocessing — Concurrency and Parallelism

## Context (Why This Matters)

Modern systems must handle many tasks at once — serving thousands of client requests, processing data pipelines, or running background jobs. The two fundamental approaches are **multithreading** (multiple threads within one process) and **multiprocessing** (multiple independent processes). Choosing the wrong one can mean wasted CPU cores, memory bloat, or race condition bugs. The decision hinges on one question: **is the workload I/O-bound or CPU-bound?**

## Key Definitions

| Term | Definition |
|------|-----------|
| **Thread** | A lightweight unit of execution within a process. Threads share the same memory space. |
| **Process** | An independent instance of a program with its own memory space. Processes are isolated from each other. |
| **Concurrency** | Managing multiple tasks that make progress over the same time period (may not execute simultaneously — e.g., interleaving on one core) |
| **Parallelism** | Executing multiple tasks at the exact same instant (requires multiple CPU cores) |
| **I/O-bound** | Task spends most of its time waiting for external resources (network, disk, database, user input) |
| **CPU-bound** | Task spends most of its time doing computation (data processing, image rendering, ML training) |

## Multithreading

Multiple threads run within a **single process**, sharing the same memory space.

```
Process
├── Thread 1 (handling client A — waiting on DB query)
├── Thread 2 (handling client B — serving response)
├── Thread 3 (handling client C — reading file)
└── Shared Memory (all threads can read/write)
```

| Pros | Cons |
|------|------|
| **Efficient resource sharing** — threads share memory, making data exchange trivial | **Synchronization complexity** — shared memory requires locks, mutexes, or other coordination to avoid race conditions |
| **Low memory overhead** — no separate memory space per thread | **GIL limitation** (Python) — the Global Interpreter Lock prevents true parallel execution of Python bytecode across threads |
| **Fast context switching** — switching between threads is cheaper than between processes | **Deadlock risk** — threads can wait on each other indefinitely if synchronization is mismanaged |

### When to Use Multithreading

**I/O-bound workloads** — tasks that spend most of their time waiting:
- Web servers handling many client connections (while one thread waits on a DB query, another serves a different client)
- File I/O operations
- API calls to external services
- Network socket management

## Multiprocessing

Multiple **independent processes** run simultaneously, each with its own memory space and (in Python) its own interpreter.

```
Process 1 (own memory) ─── CPU Core 1
Process 2 (own memory) ─── CPU Core 2
Process 3 (own memory) ─── CPU Core 3
Process 4 (own memory) ─── CPU Core 4
```

| Pros | Cons |
|------|------|
| **True parallelism** — each process runs on a separate CPU core simultaneously | **Higher memory overhead** — each process consumes its own memory and resources |
| **Fault isolation** — if one process crashes, others are unaffected | **Complex communication** — Inter-Process Communication (IPC) is slower and more complex than shared memory |
| **Bypasses the GIL** (Python) — each process has its own interpreter, enabling real parallel execution | **Expensive context switching** — switching between processes costs more than switching between threads |

### When to Use Multiprocessing

**CPU-bound workloads** — tasks that need raw computation:
- Data analysis and processing large datasets
- Image/video rendering and transformation
- Machine learning model training
- Scientific computation
- Cryptographic operations

## Decision Framework

```
Is the task I/O-bound or CPU-bound?

I/O-bound (waiting on network, disk, DB)
    → Use multithreading
    → Threads efficiently share the wait time
    → Example: web server, API gateway, file processor

CPU-bound (heavy computation)
    → Use multiprocessing
    → Processes run on separate cores for true parallelism
    → Example: data pipeline, image processor, ML training
```

## Comparison Table

| Dimension | Multithreading | Multiprocessing |
|-----------|---------------|-----------------|
| **Memory** | Shared (lightweight) | Isolated (heavier) |
| **Parallelism** | Concurrent but not truly parallel (limited by GIL in Python) | True parallelism across CPU cores |
| **Communication** | Fast — shared memory | Slow — requires IPC (pipes, queues, sockets) |
| **Fault isolation** | None — one thread crashing can kill the process | Full — processes are independent |
| **Context switch cost** | Low | High |
| **Best for** | I/O-bound tasks | CPU-bound tasks |
| **Risk** | Race conditions, deadlocks | Memory overhead, IPC complexity |

## Worked Examples

### Example 1: Web Server (Multithreading)

A web server handles thousands of client connections. Each request involves waiting — for a database query, a file read, or an external API call. While Thread 1 waits on the database, Thread 2 serves another client's response. Threads share the same memory (e.g., cached config data, connection pools), keeping overhead low.

### Example 2: Data Processing Pipeline (Multiprocessing)

A data analysis application needs to process a 100GB dataset. Split the data into chunks and assign each chunk to a separate process. Each process runs on its own CPU core, performing computation in true parallel. A 4-core machine processes 4 chunks simultaneously, reducing total time by ~4x.

## Connection to System Design

| System Component | Typical Model | Why |
|-----------------|--------------|-----|
| **Web/API server** | Multithreading (or async event loop) | I/O-bound — waiting on DB, network, disk |
| **Message queue consumer (image processing)** | Multiprocessing | CPU-bound — resizing, encoding, ML inference |
| **Database connection pool** | Multithreading | I/O-bound — waiting on query results |
| **Real-time chat server** | Async event loop (e.g., Node.js) or multithreading | I/O-bound — managing many open connections |
| **Batch data pipeline** | Multiprocessing | CPU-bound — transforming large datasets |

## The GIL (Python-Specific but Commonly Asked)

Python's **Global Interpreter Lock (GIL)** allows only one thread to execute Python bytecode at a time, even on multi-core machines. This means:
- Multithreading in Python does **not** give true parallelism for CPU-bound tasks
- It **does** work well for I/O-bound tasks (threads release the GIL while waiting)
- For CPU-bound work in Python, use **multiprocessing** to bypass the GIL (each process has its own interpreter)

Other languages (Java, Go, C++) do not have this limitation — their threads can execute in true parallel.

## Validation Checklist

- [ ] I can define threads vs processes and explain how they differ in memory and isolation.
- [ ] I can distinguish concurrency (interleaving) from parallelism (simultaneous execution).
- [ ] I can distinguish I/O-bound from CPU-bound workloads and know which model fits each.
- [ ] I can list the pros and cons of multithreading (shared memory, low overhead, but race conditions and GIL).
- [ ] I can list the pros and cons of multiprocessing (true parallelism, fault isolation, but memory overhead and IPC complexity).
- [ ] I can explain the GIL and why it matters for Python but not Java/Go/C++.
- [ ] I can map common system components (web server, queue consumer, data pipeline) to the right concurrency model.

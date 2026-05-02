---
title: "From the Types of Hash Tables: Swiss Table"
summary: "Every few months when we sit down with friends to chat and talk about everything under the sun, it's a good opportunity for me to hear things that spark new curiosity in me. In one of these gatherings, the Swiss Table came up. A Hash Table that was created to be faster than the hash tables we know. I wrote more about it here and tried to explain it a bit, talk about its applications, and also explain similar cases."
date: "2025-10-08"
categories: ["Software engineering"]
keywords: ["swiss table", "hashmap", "hash table", "open addressing", "collision resolution", "data structures", "rust hashmap", "simd optimization", "cpu performance", "chaining hash table"]
---


We studied the conventional collision resolution methods in hashmaps in our data structures class:

1- open addressing
2- chaining
3- hybrid

If I were to briefly review each one, it would go like this:

In open addressing, we act like this: when a collision occurs, we move forward in the wrapped array until we reach the first empty slot and place the item there.

In the chaining method, each slot of our array holds one element and is a pointer to another data structure, which can be a linked list or a balanced tree like red-black or AVL. If there is already data in that array slot, we push the new item into the data structure that the slot points to.

In the third method, we combine one of the first or second methods with a multiple hashing mechanism. This means we consider several different hash algorithms. If a collision occurs with the hash of our intended item, we select a new hash algorithm. The mechanism for choosing the hash algorithm can be anything. We'll consider a simple round-robin. We continue this process until we have tested all our hash algorithms and they all have led to collisions. Then, we proceed to store the item using either method 1 or 2.

All these stories are things we know so far and are conventional. But how much are these methods really used? Is it possible to go further and make the performance even better than this?

In places like Cloudflare, where microsecond-level performance matters, sometimes you have to go a step further. Sometimes the simplest details can create a multifold difference in speed. It's as if a kind of amplification occurs; a small optimization that makes the whole system seem much faster.

One of the ideas designed with exactly this mindset is the Swiss Table structure. Google designed this structure considering the challenges of cache servers. Languages like Rust also use this very structure for their default HashMap implementation.
Google also had a presentation about the design and optimization of this structure at the CppCon 2017 conference, which is worth watching:

[CppCon 2017: Matt Kulukundis – Designing a Fast, Efficient Hash Table](https://www.youtube.com/watch?v=ncHmEUmJZf4)

The Swiss Table essentially still uses the idea of open addressing; meaning data is stored directly in an array, and when a collision occurs, we look for the next slot to find a place to insert. But its main difference lies in how this array is bucketed and how the CPU uses it.

In the Swiss Table, the main array is divided into several buckets. Each bucket usually has several slots (e.g., 8), meaning each bucket itself can hold up to 8 elements.
Alongside it, we have a smaller metadata array that stores just one byte of information for each slot. In this byte, a piece of the key's hash (e.g., 7 bits of it) is kept so the CPU can quickly figure out which slot likely belongs to the desired key.

When we want to search for a key or insert a new key, the Swiss Table uses SIMD (Single Instruction, Multiple Data) to read several metadata bytes together (e.g., 16 at a time) and, in the span of a single CPU instruction, checks whether the small hash stored in them matches the hash of our key or not.
Then, if one of them matches, it only then goes to the actual data and performs a more precise check.

The Swiss Table is not the only example of such a design. After Google, other major projects like [Facebook’s F14](https://engineering.fb.com/2019/04/25/developer-tools/f14/) used similar ideas.
Languages like Rust and Go also built their own versions inspired by this very design.

In the Go implementation, the development team faced a serious challenge that is explained in detail in this post:

[The Go Blog – Swiss Table](https://go.dev/blog/swisstable)

The problem started here: when the main array of the hashmap reaches its capacity threshold, its size must be doubled and all the previous data copied into the new array.

This process doesn't cause much of an issue in normal systems, but in cache servers that have several terabytes of data in memory, this resize can be extremely time-consuming and slow.
The solution Golang provided for this issue was the use of multi-level hashmaps. Instead of a full resize, new data is stored in a higher level, and the old data is migrated gradually. This way, the resize operation is divided into small parts, and sudden pressure is lifted off the system.

Don't miss this post either:

[A new fast hash table in response to Google’s new fast hash table](https://probablydance.com/2018/05/28/a-new-fast-hash-table-in-response-to-googles-new-fast-hash-table/)
---
title: "Counting by Sniffing - The HyperLogLog Data Structure"
summary: "There was a need to count the number of contacts sending messages to a specific account within a 24-hour period."
date: "2025-12-27"
categories: ["Software engineering"]
keywords: ["HyperLogLog", "HyperLogLog data structure", "cardinality estimation", "unique counting", "probabilistic algorithms", "memory optimization", "approximate counting", "Redis hll", "big data management", "what is hll"]
---



There was a need to count the number of contacts sending messages to a specific account within a 24-hour period.

The first and most obvious solution was to actually store the message senders in a set. That is, within a 24-hour period, we would examine every message that came after an event initiating that 24 hours, one by one for each account. It wasn't complicated, but it didn't seem very appealing, especially since we didn't need an exact count, and this meant a lot of wasted memory.

To solve this problem in an optimized space, we very quickly arrived at an initial guess: Bloom filter.

The application of a Bloom filter is that it can tell whether an element is a member of a set or not without storing all the data and in constant time complexity, but with one problem: there is a probability that it says an element is a member of that set when it actually isn't.
But on the other hand: when it says an element is not a member of the set, it is definitive and always correct.

[The Bloom filter is very interesting](https://t.me/apessimisticresearcher/4228), but it wasn't our solution. We needed counting, but a Bloom filter is a filter(!), not a counter. It's like a hash table that, without storing all the data, [can tell you your key is probably there or definitively not](https://t.me/apessimisticresearcher/4230). So we had to use a counter alongside the Bloom filter that would increment by one whenever it wasn't there. Practically, the implementation complexity would increase unnecessarily, and for this reason, we had to go for another method.

I was lost in these thoughts and preparing questions for an interview when I suddenly remembered that I had previously come across a data structure in the Redis documentation that seemed very interesting to me at the time: HyperLogLog. After re-evaluating, it seemed this was our answer!

HyperLogLog or HLL is a probabilistic data structure with constant space complexity that can calculate the number of unique elements in a set (which is called Cardinality) without actually counting the number of repetitions or storing the data, with an error rate of under one percent (about 0.8%). (For $2^{14}$ registers. In general, the error rate for $m$ registers is equal to $\frac{1.04}{\sqrt{m}}$).

The way it works is that instead of directly storing or counting the elements, it first converts each input into a fixed-length binary value using a uniform hash function. Then, it uses the first few bits of this hash to determine the register (bucket) the data belongs to, and on the remaining bits, the number of consecutive leading zeros of the string is counted.

Since the appearance of a large number of consecutive zeros at the beginning of a binary number when using such a hash function is a low-probability event, this value can statistically represent the size of the set of unique elements.
What does this mean?

The probability that a binary number:

- Starts with 1 zero:
P(0) = 1/2
- Starts with 2 consecutive zeros (00):
P(00) = 1/4
- Starts with 3 consecutive zeros (000):
P(000) = 1/8
- Starts with $k$ consecutive zeros:
$P(00\dots0) = 1/2^k$

Meaning, for every additional zero, the probability is halved.

As a result, seeing a number that starts with, for example, 10 zeros has a probability equal to 1 in 1024. An event that only occurs when the volume of data is large.

Ultimately, to calculate the number of occurrences, it performs the statistical calculation process not on the entire data, but on a set of registers. In this way, for each register, only the maximum number of consecutive zeros seen up to that point is stored, and by statistically combining the values of all registers, an estimate of the number of unique elements is obtained.

[The discussion on HLL is extensive](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/40671.pdf). How much the cardinality error rate depends on the number of registers and how this is calculated. Or what its error correction methods are to minimize the influence of the number of inputs. Or basically how its statistical calculation works. Despite all this, I think it was enough to talk about it to this extent. At least for me, in addition to solving a real problem that itself completed a larger puzzle in our system, the nature of such data structures with probabilistic algorithms is very exciting.

In this regard, and so that this narrative doesn't remain incomplete for enthusiasts, definitely do not miss this blog post by Mr. Salvatore Sanfilippo, who is a passionate Italian and, of course, one of the core developers of Redis. The blog is about HLL and its implementation in Redis:

[Redis new data structure: the HyperLogLog](https://antirez.com/news/75) 

`HyperLogLog is remarkable as it provides a very good approximation of the cardinality of a set even using a very small amount of memory. In the Redis implementation it only uses 12kbytes per key to count with a standard error of 0.81%, and there is no limit to the number of items you can count, unless you approach 2^64 items (which seems quite unlikely).`
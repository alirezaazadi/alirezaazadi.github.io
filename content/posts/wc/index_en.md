---
title: "The Multi-Leader Replication Mechanism and the Woes of Write Conflicts"
summary: "I was reviewing the book Designing Data Intensive Applications yesterday and reached the topic of Multi-Leader Replication and the discussion on Conflict Resolution. The book briefly mentioned automatic conflict resolution methods, and among them, it made a very short reference to CRDTs. For me, having recently used this method in a project to implement a Collaborative Editor, encountering it again was interesting and motivated me to read a bit more about it, and the result is this post."
date: "2025-08-22"
categories: ["Software engineering"]
keywords: ["multi-leader replication mechanism", "write conflict", "data inconsistency", "database replication", "distributed database", "last write wins", "database high availability", "database scalability", "conflict resolution", "master-master database"]
---


I don't know how much you know about the Multi-Leader Replication mechanism in databases. Briefly, instead of having one master node (Leader, Main, or whatever) that solely serves write requests, we have several nodes doing this for us. In fact, Writes that come to any of the nodes are Propagated to the rest of the nodes.

This has a number of advantages, the first being High Availability. This way, if one of the master nodes Fails and cannot handle our request for any reason, there are other nodes to do it.

The next advantage is Scalability and the possibility of Load Balancing. Imagine the number of writes on the master node is so high that the I/O cannot respond to all requests. In this mechanism, we can distribute the load across other master nodes that naturally exist on different servers and data centers, bringing down the Response Time. Whenever we feel this number of nodes is not enough, we can add new master nodes to the system.

With all these tempting features, however, any sensible person will warn you as much as possible against moving in this direction. The reason? High complexity and a high risk of Write Conflicts, leading to Data Inconsistency.

Why does this happen? Imagine you've built a Collaborative Editor just like Google Docs. A place where different people can edit a document simultaneously. One of the likely scenarios that surely comes to many minds is this:

The first line of the document says:

`Edited by Alireza`

Ali and Reza both have access to the document at the same time and are writing on this line. Ali, wanting to register this part under his own name, changes it like this:

`Edited by Ali`

Right when Ali makes this decision, Reza also goes ahead and changes it like this:

`Edited by Reza`

And both of these changes are sent to each of them, and what happens is:

Ali's change request was supposed to change the phrase Alireza to Ali. When it reaches Reza's side, the program sees that there is no Alireza to change, and only Reza exists.
On the other hand, when Reza's change request reaches Ali's client, there is no sign of Alireza to change to Reza because it says Ali there.

This is exactly the Write Conflict we were talking about. This exact same problem exists on the database side as well. Client 1 sends a write request to Node A. At the same time, Client 2 sends a write request to Node B, and each of these nodes Propagates these writes, and again, Write Conflict.

What can be done to resolve this problem? The first and best method: prevention! You should avoid this scenario as much as possible. Resolving conflicts is complex and puts you in a new Trade-off.
But what solutions actually exist for this? How can we at least ultimately reach Convergence?

One method that probably crossed your mind is to always consider the newest (the last Write that occurred). This is one of the common methods that happens to be implemented in serious systems like [Cassandra](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html) (and it is the only method used). This algorithm is called Last Write Wins or LWW for short. For its implementation, a Timestamp is sent along with the Write request. This way, each node can compare the Timestamps and replace the previous value with the last write. The problem with this method, however, is sacrificing Durability.
Imagine write requests are sent simultaneously from several different clients, and all clients think their request was successful. Meanwhile, only the one created later than the rest was accepted, and the others were ignored. In systems where no data loss is acceptable, using LWW doesn't seem very appropriate.

Other methods have also been implemented for this issue that can be discussed. But I mentioned all this to arrive at these three.

There are three methods for automatically resolving these conflicts. I'll try to explain each as far as I've understood.

1- Operational Transformation (OT)

The example I gave about collaborative document editing is exactly the use case for this algorithm. Google used this very algorithm to resolve conflicts in its live editor (although it's said they no longer use this and have moved to CRDT. But I don't know anything about that.)

Briefly, the algorithm works like this: when two or more simultaneous changes are received, one of them is applied to the document, and the remaining changes are transformed so that they work on the document after the first change has been applied. For example:

User A adds the letter "X" at the third index.
At the same time, User B adds the letter "Y" at index number 1.
Without OT, obviously, if B's change is applied first, index 3 is no longer what User A wanted to change, causing an incorrect modification.
With OT, when B's change is applied first, A's change is transformed (because position 3 has now become 4), so A's change is corrected, and everyone sees the same result.

For further reading: [Link 1](https://dl.acm.org/doi/pdf/10.1145/289444.289469) and [Link 2](https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447)

2- Conflict-free Replicated Datatypes (CRDTs)

A few months ago, when we were supposed to write a live editor in a project, this was the first result I found on Google. You are probably more familiar with this. Well-known libraries like Ypy and Yjs have also been implemented for this very purpose, allowing us to simultaneously change a series of data structures without conflict.

Suppose two processes (multiprocessing is very similar to distributed systems. That's why I'm giving such an example. But you can imagine two completely independent clients and a database) want to change the value of a counter in a shared memory, which equals 0. One wants to add +2 to it and another +3.

What we all expect here is an indeterminate state to occur. One time counter=2, another time counter=3. But the idea behind CRDT is to combine these. Meaning, independent of the order of each, we ultimately arrive at counter=5:

`counter = 0 + 2 + 3 = 5`

Or in the collaborative editor example. Imagine that same scenario again:

The beginning of the document says:
`Edited by Ali`
Reza wants to put an 'aqa' before Ali.
Ali also wants to put a 'khan' after Ali.

What happens in CRDT is that each character has a unique ID, and in our case, when it receives Reza's change, it says put an 'aqa' before the ID related to the letter A at index 10. When it receives Ali's request, it says put a 'khan' after the ID related to the character i at index 12. This way, the output will be:

`Edited by aqa Ali khan`

Without any conflict existing.
The point about CRDT and OT is that the CRDT algorithm, unlike OT, does not require co-ordination and can be decentralized.

For further reading: [Link 1](https://arxiv.org/pdf/1608.03960), **Martin Kleppmann's** [Video](https://www.youtube.com/watch?v=x7drE24geUw) (author of the book Designing Data Intensive Applications), Link 3 ([https://crdt.tech/](https://crdt.tech/))

3- Mergable Persistent Data Structures (MPDS)

Data structures where, if you make a change in them, those changes are not lost. Just like we have in git where branches can be merged together. However, not a normal merge or a two-way merge (which was used in CRDT), but a three-way merge. Let me explain better with an example:

Suppose we have a list:

`Persistent List: [1, 2, 3]`

Simultaneously, one thread adds the value 4 to this list:

`Persistent List: [1, 2, 3, 4]`

And exactly at the same time, another thread adds the value 5:

`Persistent List: [1, 2, 3, 5]`

Both of these versions are saved in our Persistent list. Now, whenever we want to merge these changes, depending on our merge policy, we can combine these two changes together. Just like how we merge two branches together in git. But what is the story of the three-way merge? What is its difference from a two-way merge? Consider this example:

Our Base version is this:

`Hello world`

The version User A modifies is this:

`Hello A world`

The version User B modifies is this:

`Hello world B!`

Now for merging, we have three parties involved in the decision-making:

`Base=Hello world
A=Hello A world
B=Hello world B!`

Now, by considering the Base, we can figure out what changes A and B each made and automatically combine or merge the independent or non-conflicting changes.

In fact, unlike a two-way merge where we only examined the changes together (a two-way merge is essentially just a diff), in this method, in addition to the pairwise comparison, it's possible to compare each one's changes with the original version as well. To better understand the matter, read [this StackOverflow question](https://stackoverflow.com/questions/4129049/why-is-a-3-way-merge-advantageous-over-a-2-way-merge) and its answers. [This video](https://www.youtube.com/watch?v=Xo54nlPHSpg) also seemed interesting.

For further reading on MPDS: [Link 1](https://gazagnaire.org/pub/FGM15.pdf), link to the Persistent Data Structures session from the MIT Advanced Data Structures [Course](https://www.youtube.com/watch?v=T0yzrZL1py0)
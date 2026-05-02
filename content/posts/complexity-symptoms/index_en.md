---
title: "Complexity and Its Symptoms"
summary: "The book A Philosophy of Software Design by John Ousterhout presents three manifestations of complexity in a system, and here I want us to review these three items together:"
date: "2024-12-27"
categories: ["Software engineering"]
keywords: ["software complexity", "symptoms of complexity", "cognitive load", "amplified changes", "unknown unknowns", "software design", "software design principles", "reducing code complexity", "a philosophy of software design", "system complexity"]
---


**The book A Philosophy of Software Design by John Ousterhout presents three manifestations of complexity in a system, and here I want us to review these three together**

## Change Amplification

A simple change [in an overall function] requires changes in various parts. The most accessible example possible that probably immediately came to your mind is the use of a constant (like a color code) that is being used in all functions and has a name everywhere, and we are supposed to change it. Now our single simple change got amplified and went from one to 100 (similar to write amplification in databases where sometimes a simple write leads to IO hitting the ceiling).

## Cognitive Load

How much a developer needs to know [about the system] to bring a task to completion. The more this "knowing" is required, naturally they need to spend more time learning to perform the said task, and this multiplicity of need-to-knows increases the risk of bugs occurring more and more.

In this regard, one can also make a digression to the issue of the number of lines. Some system designers think that fewer lines lead to a reduction in system complexity.

It might be that reading a long and wide class is very terrifying, but from experience, nothing is more terrifying than reading short codes entirely filled with tricks and magic about which, without prior knowledge, we will have no idea how these few lines work.

Reducing the number of lines with the illusion of reducing complexity can ultimately lead to an increase in cognitive load and throw us from that sweet dream into the middle of the nightmare of a complex codebase.

## Unknown unknowns

The worst among these three, however, is unknown unknowns. Meaning that we do not know which part of the code needs to be changed for our task to be completed.

“unknown unknown means that there is something you need to know, but there is no way for you to find out what it is, or even whether there is an issue.”

In this state, it will not be clear to us what we must do, or whether what we intend to do is effective at all or not.

Ultimately, a system that has a clear implementation and design creates the possibility for the developer to easily understand how the current code works and be able to quickly guess how they should apply their desired changes and have peace of mind that the guess they made is correct and the new changes are not going to create new problems where they couldn't even imagine.

P.S.:

Besides the definition of a complex system which we discussed above in the form of defining its manifestations and was specific to software systems, it is not bad to make a digression to the book by Melanie Mitchell

titled "Complexity: A Guided Tour" which is also a readable book and we recommend it. At the end of the first chapter of the book, it defines a complex system in two ways:

"A system in which a large network of components with no central control and simple rules of operation give rise to complex collective behavior, sophisticated information processing, and adaptation via learning or evolution."

And the second definition:

"A system that exhibits nontrivial emergent and self-organizing behaviors."

Which I think the second definition is more aligned with the description of manifestations we saw from a software system.

This writing was first published in the [Agora channel](https://t.me/dr_biglari_ds/3001).
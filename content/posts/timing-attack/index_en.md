---
title: "Timing Attack"
summary: "A few days ago I was reviewing my own code and, thanks to a warning from Cursor, I stumbled upon a Timing Attack vulnerability. It became the starting point for a deeper dive into the topic."
date: "2026-05-23"
categories: ["Programming"]
keywords: ["timing attack", "string comparison java", "string interning", "java string equals", "java string ==", "string literal", "string object", "java security", "timing vulnerability"]
image: "/media/posts/timing-attack/img_1779559939909_uleti.png"
---

Before getting into the main topic, I need to give some background — something I wrote a while back in the Agora channel [here](https://t.me/dr_biglari_ds/2764). I'll include it here as well, and then talk about the attack itself.

### String Equality in Java

Consider this example of checking equality between two strings in Java:

```java
"foo".equals("foo")
```

We know these two strings are equal. But how does Java know that?

First, two small pieces of background. One: strings in Java are non-primitive types and are treated as objects. Two: there are two ways to create a string in Java, and Java treats each differently.

**1 — String Object**

When you create a string using `new`, you're creating a new object on the heap from the `String` class:

```java
String moz = new String("moz");
```

No matter how many times you do this, each call produces a brand-new object — it looks the same, but it's a different object in memory every time.

**2 — String Literal**

This is where String Interning comes into play. Here you don't use `new` at all — you just write the string directly:

```java
String khiar = "khiar"
```

The Java documentation defines it as:

> "A string literal consists of zero or more characters enclosed in double quotes. A string literal is a reference to an instance of class String."

I recommend reading [this link to the Java spec](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.5) if you want more detail — I find it genuinely interesting.

The difference between the two approaches is that the first always gives you a new object, while the second reuses the same object after the first time. For example, if you create another string literal `khiar`, you'll get the exact same object back — Java doesn't create a new one. How? String Interning.

When a String Literal is created for the first time, Java creates an object for it (just like the first approach), but then stores it in a place called the **String Intern Pool** instead of leaving it floating around. All string literals are automatically interned (and yes, you can do it manually too — that's what the `intern()` method on the `String` class is for).

---

Now back to our original question: how is equality checked for two strings? There are two ways:

**1 — Using the `==` operator**

When comparing two strings this way, the content of the strings is *not* compared. What gets compared are their memory addresses. So if you create two strings with the same content using `new`, you get two separate objects with different addresses — and `==` will say they're different:

```java
String one = "Moz";
String two = new String("Moz");

one == two; // FALSE
```

**2 — Using the `equals` method**

Let's look at [the implementation in Java](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/19fb8f93c59dfd791f62d41f332db9e306bc1422/src/java.base/share/classes/java/lang/String.java#L1002):

```java
public boolean equals(Object anObject) {
    if (this == anObject) {
        return true;
    }
    if (anObject instanceof String) {
        String aString = (String)anObject;
        if (coder() == aString.coder()) {
            return isLatin1() ? StringLatin1.equals(value, aString.value)
                              : StringUTF16.equals(value, aString.value);
        }
    }
    return false;
}
```

The very first thing it does is use `==`. If both references point to the same object, it returns `true` immediately without checking the content at all.

If the addresses are different, it falls through to `StringLatin1.equals` or `StringUTF16.equals`:

```java
public static boolean equals(byte[] value, byte[] other) {
    if (value.length == other.length) {
        for (int i = 0; i < value.length; i++) {
            if (value[i] != other[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}
```

The first step is checking the lengths. Only if the lengths match does it proceed to a character-by-character comparison — and even then it doesn't need to see all characters. As soon as it finds a mismatch, it exits the loop and returns `false`.

---

So now that we know exactly how Java compares two strings, we can answer our original question: how is equality checked in this snippet?

```java
"foo".equals("foo")
```

Both are string literals. When the first `foo` is created, it gets interned. When the second `foo` appears, Java doesn't create a new object — it returns the same interned one. Since both references point to the same object, the `==` check at the top of `equals` immediately returns `true`, without any character-by-character comparison.

---

Now that we've answered that question, let me say a bit more about the String Pool itself.

As I mentioned, the String Pool lives in Heap Memory — but this wasn't always the case. Up until Java 1.6, the String Pool was in a special heap area called **Permanent Generation (PermGen)**, which was separate from the main heap. PermGen had a fixed, non-resizable size, so running out of memory (`OutOfMemoryError`) from heavy use of the `intern()` method was not at all unusual.

```
JVM Memory Structure (before Java 7)
 ____________________________________________
|                                            |
| PermGen Space                              |
|____________________________________________|
|                                            |
| Heap Space                                 |
|____________________________________________|
|                      |                     |
| Eden Space           | Survivor Space      |
| (Young Generation)   | (Young Generation)  |
|____________________  |_____________________|
|                                            |
| Old Generation                             |
|____________________________________________|
```

Starting from Java 7, the pool was moved from PermGen into the main heap. This gave it more available memory and made it easy to resize as needed.

The internal implementation of the String Pool is beyond my current depth — but from what I understand, it's not a Java-level class. It's implemented inside the JVM itself, typically in C++. It uses a structure called `StringTable`, which is a kind of HashTable, for caching strings.

---

### Timing Attack

As we discussed, when Java's standard string equality check runs: it first compares lengths — if they differ, the strings are not equal. If they match, it compares character by character and stops at the first mismatch, returning `false`.

This optimization carries a risk: **Timing Attack**.

Imagine you want to compare these two strings using the algorithm above:

```
a = "123abc"
b = "123bbc"
```

At index 3, the comparison stops because `a` and `b` differ. If we assume each comparison operation takes 1 microsecond, then 4 microseconds tells us these strings are not equal.

Now imagine you have a **black box**. This box takes one input: a string. You know exactly what it does inside: it compares your input against a secret string stored inside, and returns only the time it took to do so.

Your goal is to guess what the hidden string is. Luckily, you already know it's 6 characters long (not strictly necessary — I'm simplifying). You probably sense that you need to exploit that timing information somehow.

So you start generating 6-character strings. Suppose the hidden secret is `123abc`:

```
111111
```
→ 2 microseconds: the first `1` matched `1`. The second `1` didn't match `2`. Two comparisons, done. We've learned the first character is `1`. Now change the second character.

```
121111
```
→ 3 microseconds: `1` matched `1`, `2` matched `2`, `1` didn't match `3`. Three comparisons, done. We've learned the second character is `2`. Now change the third. We'll try `3` (in reality this is brute force — I'm picking the right character to keep it simple).

```
123111
```
→ 4 microseconds: `1`→`1`, `2`→`2`, `3`→`3` all matched. `1` didn't match the fourth character. Four comparisons, done. Now change the fourth character — let's try `a`.

```
123a11
```

Continuing this way, character by character:

```
123abc
```

Now no matter how many times we send this input to the box, the time stays constant. And if we send a string longer than 6 characters, it returns much faster (length mismatch exits immediately).

With this method, without any direct access to the inside of the box, we were able to reconstruct the hidden string character by character. This is called a **Timing Attack**. And as you've probably guessed, it can be used to crack secret keys whenever a naive equality check is used for comparison. Here are real-world examples:

---

**1 — [OpenSSL & RSA Private Key — Brumley & Boneh (2003)](https://crypto.stanford.edu/~dabo/papers/ssl-timing.pdf)**

Brumley and Boneh devised a timing attack against OpenSSL and successfully extracted a factor of the RSA modulus (and therefore the private key) over a local network. Before this attack, it was generally believed that timing attacks would not work against general-purpose servers because timing variations would mask the decryption times.

They reported using about a million queries to remotely extract a 1024-bit key from an OpenSSL 0.9.7 server in about two hours. The fix was enabling RSA blinding by default in OpenSSL.

**2 — [Django — User Enumeration via Timing (2013)](https://code.djangoproject.com/ticket/20760)**

A test setup showed that for a correct username, the login response was 2–10 times slower than for an incorrect one, even when only running 5 queries per candidate. The difference was described as immediately obvious and easy to detect through any modern network with even a basic script.

---

And there are many more examples. You might wonder: "When the request comes over the internet, doesn't network latency ruin the signal?"

The answer is: not necessarily. As shown in the examples above, with statistical techniques applied over thousands of requests, the timing signal can be extracted even through network latency. On internal networks — like microservices communicating within a VPC — the attack is much easier because latency is extremely low.

---

### How to Prevent It

In various languages, there are functions for constant-time string comparison — where the time taken is independent of how many characters matched. These must be used whenever comparing secrets:

```
Java:   MessageDigest.isEqual()
Go:     subtle.ConstantTimeCompare()
Python: hmac.compare_digest()
```

Below is the scenario I implemented in Go:

```go
// strAttack.go
package timeAttack

import (
    "fmt"
    "math/rand"
    "sort"
    "time"
)

const SECRET = "s3cr3t_k3y"

// Use a sink variable — prevents compiler from optimizing away the work loop
var sink int

func vulnerableCheck(input string) bool {
    if len(input) != len(SECRET) {
       return false
    }
    for i := 0; i < len(SECRET); i++ {
       if input[i] != SECRET[i] {
          return false
       }
       // sink prevents dead-code elimination by the compiler
       for j := 0; j < 1000; j++ {
          sink += j
       }
    }
    return true
}

func measureTime(input string, trialsCount int) time.Duration {
    samples := make([]int64, trialsCount)
    for i := 0; i < trialsCount; i++ {
       start := time.Now()
       vulnerableCheck(input)
       samples[i] = time.Since(start).Nanoseconds()
    }
    sort.Slice(samples, func(i, j int) bool { return samples[i] < samples[j] })
    // lower quartile — stable against GC/scheduler spikes
    return time.Duration(samples[trialsCount/4])
}

func Attack(guessedLength int) string {
    const trials = 3_000
    charset := "abcdefghijklmnopqrstuvwxyz0123456789_!ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    recovered := make([]byte, guessedLength)

    for i := range recovered {
       recovered[i] = 'a'
    }

    for index := 0; index < guessedLength; index++ {
       fmt.Printf("Cracking position %d... ", index)

       bestChar := charset[0]
       bestTime := time.Duration(0)
       first := true

       // Shuffle charset order to avoid positional bias
       order := rand.Perm(len(charset))

       for _, ci := range order {
          recovered[index] = charset[ci]
          elapsed := measureTime(string(recovered), trials)

          if first || elapsed > bestTime {
             bestTime = elapsed
             bestChar = charset[ci]
             first = false
          }
       }

       recovered[index] = bestChar
       fmt.Printf("found '%c' (signal: %v) → recovered so far: %s\n",
          bestChar, bestTime, string(recovered[:index+1]))
    }

    return string(recovered)
}
```

And:

```go
// main.go
package main

import (
    "fmt"
    "practice/timeAttack"
)

func main() {
    fmt.Println("=== Timing Attack Demo ===")

    for i := 1; i < 11; i++ {

       fmt.Printf("Secret length is known (or guessed): %d\n\n", i)

       result := timeAttack.Attack(i)

       fmt.Println()
       if result == timeAttack.SECRET {
          fmt.Printf(":) Secret recovered: \"%s\"\n", result)
          break
       } else {
          fmt.Printf(":( Got: \"%s\" (close but timing noise interfered)\n", result)
          fmt.Println("   Run again — noise can cause misses on a busy system.")
       }

    }

}
```

Sample output:

```
..........
Secret length is known (or guessed): 9

Cracking position 0... found '4' (signal: 0s) → recovered so far: 4
Cracking position 1... found 'o' (signal: 0s) → recovered so far: 4o
Cracking position 2... found 'P' (signal: 0s) → recovered so far: 4oP
Cracking position 3... found 'Q' (signal: 0s) → recovered so far: 4oPQ
Cracking position 4... found 'D' (signal: 0s) → recovered so far: 4oPQD
Cracking position 5... found 'x' (signal: 0s) → recovered so far: 4oPQDx
Cracking position 6... found 'f' (signal: 0s) → recovered so far: 4oPQDxf
Cracking position 7... found 'S' (signal: 0s) → recovered so far: 4oPQDxfS
Cracking position 8... found '8' (signal: 0s) → recovered so far: 4oPQDxfS8

:( Got: "4oPQDxfS8" (close but timing noise interfered)
   Run again — noise can cause misses on a busy system.
Secret length is known (or guessed): 10

Cracking position 0... found 's' (signal: 1.084µs) → recovered so far: s
Cracking position 1... found '3' (signal: 2.209µs) → recovered so far: s3
Cracking position 2... found 'c' (signal: 3.333µs) → recovered so far: s3c
Cracking position 3... found 'r' (signal: 4.458µs) → recovered so far: s3cr
Cracking position 4... found '3' (signal: 5.583µs) → recovered so far: s3cr3
Cracking position 5... found 't' (signal: 6.708µs) → recovered so far: s3cr3t
Cracking position 6... found '_' (signal: 7.834µs) → recovered so far: s3cr3t_
Cracking position 7... found 'k' (signal: 8.958µs) → recovered so far: s3cr3t_k
Cracking position 8... found '3' (signal: 10.042µs) → recovered so far: s3cr3t_k3
Cracking position 9... found 'y' (signal: 11.167µs) → recovered so far: s3cr3t_k3y

:) Secret recovered: "s3cr3t_k3y"
```
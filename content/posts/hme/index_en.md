---
title: "Operations on Encrypted Data: Homomorphic encryption"
summary: "You've probably thought about how great it would be if we could modify encrypted data without decrypting it. What seems more like a sweet dream is actually a reality that has not been a dream for decades, and I just found out about it. I wrote a bit here about this capability that I recently read about and learned. About its performance and the challenges of using it in the real world. I hope it's interesting for you too."
date: "2025-10-19"
categories: ["Software engineering"]
keywords: ["homomorphic encryption", "رمزنگاری هم‌ریختی", "fully homomorphic encryption", "data privacy", "encrypted data processing", "cloud computing security", "secure data operations", "fhe", "privacy-preserving computation", "machine learning homomorphic encryption"]
---

Suppose you want to google a phrase, but Google neither knows what you asked it nor what answer it gave you, yet the answer was perfectly tailored for you.

Or suppose you have a photo and you want to upload it to one of these photo editing websites and apply some effects to it, and these are applied correctly while the service has no idea what photo it applied its effects to.

Or let's get a bit deeper. Suppose you have a password manager that has stored your passwords encrypted. You want that when the app is loaded and it checks the complexity of your passwords, even a memory dump or a CPU register dump wouldn't leak any of your information and they would still remain encrypted, while your password manager's password complexity checking feature would have worked correctly.

We know that eventually, at some point, the data must be loaded into the RAM, or when the CPU wants to execute its instructions on the data, it must fetch the data itself (and not its encrypted form) onto its registers. So it's impossible for us to process data without decrypting it and providing the key, right? No!

It's very interesting that there is an encryption that allows processing data without decrypting it, or more accurately, passing it to a function where the output of that function is exactly identical to the output of the function on unencrypted data:

[Fully Homomorphic Encryption](https://bozmen.io/fhe)
Homomorphic encryption is a form of encryption that allows computations to be performed on encrypted data without first having to decrypt it.[1] The resulting computations are left in an encrypted form which, when decrypted, result in an output that is identical to that of the operations performed on the unencrypted data. Homomorphic encryption can be used for privacy-preserving outsourced storage and computation. This allows data to be encrypted and outsourced to commercial cloud environments for processing, all while encrypted.

Despite the fact that this method allows the cycle of privacy and confidentiality to be fully established and it is not a new encryption algorithm, its use has not become very widespread. One of its fundamental flaws is its high processing cost. With all this, it has made a lot of progress and every few years new generations of it are released that have resolved the problems of previous generations in some way, and on the other hand, the processing speed on encrypted data [increases by 8 times annually](https://www.youtube.com/watch?v=487AjvFW1lk&t=668s) and it's slowly finding its place in real-world systems. For example, Apple published a post in 2014 stating that it uses encrypted datasets in its Nearest Neighbor Search problems to preserve the privacy of its users:
[Combining Machine Learning and Homomorphic Encryption in the Apple Ecosystem](https://machinelearning.apple.com/research/homomorphic-encryption)

Read others' opinions about it in [this thread](https://news.ycombinator.com/item?id=44601023) on Hackernews.
If you are more interested in the implementation details and the math behind it, this [textbook](https://arxiv.org/abs/2503.05136) might be useful. (The same source but in [HTML](https://fhetextbook.github.io/) format)
There is also an open-source implementation of this algorithm that you can check out from [here](https://openfhe-development.readthedocs.io/en/latest/).
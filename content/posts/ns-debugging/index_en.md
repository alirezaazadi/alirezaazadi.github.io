---
title: "Cold Food: A Tale of a Few Days of Error-Prone Celery Debugging"
summary: "A few Celery tasks just wouldn't match up with SQS properly. A story that took a lot of time to resolve. Time that could have been much less than this. An experience that reminded me once again that debugging requires the implementation of a scientific method. It's playing the role of a scientist detective."
date: "2025-11-04"
categories: ["Software engineering"]
keywords: ["celery", "sqs", "celery sqs integration", "celery dlq", "failed celery tasks", "celery troubleshooting", "sqs visibility timeout", "acks_on_timeout_or_failure", "celery acknowledge", "celery retry"]
image: "./media/poster.webp"
---


Like food you crave but don't eat at that time, like a kebab that has gone cold, if you don't solve a problem right on time, solving it doesn't hit the spot anymore.

Today, after days of trial and error, tweaking parameters on both sides, examining the source and documents, and a lot of theorizing, we solved the integration problem between Celery and SQS. What was the goal? Very simple but fundamental: tasks that failed, after retrying the necessary number of times and failing, would go into the DLQ. An obvious task that wasn't being done, however.

First, we assumed that maybe because Celery was fundamentally designed for AMQP-based brokers, it doesn't match well with SQS. But no matter how much we searched, no one had this problem. On the other hand, it didn't seem very logical. SQS is a well-known and widely used tool, and so is Celery. It couldn't be like this. All of this meant only one thing to me: we are messing up.

I tried twice to spin up a small project to test SQS and Celery. First, we thought this setup was working correctly, so the problem was from our service. When, with a thousand tricks, I managed to make the message go into the DLQ after hitting an exception, I saw that messages that didn't fail were also being sent to the DLQ. It seemed Celery was always giving an ACK to SQS. So why are identical configs giving different results?!

After two days, I doubted our assumption. A doubt I didn't want to come true, which of course it did. This problem existed on both sides. Practically, we were left empty-handed. We were left naked with a pitcher around our neck in the middle of the city.

We started debugging Celery and reading its source. We searched, and breakpoints piled up on top of each other. Until, among these red dots, our eyes were graced by the unblessed sight of a single condition:

if task.acks_on_timeout_or_failure

And welcome to the party! Suddenly we remembered that, oh my dear, this was mentioned in the documentation!! And I had even seen it in the beginning. But we wandered so much off the path that it didn't catch my attention at all. That day when I was reviewing the doc, I didn't think we would hit so many dead ends and that this parameter was so relevant to our problem.

Finally, we passed an argument to the tasks and that was it. Everything worked correctly. Besides this, in the meantime, we realized that it is also important what the visibility timeout value is set to. Sometimes, for Celery to ACK a message due to a task being long-running or whatever, it took so long that if we set the visibility timeout low, another worker would pick it up again, and according to the number of retries defined on SQS, it would automatically go into the DLQ before its processing was complete because none of the workers acknowledged it.

Anyway, it got fixed, but I was so beaten up that it didn't hit the spot at all. After days of trying to bite our own tails, it didn't matter anymore if the solution was simple or complex. Its being correct wasn't interesting anymore. With all these stories, there are two turning points in this adventure: first, this very struggle shaped a lot of half-baked knowledge and we learned something new, and this made it look less like a costly and long waste of time, and also that at night I made pasta for some colleagues which they liked. Maybe because we were hungry, but it really hit the spot.

I was thinking why they call cooking an art? Cooking in the general sense and regarding the work we usually do is mostly precision and skill in following instructions and engineering. Once you garnish rice, tuna, and olives, whatever art it is, it's not the art of cooking (!).

P.S.: If there are errors in the sentences or it is vague, apologies. I was typing with half-open eyes.
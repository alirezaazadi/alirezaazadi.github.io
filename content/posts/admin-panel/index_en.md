---
title: "Admin Panel"
summary: "To be able to manage the blog's content more easily, write my posts more comfortably, and most importantly, give myself fewer excuses not to update this place more quickly, I decided to build an admin panel for the blog. A panel for content management."
date: "2026-03-17"
categories: ["Blog"]
keywords: ["blog admin panel", "ai development tools", "blog content management", "blog automation scripts", "github blog deployment", "local blog editor", "hassle-free blogging", "static site content management", "developer workflow automation", "blogging productivity"]
---

Hi.
As I'm writing this post it's 1:42 AM. Today I wasn't able to get much work done, and on days when I don't work properly during the day, I stay up until morning to somehow make up for the lack of productivity.

In the middle of all this, it occurred to me that I wished I could do something right now about the admin panel I wanted to build for the blog. I opened antigravity and got to work.
God bless these AIs. For projects like this they're like magic wands. The distance between idea and execution is measured in the number of lines in a prompt. I previously wrote a post about how I work with these AIs. A lot has changed since that post. Both I have changed — I've arrived at a better definition of my own place and AI's place in today's world — and the tools have become more precise and complete. A trend that's climbing upward at speed. When I get the chance I'll write an update to that post too. Enough of the intro.

I really needed to be able to write blog posts and manage all the blog's content without any hassle, without having to deal with the markdowns themselves or mess around with git. For someone moody like me, the smallest speed bumps can come down like a hammer on the crystal glass of willpower. I wanted to remove as many obstacles as possible.
I don't know if you know this or not, but all the blog posts and all other content are pushed to the [blog's GitHub repository](https://github.com/alirezaazadi/alirezaazadi.github.io/tree/main/content), and after each push, during a new deployment, the blog posts are updated. In addition to the posts, the left side of the blog — where interests are displayed — works the same way. I tried to automate a lot of things during the first implementation phase of the blog. For example, when a new title is added to the interests section, a script automatically tries to extract the cover of that item (song, film, book, etc.) from the URL provided. Or, since cleaning the metadata from photos is important and I might forget to do it beforehand, these are also cleaned up by another script. Honestly, I haven't reviewed these scripts very carefully :) and they probably have plenty of bugs in them, but they've worked well so far. The important point is that both of these scripts run as pre-commit phases before committing, so that before the commit and push, essentially no data has left my system and everything has to be done before the commit phase.

In short, I did a number of things to simplify the process, but it wasn't enough. I always thought about bringing in a separate content management system to manage the blog posts. Even though the entire blog (except the content itself) was built with AI and, of course, my prompts, there still wasn't enough motivation or energy — even with these tools available. Until, as I said, tonight's turn came around…

First of all, instead of a separate app, I built a local admin panel for the blog that allows all the blog's content to be changed. From changes to the "interests" section to posts and even contact information. As I said, this panel is only accessible locally and isn't a separate space from the blog. I can be inside my blog and write my posts. Just like this very post I'm currently working on.

Since my only job was finding the requirements and needs, with the manual work on AI's shoulders, I implemented everything I found interesting, and I'd like to list them here in headline form:

- A section for managing interest items: manual/automatic cover upload for each item. Delete/add/edit interest items.
- A section for managing contact information.
- Managing the content of the "Suggestions" and "About" pages.
- Delete/add/edit blog posts:
   - Uploading post covers through the panel.
   - Setting hidden tags on blog posts with the help of Gemini based on the post content to improve SEO.
   - Adding the ability to archive a post after publication on web.archive.
- Adding a Site Settings section for enabling or disabling the Contact and Fav sections.
- Adding a deploy button and displaying the deployment phases.

I also made a few other minor changes that don't relate to the admin panel section. Like adding the `favs` command to the terminal commands. Or the ability to collapse the interests and contact sections, and on mobile, the ability to close the contact section. Or automatic sitemap generation, or fixing a bug in bionic read for Persian text. And also the ability to archive posts on webarchive and a few minor visual tweaks. In short, a bunch of fun little things I found amusing to build.

I'm also satisfied with the result. Because I reached the goal I was after: I've pushed the distance between thought and action toward its minimum. I've taken away my own excuses, and now I wrote this post much more easily and without wasting time. To publish it, all I need to do is click once, write a commit message, and that's it.

It's now 2:11 AM, and if this post goes up without a problem, I'm going to get back to the rest of my work. If you want to know what it is, right now I'm implementing a Feature Gate that allows having a form of feature flags — enabling/disabling features for a specific group of users. This is also in line with a fundamental change in the codebase that I didn't want to affect all users if something went wrong.

Thanks for reading this far.
Sincerely,
Alireza.

P.S.: Since you can't see the admin panel, I thought it wouldn't be a bad idea to take a few screenshots and put them here.


![About and Contact](/media/posts/admin-panel/img_1773712226446_3lqz4.png)

![Manage Favourits](/media/posts/admin-panel/img_1773712226487_8i0so.png)

![New Post](/media/posts/admin-panel/img_1773712226516_hr1u6.png)

![Manage Post](/media/posts/admin-panel/img_1773712226529_ixp1u.png)

![New Admin Button in the Topbar](/media/posts/admin-panel/img_1773712226540_byx4m.png)

![Admin Panel Sidebar](/media/posts/admin-panel/img_1773749734391_3c3bc.png)

![Deploy Window](/media/posts/admin-panel/img_1773750892455_lkumh.png)

![Interactive Deployment](/media/posts/admin-panel/img_1773751148110_gzxam.png)

![Interactive Deployment[link](url)](/media/posts/admin-panel/img_1773751148188_kk6mp.png)


![Site Settings](/media/posts/admin-panel/img_1773752659728_3j6ku.png)

![Site Settings](/media/posts/admin-panel/img_1773752659742_8vivj.png)

![Site Settings](/media/posts/admin-panel/img_1773752659763_vozur.png)
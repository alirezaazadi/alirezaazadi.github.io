---
title: "State of Affairs - Issue Three"
summary: "A little about the state of these past few days and the days I am in and breathing."
date: "2026-06-15"
categories: ["Notes"]
keywords: ["Chronicles", "Home Lab", "Home Server", "Proxmox", "AI Team", "EEVDF Algorithm", "Strawberry Jam", "Jam Recipe", "Voice Resource Management", "Laptop Server"]
image: "/media/posts/img_1781556810117_rtah8.jpeg"
---

Hello. 

Here, I don't want to complain. I also don't want to paint it with sentimental colors. I am reminded of a note I wrote for the movie [The Song of Sparrows](https://a-azadi.blog/post/songs-of-the-sparrows). It was the first time I felt that maybe life is exactly what it is. An unfair unity of sorrow, anger, joy, and happiness. 

First of all, let me say that I'll be writing the next part of the home lab post soon because I found some time this weekend and turned two old laptops into what they were meant to be. I booted up CubesOS on one of them, and on the other, the Proxmox hypervisor and the CT for the media server (JellyFine, Radarr, etc.). I also did a few things that weren't in that post. Like connecting my Asus laptop directly to power by removing its battery so I could turn it into a server to keep on 24/7. For these, I also got one of those 3-tier metal shelves so air can flow underneath them. And an HDMI switch so I can connect the three devices I have (Xbox, MacBook, and the Asus laptop with CubesOS installed) to a monitor with two HDMI ports and switch between the Xbox and the second laptop whenever I want:


![Amazon basic 3 Tier shelving unit](/media/posts/andarahvalat-3/img_1781557435050_d2u9e.jpg|400)
![UGREEN HDMI Switch 4K 60Hz Two-Way Splitter](/media/posts/andarahvalat-3/img_1781557589486_7najn.jpg|400)
 
I've also kept all the commands and configs I did in one place. I'll post those too. 

Recently, based on the company's needs, they asked me to join the AI team, and I have almost no idea about this world. The first task I did, which hasn't been deployed yet by the way, was a management system for our voice service to fairly distribute our call resources (which are limited) among our customers, so that customers running large campaigns don't consume all our resources. For this, I went with EEVDF. A CPU scheduling algorithm that has been used in the kernel in recent years. It wasn't a complex algorithm and solved our exact need. On the other hand, we needed to sign SLAs with our new customers. And we needed to guarantee their number of concurrent calls. At the same time, I also worked a bit with these toolchains and our lang graph. The road is long and there's a lot to learn. During this time, a lot of things happened at the company that made the situation even more unstable and messed everything up a lot. But they are still good colleagues that I enjoy working with. 

At the same time, I'm busy with the mess of converting my residency and its paperwork. A task that could have been much simpler became longer, more complicated, and more troublesome thanks to the distrust of people who should have trusted. This is also one of those things where you tell yourself: It is what it is! To hell with it... 

I did two lovely things outside the room and away from the computer :) 
The post's photo is related to my attempt at making low-sugar strawberry jam. It was my first time making jam, and what an interesting task :) I took the photos in the order of the steps. I'll include the recipe below:

![Image](/media/posts/andarahvalat-3/img_1781558341240_tbmbz.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341269_87jhg.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341288_352fs.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341306_8qr47.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341320_9wp19.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341334_02gv6.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341345_5jpud.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341361_r1iof.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341372_ur4ud.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341382_gnxul.jpeg)

![Image](/media/posts/andarahvalat-3/img_1781558341399_v3zsh.jpeg)

> Ingredients for 950 grams of strawberries:
> Strawberries (cleaned and chopped): 950 grams
> Sugar: 130 to 180 grams
> Fresh lemon juice: 2 tablespoons
> Chia seeds (dry): 2.5 to 3.5 tablespoons
> Vanilla: 1/3 teaspoon (if powder) or half a teaspoon (if liquid extract).
> 
> Step 1: Macerating the strawberries (without adding water)
> Put the chopped strawberries in a pot and sprinkle the sugar over them. Toss the ingredients slightly and let them sit at room temperature for 30 to 60 minutes. The strawberries quickly react with the sugar and release their own juices. There is no need to add water.
> 
> Step 2: Cooking
> Place the pot over medium heat until it comes to a boil. Once boiling, lower the heat. Let the jam simmer gently for about 20 to 25 minutes until the strawberries soften and the liquid volume reduces slightly. During this time, if foam rises to the top, skim it off with a spoon so you have a clearer jam in the end. If you prefer a smoother texture, lightly mash the strawberries with the back of a spoon or a masher towards the end of cooking.
> 
> Step 3: Adding lemon
> In the final 2 minutes of cooking, add 2 tablespoons of fresh lemon juice, stir, and let it come to a boil.
> 
> Step 4: Adding chia and vanilla (off the heat)
> Remove the pot from the heat. Immediately add the dry chia seeds and vanilla to the hot jam and stir very well so the chia seeds distribute evenly and don't clump. Be sure to add the vanilla at this stage (after turning off the heat) so its aroma doesn't boil away.
> 
> Step 5: Cooling and thickening
> Let the jam cool completely in the same pot. As it cools, the chia seeds absorb the jam's liquid, giving it a great jelly-like texture and consistency.
> 
> Step 6: Packaging for the freezer
> Pour the cooled jam into 150ml containers. Be sure to leave about 1.5 to 2 centimeters empty at the top of each container so the freezing and expansion don't put pressure on the container. Close the containers tightly and put them in the freezer. Take out one container at a time, put it in the fridge to thaw, and consume within 1 to 2 weeks.
 

I also went and got a one-liter glass jar, and along with the half-liter jar we had, I went and made 1.5 liters of chili-garlic sauce. I don't have any more photos of this. I should take some and post them. 

![Image](/media/posts/andarahvalat-3/img_1781558972185_4sc7a.jpeg|400)
![Image](/media/posts/andarahvalat-3/img_1781558943882_sdzst.jpg|400)

It all turned into food :) And that's not even all of it. Another combination we tested and what a combination it was, was a sandwich we had at the cafe downstairs, and we decided to make it at home a few times. Even tonight:

Now, what's in it? 
1- Salami
2- Eggplants preserved in oil with a mild sour taste
3- Brie cheese
4- And what I add to this combination: small mushrooms preserved in oil with a mild sour taste.

![Sandwitch](/media/posts/andarahvalat-3/img_1781559234143_nnlm9.jpg|400)
![Salami](/media/posts/andarahvalat-3/img_1781559594659_hvbyz.webp|400)
![Melanzane sott’olio](/media/posts/andarahvalat-3/img_1781559604329_m34m8.jpg|400)
![Brie Cheese](/media/posts/andarahvalat-3/img_1781559619071_a2iea.webp|400)
![Esselunga Champignons funghi coltivati sottolio](/media/posts/andarahvalat-3/img_1781559634483_9cpi9.jpg|400)

Making it is also easy. You toast the bread a bit first, and then pile all of these on top of each other, and that's it. We have a very simple and small sandwich maker at home that is enough for our needs. If I want to make it extra fancy, I put a little olive oil/butter on the bottom of the breads when I want to toast them. 

Recently, I managed to read the Event-Driven chapter from the book *Fundamentals of Software Architecture*. I don't know, I feel like the book isn't as fluent and articulate as it seemed. I've postponed deciding whether to abandon or continue the book until after reading the Microservice Architecture chapter. I also read some parts of the first chapter of the book *Release It!*. A real account of the disruption in an airport's ticketing and check-in after a database upgrade. I hope I'm not saying it wrong. My memory has become severely weak due to distraction. Meaning, data barely transfers from my working memory to my long-term memory, and this has made me a bit worried. Anyway, a day or two after reading this section, we saw that the production database in the peak of working hours had all its connections filled to the brim, and consequently, the whole platform went down, and we had tons of paused locks in RDS. After fixing the issue, the next night after work hours, it took me about 5 hours to simulate the scenario, test my hypothesis for the problem, and finally write a postmortem explaining what the story was about. It was my first time doing such a thing, and doing it was interesting to me. Both this root cause analysis and recalling concepts I had forgotten (like which locks conflict with each other in Postgres), learning new things, and most importantly, the bet I made with Amin over a pizza on whether my hypothesis was right or wrong ;)

And this wasn't all of it. But my fingers are out of energy to type anymore. I'm going back to a few years ago when I think I got joint inflammation in my fingers :) And now, what's the plan ahead? A multitude of new tools and concepts that, now that my work in AI has gotten more serious, I have to learn and understand more about what's going on in this world. Something more than whether they have agreed to make a deal on Friday or what. Getting out of the mess of converting my residency, pulling the stranded ship of life out with my teeth, and implementing the next steps of the home network. I'd like to write one or two new posts as well, and recently I've become interested in Tor and knowing something more than just that it's layered. At least enough to take it out of this enigmatic state for me. Maybe I'll write about Tor too after I understand more. 'We shall see what will happen.' 

Sincerely,
Alireza Azadi. 
12:00 AM, June 16, 2026. Milan. 

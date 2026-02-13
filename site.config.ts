/**
 * PUBLIC site config — safe to import from client components.
 * Do NOT put GitHub repo details, API keys, or secrets here.
 */
export const siteConfig = {
  title: "Alireza Azadi's Blog",
  description: "An observer, a sojourner, an Ibn us-Sabiil. Here, I write about whatever amuses me; Share my thoughts, and experiences.",
  author: "Alireza Azadi",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://a-azadi.blog"),
  email: "Alireza_Azadi@Hotmail.com",

  social: {
    github: "https://github.com/alirezaazadi",
    linkedin: "https://linkedin.com/in/a-azadi",
    telegram: "https://t.me/dr_biglari_ds",
    email: "mailto:Alireza_Azadi@Hotmail.com",
    flickr: "https://www.flickr.com/people/202223694@N03/",
    goodreads: "https://www.goodreads.com/user/show/125123075-alireza-azadi",
  } as Record<string, string>,

  aboutMe: `
## About Me

I'm a software engineer who loves building things.
I write about technology, programming, and life.

Feel free to reach out!
  `.trim(),

  postsPerPage: 6,
};

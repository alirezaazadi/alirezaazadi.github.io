import { cookies } from "next/headers";

export type Language = "fa" | "en";

export const DEFAULT_LANGUAGE: Language = "fa";

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  return (lang === "en" ? "en" : "fa") as Language;
}

export const dict = {
  fa: {
    posts: "posts",
    about: "about",
    suggestions: "suggestions",
    admin: "Admin",
    readMore: "Read more...",
    favorites: "Favorites",
    readingTime: "min read",
  },
  en: {
    posts: "Posts",
    about: "About",
    suggestions: "Suggestions",
    admin: "Admin",
    readMore: "Read more...",
    favorites: "Favorites",
    readingTime: "min read",
  },
};

export function getDictionary(lang: Language) {
  return dict[lang];
}

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
سلام. 

من متولد و بزرگ شده‌ی ساری‌م. چند سالی هم هست که اومدم میلان زندگی می‌کنم. ورودی ۹۶ مهندسی کامپیوتر شاهرودم که ۲ سال از این چهار سال به خونه‌نشینی و قرنطینه‌ دوران کرونا گذشت. یکی دو سال بعدش هم که به شکل محیر العقولی به‌جای آلبرتا، سر از پلیمی در آوردم و اینجا ارشد کامپیوتر خوندم. ۳ سپتامبر ۲۰۲۲ اومدم میلان و شروعی به خیلی از اولین‌های زندگیم بود. اولین باری که سوار هواپیما می‌شدم. اولین باری که از ایران خارج می‌شدم و خیلی از اولین بار‌های دیگه. ۲۶ مارس ۲۰۲۶، همین ۱۰ روز دیگه هم قراره که فارغ بشم. خداروشکر. 
راجع‌به این که چی‌کار کردم و چی‌کار می‌کنم لینکدینم هست می‌تونید ببینین ولی اجمالا از ترم ۴ کارشناسی تا امروز تقریبا همیشه مشغول بودم.

بعضی از دوستام منو گیک می‌دونن. بعضی‌ها هم می‌گن که من نردم. قبول دارم که کیفیت‌هایی از هردو رو دارم ولی خودم، خودم رو مطعلق به هیچ‌کدوم از این‌ها نمی‌دونم چون هم گیک دیدم و هم نرد و خیلی شبیه هیچ‌کدومشون نیستم. شاید هم ترکیبی از هر دو. به هر‌حال، این منم. بیشترین چیزی که در من مشهوده،‌ میان‌مایه‌گیه که چند وقتی که دارم فکر می‌کنم که شاید چندان بد هم نباشه. 

این بلاگ هم -مثل کانال آگورا- حاصل طلاقی این دو خصیصه در منن. شما توش مطلب فنی پیدا می‌کنید. تجربه‌ی غیر فنی پیدا می‌کنید. درد و دل و روایت‌های شخصی پیدا می‌کنید. همه‌چیز پیدا می‌کنید چون که دامنه‌ی علاقه‌مندی‌های من تقریبا هیچ مرز روشنی ندارند. تنها یک چیز روشن وجود داره و اون هم اینه که من بعد از مدتی ناگهان از همه‌چیز خسته می‌شم و رها می‌کنم. همین بلاگ بعد این که درست شد یک ماهی رها شد و از چند روز پیش مجددا براش دارم با علاقه وقت صرف می‌کنم. این هم از گرفتاری‌های کسیه که از کودکی با اختلال تمرکز و بیش‌فعالی (یا همون ADHD) سر و کله زده و باهاش قد کشیده. 


فعلا وقت کمه و به همین‌مقدار «درباره‌ی من» بسنده می‌کنم تا سر فرصت بیام و تکمیلش کنم. 

خوش‌حال میشم اگر پستی رو خوندین و درباره‌ش حرفی، بازخوردی یا حسی داشتید باهام به اشتراک بذارید. اگر راجع‌به خود بلاگ و دم و دستگاهش سوالی، یا سخنی داشتید هم همینطور. 
از گرفتن ایمیل و جواب دادن بهشون خوش‌حال میشم :)

مرسی که تا اینجا خوندین. 


ارادتمند،
علیرضا آزادی
۱۷ مارس ۲۰۲۶ | ۲۶ اسفند ۱۴۰۴
  `.trim(),

  postsPerPage: 6,
  showFavorites: true,
  showContact: true,

  showTranslation: true,
  showAdhdMode: true,
  showArchive: true,
  showShare: true,
  showSuggestions: true,
  showAbout: true,
  showTerminal: true,

  shareOptions: ["linkedin", "telegram", "copyLink"] as string[],
  terminalCommands: ["help", "ls", "cd", "cat", "grep", "favs", "whoami", "clear", "exit"] as string[],
  translateLanguages: ["English", "French", "German", "Spanish", "Arabic", "Turkish", "Persian", "Chinese", "Japanese", "Korean", "Russian", "Portuguese", "Italian", "Dutch", "Hindi"] as string[],
  defaultImageWidth: 0,
};

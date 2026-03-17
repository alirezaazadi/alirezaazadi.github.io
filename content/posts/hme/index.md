---
title: "عملیات روی داده‌های رمز شده: رمزنگاری هم‌ریختی یا Homomorphic encryption"
summary: "احتمالا به فکرتون رسیده که چقدر خوب میشد بدون این که داده‌ای که رمز‌ شده رو رمزگشایی کنیم می‌تونستیم تغییرش بدیم. چیزی که بیشتر شبیه به یک خیال خوشه، واقعیت اما اینه که ده‌هاست که این ماجرا رویا نیست و من این رو تازه فهمیدم. کمی راجع‌به این امکان که اخیرا خوندم و یاد گرفتم اینجا نوشتم. درباره‌ی عملکردش و چالش‌های استفاده‌ ازش در دنیایی واقعی. امیدوارم که برای شما هم جالب باشه."
date: "2025-10-19"
categories: ["Software engineering"]
keywords: ["homomorphic encryption", "رمزنگاری هم‌ریختی", "fully homomorphic encryption", "data privacy", "encrypted data processing", "cloud computing security", "secure data operations", "fhe", "privacy-preserving computation", "machine learning homomorphic encryption"]
---


فرض کنید که می‌خوایید عبارتی رو گوگل کنید ولی گوگل نه بدونه چی ازش پرسیدین و نه بدونه چه جوابی به شما داده ولی با این حال جوابش به شما متناسب بوده.

یا فرض کنید، عکسی دارید و میخوایید توی یکی از این وب‌سایت‌های ویرایش عکس آپلود کنید و یک سری افکت روش اعمال کنید و این‌ها به درستی اعمال بشه و در عین حال اون سرویس از این که  افکت‌هاش رو روی چه عکسی انداخته خبر نداشته باشه.

یا بذارید یک کم عمیق تری بشیم. فرض کنید شما یک password manager دارید که رمز‌هاتون رو encrypt شده نگه‌داری کرده. می‌خوایید وقتی که برنامه لود شد و پیچیدگی‌های رمز‌هاتون رو بررسی می‌کرد، حتی دامپ مموری و یا دامپ جیستر‌های CPU هیچ کدوم از اطلاعات شما رو لو نده و همچنان اون‌ها encrypted باقی‌ بمونند و در عین‌حال فیچر بررسی پیچیدگی پسورد منیجیرتون به درستی عمل کرده باشه.

ما می‌دونیم که بالاخره در یک مرحله‌ای دیتا باید توی RAM لود بشه یا وقتی CPU می‌خواد که روی داده‌ها insturctionهاش رو اجرا کنه، باید خود دیتا (و نه encryptشده‌ش) رو روی رجیستر‌هاش Fetch کنه. پس نمیشه که ما بدون رمزگشایی داده و در اختیار قرار دادن کلید روی داده‌ها پردازش کنیم. درسته؟ نه!

خیلی جالبه که رمز‌گذاری وجود داره که این امکان رو میده تا بدون این که داده رو decrypt کنیم روی اون پردازش کنیم یا دقیق‌تر، اون رو به یک تابع بدیم و خروجی اون تابع عیناً مشابه خروجی تابع بر روی دیتای رمز نشده باشه :

[Fully Homomorphic Encryption](https://bozmen.io/fhe)
Homomorphic encryption is a form of encryption that allows computations to be performed on encrypted data without first having to decrypt it.[1] The resulting computations are left in an encrypted form which, when decrypted, result in an output that is identical to that of the operations performed on the unencrypted data. Homomorphic encryption can be used for privacy-preserving outsourced storage and computation. This allows data to be encrypted and outsourced to commercial cloud environments for processing, all while encrypted.

علارغم این که با این روش میشه چرخه‌ی حریم‌شخصی و محرمانگی رو کامل برقرار کرد و الگوریتم رمزگذاری جدیدی نیست، با این‌حال استفاده ازش چندان همه‌گیر نشده. یکی از اشکالات اساسی‌ش هزینه‌ی پردازشی بالای اونه. با تمام این‌ها، پیشرفت‌های زیادی کرده و هر چند سال نسل‌های جدید از اون منتشر میشه که مشکلات نسل‌های قبلی رو به شکلی مرتفع کردن و از طرفی سرعت پردازش روی داده‌های رمز‌شده [سالانه ۸ برابر بیشتر میشه](https://www.youtube.com/watch?v=487AjvFW1lk&t=668s) و  کم کم داره داره جای خودش رو روی سیستم‌های real-world پیدا می‌کنه. مثلا اپل پستی روی ۲۰۱۴ منتشر کرده که از دیتاست‌های رمز شده در مسئله‌های Nearest Neighbor Searchش برای حفظ حریم خصوصی کاربر‌هاش استفاده میکنه:
[Combining Machine Learning and Homomorphic Encryption in the Apple Ecosystem](https://machinelearning.apple.com/research/homomorphic-encryption)

توی [این ترد](https://news.ycombinator.com/item?id=44601023)  Hackernews نظر بقیه رو راجع‌بهش بخونید.
اگر به جزئیات پیاده‌سازی و ریاضی پشتش بیشتر علاقه دارید این [تکست‌بوک](https://arxiv.org/abs/2503.05136)  میتونه بدرد بخوره. (همون منبع ولی به صورت [HTML](https://fhetextbook.github.io/))
پیاده‌سازی اوپن‌سورسی هم از این الگوریتم وجود داره که از [اینجا](https://openfhe-development.readthedocs.io/en/latest/) می‌تونید بررسی کنید.
---
title: "حمله‌ی زمان‌بندی یا Timing Attack"
summary: "داشتم کد خودم رو ریویو می‌کردم چند روز پیش و به توصیه‌ی و گوشزد Cursor در قسمتی از کدم متوجه‌ی Timing Attack شدم.  فتح بابی شد برای این که بیشتر راجع‌بهش بخونم و یاد بگیرم. "
date: "2026-05-23"
categories: ["Programming"]
keywords: ["حمله زمانبندی", "timing attack", "مقایسه رشته جاوا", "string interning", "java string equals", "java string ==", "string literal", "string object", "امنیت جاوا", "آسیب پذیری زمانبندی"]
image: "/media/posts/timing-attack/img_1779559939909_uleti.png"
---


قبل از این که وارد اصل مطلب بشم، باید یک مقدمه بگم. مقدمه‌ای که خیلی وقت پیش توی کانال آگورا اون رو [نوشتم](https://t.me/dr_biglari_ds/2764). اینجا هم می‌ذارم و در ادامه، راجع‌به خود حمله صحبت می‌کنم. 

### بررسی تساوی دو رشته در جاوا

این مثال از بررسی تساوی دو رشته (که با جاوا پیاده شده) رو در نظر بگیرید:
```java
"foo".equals("foo")
```
ما میدونیم که این دو تا رشته باهم برابرن. حالا چطوری جاوا میدونه این دو تا رشته باهم یکسانن؟‌
قبلش نیازه که دو تا مقدمه کوچیک بگم. اول این که، رشته‌ها در جاوا از انواع داده non-primitive هستند و باهاشون مثل آبجکت رفتار میشه. دو این که ما دو روش ایجاد رشته داریم که جاوا با هر کدوم از اون ها به شکل متفاوتی رفتار میکنه:

۱- String Object
وقتی شما یک رشته رو با new ایجاد میکنین دارید یک آبجکت جدید توی هیپ مموری از کلاس String میسازید
```java
String moz = new String("moz");
```
من صد بار هم موز بخوام، ‌هر ۱۰۰ بار یک موز جدید بهم میده که شکلش عین موز اولیه ولی این موز اون موز نیست.

۲- String Literal
این‌جا دقیقا همون‌جاییه که پای String Interning باز میشه. توی این روش شما دیگه از new استفاده نمیکنین. خیلی سر‌راست رشته رو ایجاد میکنین:
```java
String khiar = "khiar"
```
تعریفی که خود داکیومنت جاوا داره اینه:

"A string literal consists of zero or more characters enclosed in double quotes. A string literal is a reference to an instance of class String"

من توصیه میکنم [این](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.5) لینک به داکیومنت خود جاوا رو بخونین اگر دنبال جزئیات بیشترید. از نظر من که جذابه خوندنش.

تفاوت این دو روش اینه که توی روش اول همیشه شما یک آبجکت جدید تحویل میگیرد ولی توی روش دوم بجز برای بار اول به ازای هر رشته، خبری از آبجکت جدید نیست. مثلا الان اگر بخوام یک استرینگ لیترال `khiar` دیگه بسازم، آدرس این خیار همون خیاره چون جاوا یک خیار جدید واسم نساخته. رفته همون خیار رو درآورده دوباره تحویلم داده. این کار چطوری انجام میشه؟ String Interning. 

وقتی یک String Literal ایجاد میکنین (فرض کنین اولین باره که اون رشته ایجاد شده)، جاوا یک شی از اون میسازه (مثل حالت اول) ولی بعدش اون رو ول نمیکنه به امون خدا. اون رو توی یک جایی به اسم String Intern Pool ذخیره میکنه. درواقع به صورت خودکار Intern میشن (احتمالا حدس میزنید که میشه این کار رو احتمالا به صورت manual هم انجام داد که حدس درستیه. متد intern کلاس String دقیقا برای همین کاره).


حالا برگردیم سراغ سوال خودمون. چطور تساوی این دو تا رشته بررسی میشه؟‌ دو روش برای این کار وجود داره: 

۱- استفاده از اوپراتور `==`
وقتی دو تا رشته رو با این روش مقایسه میکنیم، دو رشته از نظر محتوا بررسی نمیشن. بلکه آدرس‌های های اون ها هستند که بررسی میشن. پس اگر دو تا رشته یکسان (مثلا `Moz`) رو با  new ایجاد کنیم، همونطور که بالاتر توضیح دادم، دوتا موز به ظاهر یک‌سان ولی با آدرس‌های متفاوت داریم درنتیجه از دید این عملگر این دو تا باهم متفاوتن:

```
String one   = "Moz"; 
String two = new String("Moz"); 

one == two; // FALSE
```
۲- استفاده از متد equals

یک نگاهی به[ پیاده‌سازی این متد توی جاوا](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/19fb8f93c59dfd791f62d41f332db9e306bc1422/src/java.base/share/classes/java/lang/String.java#L1002) بندازیم:

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

اولین کاری که میکنه استفاده از عملگر `==`ـه. اگر آدرس دو تا آبجکت (رشته‌ها) یکی باشن دیگه سراغ بررسی محتوا نمیره.

حالا اگر آدرس‌ها یکی نبود چی؟ بهتره یک نگاهی به پیاده‌سازی equals توی StringLatin1 و StringUTF16 بندازیم:

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

اولین قدم چک کردن طول دو رشته‌س. تنها وقتی که طول دورشته یکسان بود اقدام به بررسی کارکتر به کارکتر میشه. اونم نه به این شکل که همه کارکتر‌ها رو لازم باشه ببینه (در بدترین حالت البته همه کارکتر‌ها رو میبینه)، بلکه به محض این که دو کارکتر نظیر به نظیر یکسان نبودن حلقه رو تموم میکنه و false برمیگردونه.

خب حالا که ما دقیقاً میدونیم چطوری دو تا رشته توی جاوا باهم مقایسه میشن میتونیم جواب این سوالمون رو بدیم: چطور تساوی این دو رشته توی قطعه کد زیر بررسی میشه؟‌
```java
"foo".equals("foo")
```
دو تا string literal داریم. وقتی foo اول ایجاد میشه، intern میشه و دومی دیگه ایجاد نمیشه بلکه همون رشته اول اینترن شده بهمون برگردونده میشه. از اونجایی که این foo همون fooعه (چون آدرس‌هاشون یکیه) و از طرفی هم متد equals اول از همه با اوپراتور `==` آدرس‌های دو تا رشته رو چک میکنه، خروجی متد equals برابر با true خواهد بود. بدون این که دو تا رشته کارکتر به کارکتر با هم چک بشن. 


خب جواب سوال رو سعی کردم مبسوط بدم. از اینجا به بعد میخوام یک کم راجع‌به خود String Pool بگم.

همونطور که گفتم، String Pool توی Heap Memory قرارداره. ولی همیشه اینطوری نبوده. تا نسخه ۱.۶ جاوا، String Pool توی یک فضای heap به خصوصی تحت عنوان Permanent Generation (یا به اختصار PermGen) بود که یک فضای جدا از  فضای هیپ اصلی بود. این فضا سایز محدود و غیر قابل تغییری داشت برای همین مشکل پر شدن حافظه (OutOfMemoryError) توی استفاده مکرر از متد intern (که بالاتر اشاره کردم) خیلیی دور از ذهن نبود.
 JVM  Memory Structure

```
 ____________________________________________
|                                                                        |
| PermGen Space                                            |
|___________________________________________|
|                                                                        |
| Heap Space                                                   |
|___________________________________________|
|                                     |                                  |
| Eden Space               | Survivor Space         |
| (Young Generation) | (Young Generation).  |
|____________________  | ____________________|
|                                                                        |
| Old Generation                                              |
|___________________________________________|
|                                                                        |
|               Old Generation                                |
|_____________________________________ _____|
```

از نسخه ۷ جاوا این pool به‌جای این که توی PermGen قرار بگیره، به heap space منتقل شد. اینطوری علاوه‌بر این که فضا حافظه‌ بیشتری در اختیارش قرار داشت، میشد خیلی راحت‌تر فضای حافظه‌رو با توجه به نیاز تغییر داد.

این که خود String Pool چطور پیاده شده از سواد من خارجه.ولی تاجایی که متوجه شدم، String Pool یک کلاس جاوایی نیست. بلکه توی JVM پیاده شده و با CPP (البته لزوما همیشه اینطور نیست). برای کش کردن رشته‌ها از StringTable استفاده شده که یک نوع HashTableعه.

### حمله‌ی زمان‌بندی یا Timing Attack
اینجا توضیح دادیم که در بررسی تساوی عادی دو رشته توی جاوا، اول از همه طول رشته‌ها بررسی می‌شه، اگر طول رشته‌ها برابر نبود دو رشته یک‌سان نیستن. و اگر طول رشته‌ها برابر بود، بررسی تساوی به محض این که به اولین کارکتر نابرابر برسیم، متوقف می‌شه و false برگردونده می‌شه. 

این بهینه‌سازی یک ریسک داره: Timing Attack.

فرض کنین می‌خوایید این دو رشته رو با الگوریتم بالا تساوی‌شون رو بررسی کنین:
```
a = "123abc"
b = "123bbc"
```
در اندیس سوم، چک کردن تساوی به‌اتمام می‌رسه چون که a و b باهم برابر نیستند. اگر فرض کنیم عملیات بررسی تساوی ۱ میکروثانیه طول می‌کشه، با صرف ۴ میکروثانیه متوجه می‌شیم که این دو تا رشته باهم برابر نیستن. 

فرض کنین یک جعبه سیاه دارید. این جعبه یک ورودی می‌گیره و اون هم رشته‌ی شماست. می‌دونین که این جعبه داخلش یک کار انجام می‌شه: «تساوی ورودی رو با رشته‌ای که اون تو مخفی شده چک می‌کنه و تنها مدت زمان انجام این عملیات رو برمیگردونه.»

حالا شما قصد دارید که حدس بزنین اون رشته‌ی مخفی شده توی جعبه چیه. از خوش اقبالی شما هم تا اینجا می‌دونین که اون رشته ۶ کارکتر بیشتر نداره (البته نیازی به از قبل دونستن این ماجرا نیست. برای ساده‌سازی اینطور فرض می‌کنیم). احتمالا حدس می‌زنین که باید یه جوری از این مدت‌زمان انجام عملیات بهره ببرید. 

پس شروع می‌کنید رشته‌هایی به طول ۶ تولید کردن (فرض کنین که رشته‌ی مخفی ما همون `123abc` بود) :
```
111111
```
۲ میکروثانیه: اولین ۱ با ۱ مچ شد. دومین ۱ با ۲ در رشته‌ی اصلی مچ نشد. دو تا عملیات مچ و تمام. پس فهمیدیم رشته‌ی رمز ما با ۱ شروع می‌شه. حالا باید کارکتر دوم رو از یک عوض کنیم.
```
121111
```

۳ میکروثانیه:  اولین ۱ با ۱ مچ شد. ۲ با ۲ مچ شد. ۱ با ۳ مچ نشد. سه مقایسه و تمام. پس فهمیدیم کارکتر دوم ۲عه. حالا باید سوم رو عوض کنیم. اون رو به ۳ تغییر می‌دیم (این درواقع بروت فورسه. می‌تونست هر کارکتر دیگه‌ای باشه. برای ساده‌سازی کارکتر درست رو انتخاب کردم.)
```
123111
```
۴ میکروثانیه: ۱ با ۱، ۲ با ۲ و حالا ۳ با ۳ مچ شد. ۱ با ۴ مچ نشد. عملیات با ۴ مقایسه تموم میشه. حالا وقتشه که کارکتر چهارم رو عوض کنیم. a رو جاش قرار می‌دیم:
```
123a11
```
و با همین روند می‌شه حدس زد و تمام کارکتر‌ها تا آخر پیش برد:
```
123abc
```
حالا هرچند بار که به جعبه این ورودی رشته رو می‌دیم مدت زمان تغییر نمی‌کنه. یا وقتی که رشته‌ای با طول بیشتر از این میدیم با زمانی خیلی کمتر کار رو خاتمه می‌ده. 

با این روش، بدون این‌که هیچ دسترسی مستقیمی به داخل جعبه داشته باشیم، تونستیم رشته‌ی مخفی رو کارکتر به کارکتر بازسازی کنیم. به این حمله  Timing Attack می‌گن. احتمالا هم حدس زدین که برای حدس کلید‌ها در صورتی که از الگوریتم بالا (یعنی یک تساوی ساده) برای مقایسه استفاده کنن می‌شه استفاده کرد. این‌ها نمونه‌های واقعی از بهره‌برداری از timing attack در دنیای واقعی بودن:

1- [OpenSSL & RSA Private Key — Brumley & Boneh (2003)](https://crypto.stanford.edu/~dabo/papers/ssl-timing.pdf)
```
Brumley and Boneh devised a timing attack against OpenSSL and successfully extracted a factor of the RSA modulus (and therefore the private key) over a local network. Before this attack, it was generally believed that timing attacks would not work against general-purpose servers because timing variations would mask the decryption times.
They reported using about a million queries to remotely extract a 1024-bit key from an OpenSSL 0.9.7 server in about two hours. The fix was enabling RSA blinding by default in OpenSSL.
```
2- [Django — User Enumeration via Timing (2013)](https://code.djangoproject.com/ticket/20760)
```
A test setup showed that for a correct username, the login response was 2–10 times slower than for an incorrect one, even when only running 5 queries per candidate. The difference was described as immediately obvious and easy to detect through any modern network with even a basic script. 
```
و خیلی مثال‌های دیگه. حالا شاید بپرسین: «وقتی درخواست از طریق اینترنت میاد، تاخیر شبکه همه چیز رو خراب نمی‌کنه؟»
جواب اینه که نه، لزوماً. در همین مثال‌های بالا نشون دادن که با تکنیک‌های آماری روی هزاران درخواست، می‌شه سیگنال زمانی رو حتی از پشت تاخیر شبکه هم استخراج کرد. در شبکه‌های داخلی (مثل سرویس‌های میکروسرویس که با هم روی یه VPC صحبت می‌کنن) این حمله خیلی راحت‌تره چون تاخیر شبکه خیلی کمه.

حالا چطور باید از این جلوگیری کرد؟ تو زبون‌های مختلف توابعی هست برای مقایسه‌ی رشته در زمان ثابت و غیروابسته به تعداد کارکتر مچ شده که برای مقایسه سکرت‌ها باید استفاده بشن.  

```
Java: MessageDigest.isEqual()
Go subtle.ConstantTimeCompare()
Python: hmac.compare_digest()
```
در ادامه سناریو‌ی  که با گولنگ پیاده کردم می‌ذارم:

```Go
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
و
```Go
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

نمونه‌ی خروجی:
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
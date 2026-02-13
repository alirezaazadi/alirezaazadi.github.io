import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Suggestions | Alireza Azadi',
    description: 'My personal recommendations for books, movies, podcasts, and articles.',
};

export default function SuggestionsPage() {
    return (
        <div className="about-page" dir="rtl">
            <h1 className="post-title" style={{ fontFamily: "var(--font-rtl)" }}>پیشنهادات</h1>

            <div className="markdown-body" style={{ fontFamily: "var(--font-rtl)", fontSize: "1.1em", lineHeight: "2" }}>
                <p>
                    اینجا من مطالبی که خوندم (از هرجا و از هرکس) که برام به هرشکلی جالب بود. یا ویدیوهایی که دیدم از جمله مستند، فیلم، کلیپ یا حتی محتوایی آموزشی و پادکستهایی که گوش کردم و در نهایت کتابهایی که خوندم و فکر کردم که معرفیش به دوستام جالبه رو میذارم. اینها در تکمیل بخش علاقهمندیهاست که کنار صفحه میبینید. اینجا رو به مرور تکمیل میکنم
                </p>
            </div>
        </div>
    );
}

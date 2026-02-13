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
                    اینجا من مطالب، ویدیوها و هر چیزی رو که خوندم یا دیدم و به نظرم جالب بوده، باهاتون به اشتراک می‌ذارم.
                    شامل:
                </p>
                <ul className="list-disc pr-6 mb-6">
                    <li>مقالات و نوشته‌های جالب از سراسر وب</li>
                    <li>مستندها، فیلم‌ها و کلیپ‌های دیدنی</li>
                    <li>محتوای آموزشی مفید</li>
                    <li>پادکست‌های شنیدنی</li>
                    <li>کتاب‌هایی که خوندم و فکر می‌کنم ارزش معرفی دارن</li>
                </ul>
                <p>
                    این بخش در واقع تکمیل‌کننده قسمت «علاقه‌مندی‌ها» (Favorites) هست که در ستون کناری می‌بینید.
                    توی علاقه‌مندی‌ها فقط لینک‌های کوتاه رو می‌ذارم، اما اینجا ممکنه توضیحات بیشتری در موردشون بدم.
                </p>
                <p>
                    این صفحه به مرور زمان تکمیل می‌شه.
                </p>
            </div>
        </div>
    );
}

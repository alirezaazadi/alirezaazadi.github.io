import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Alireza Azadi',
    description: 'About Alireza Azadi - Software Engineer and Writer',
};

export default function AboutPage() {
    return (
        <div className="about-page">
            <h1 className="post-title">About</h1>

            <div className="markdown-body">
                <p>
                    Hello! I'm Alireza Azadi. I'm a software engineer passionate about distributed systems,
                    performance optimization, and building great user experiences.
                </p>
                <p>
                    This blog is my personal space to share my thoughts, learnings, and experiments with technology.
                    I write about software architecture, coding challenges, and occasionally about non-tech topics
                    that interest me.
                </p>
                <p>
                    You can find me on <a href="https://github.com/alirezaazadi" target="_blank">GitHub</a> or
                    contact me via email if you'd like to reach out.
                </p>
            </div>
        </div>
    );
}

import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/posts';
import { siteConfig } from '../../site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getAllPostsMeta();
    
    // Map blog posts to sitemap entries
    const postUrls = posts.map(post => ({
        url: `${siteConfig.url}/post/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...postUrls,
    ];
}

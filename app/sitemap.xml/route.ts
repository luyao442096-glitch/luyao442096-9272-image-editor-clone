import { NextResponse } from 'next/server';

// 生成网站的动态XML站点地图
export async function GET() {
  // 网站的基本URL
  const baseUrl = 'https://www.zlseren.online';
  
  // 定义网站的所有静态路由
  const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/generator', priority: 0.9, changefreq: 'daily' },
    { path: '/pricing', priority: 0.8, changefreq: 'weekly' },
    { path: '/login', priority: 0.6, changefreq: 'monthly' },
    { path: '/pricing/success', priority: 0.5, changefreq: 'monthly' },
  ];
  
  // 生成XML内容
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  
  // 返回XML响应
  return new NextResponse(xmlContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
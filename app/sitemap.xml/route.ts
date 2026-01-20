import { NextResponse } from 'next/server';

// 生成网站的动态XML站点地图
// 遵循 sitemaps.org 0.9 协议标准
export async function GET() {
  // 网站的基本URL
  const baseUrl = 'https://www.zlseren.online';
  
  // 最后修改日期（统一使用 2026-01-20）
  const lastmod = '2026-01-20';
  
  // 定义网站的所有静态路由
  // 按照优先级和重要性分类
  const staticRoutes = [
    // ========== 首页 ==========
    { path: '/', priority: 1.0, changefreq: 'daily' },
    
    // ========== 核心功能板块 ==========
    { path: '/generator', priority: 0.9, changefreq: 'weekly' }, // AI 模型选择/图像生成
    { path: '/editor', priority: 0.9, changefreq: 'weekly' }, // 图像编辑
    { path: '/gallery', priority: 0.9, changefreq: 'weekly' }, // 作品展示画廊
    
    // ========== 定价与信用 ==========
    { path: '/pricing', priority: 0.8, changefreq: 'weekly' }, // 信用套餐
    { path: '/credit-system', priority: 0.8, changefreq: 'monthly' }, // 信用体系
    
    // ========== 用户支持 ==========
    { path: '/testimonials', priority: 0.8, changefreq: 'monthly' }, // 用户评价
    { path: '/faq', priority: 0.8, changefreq: 'monthly' }, // FAQ
    { path: '/refund-policy', priority: 0.7, changefreq: 'quarterly' }, // 退款政策
    { path: '/payment-security', priority: 0.7, changefreq: 'quarterly' }, // 支付安全
    
    // ========== 关于我们 ==========
    { path: '/about', priority: 0.7, changefreq: 'monthly' }, // 关于我们
    
    // ========== 其他重要页面 ==========
    { path: '/login', priority: 0.6, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.7, changefreq: 'yearly' }, // 隐私政策
    { path: '/terms', priority: 0.7, changefreq: 'yearly' }, // 服务条款
    
    // ========== 次要页面 ==========
    { path: '/pricing/success', priority: 0.6, changefreq: 'monthly' },
  ];
  
  // 生成XML内容
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  
  // 返回XML响应
  return new NextResponse(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
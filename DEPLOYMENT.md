# 生产环境部署指南

本文档提供将 Zlseren AI 网站部署到生产环境的完整指南。

## 📋 部署前检查清单

### 1. 代码准备
- [x] ✅ 所有代码更改已提交到 Git
- [x] ✅ Google Tag Manager (GTM-TCGJHBJ5) 已安装
- [x] ✅ Ahrefs Analytics 已安装
- [x] ✅ Sitemap.xml 已配置
- [x] ✅ Robots.txt 已配置

### 2. 环境变量准备
确保准备好以下环境变量：

```env
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenRouter API（必需）
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Creem 支付配置（如果使用支付功能）
CREEM_API_KEY=ck_live_your_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here
CREEM_PRODUCT_BASIC_MONTHLY=prod_xxx
CREEM_PRODUCT_BASIC_YEARLY=prod_xxx
CREEM_PRODUCT_PRO_MONTHLY=prod_xxx
CREEM_PRODUCT_PRO_YEARLY=prod_xxx
CREEM_PRODUCT_MAX_MONTHLY=prod_xxx
CREEM_PRODUCT_MAX_YEARLY=prod_xxx

# 网站配置
NEXT_PUBLIC_APP_URL=https://www.zlseren.online
SITE_URL=https://www.zlseren.online
SITE_NAME=Zlseren AI
```

### 3. 第三方服务配置

#### Google OAuth 配置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 更新 OAuth 2.0 客户端配置：
   - **Authorized JavaScript origins**: 
     ```
     https://www.zlseren.online
     ```
   - **Authorized redirect URIs**: 
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```

#### Supabase 配置
1. 确认 Supabase 项目已配置 Google OAuth
2. 检查重定向 URL 设置正确

---

## 🚀 方式一：Vercel 部署（推荐）

Vercel 是 Next.js 的官方推荐平台，提供最佳性能和集成体验。

### 步骤 1: 准备代码仓库

```bash
# 确保代码已提交到 Git
git add .
git commit -m "准备部署到生产环境"
git push origin main
```

### 步骤 2: 连接 Vercel

1. **访问 Vercel**
   - 打开 [https://vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的代码仓库
   - Vercel 会自动检测 Next.js 项目

### 步骤 3: 配置项目设置

#### 项目配置
- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（自动）
- **Output Directory**: `.next`（自动）
- **Install Command**: `npm install`（自动）

#### 环境变量配置
在 Vercel 项目设置中添加所有必需的环境变量：

1. 进入项目设置：**Settings** > **Environment Variables**
2. 添加以下变量（选择 **Production** 环境）：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENROUTER_API_KEY
CREEM_API_KEY
CREEM_WEBHOOK_SECRET
CREEM_PRODUCT_BASIC_MONTHLY
CREEM_PRODUCT_BASIC_YEARLY
CREEM_PRODUCT_PRO_MONTHLY
CREEM_PRODUCT_PRO_YEARLY
CREEM_PRODUCT_MAX_MONTHLY
CREEM_PRODUCT_MAX_YEARLY
NEXT_PUBLIC_APP_URL
SITE_URL
SITE_NAME
```

3. 点击 **Save** 保存所有变量

### 步骤 4: 配置域名

1. **添加自定义域名**
   - 进入项目：**Settings** > **Domains**
   - 添加域名：`www.zlseren.online`
   - 添加根域名：`zlseren.online`（可选）

2. **配置 DNS**
   - 按照 Vercel 提供的 DNS 记录配置你的域名
   - 通常需要添加 CNAME 记录：
     ```
     类型: CNAME
     名称: www
     值: cname.vercel-dns.com
     ```

### 步骤 5: 部署

1. **触发部署**
   - 点击 **Deploy** 按钮
   - 或推送代码到主分支（如果已配置自动部署）

2. **等待构建完成**
   - 查看构建日志
   - 确认构建成功

### 步骤 6: 验证部署

部署完成后，验证以下内容：

- [ ] 网站可以正常访问：`https://www.zlseren.online`
- [ ] Google Tag Manager 正常工作（使用 GTM 预览模式）
- [ ] Ahrefs Analytics 正常工作
- [ ] Sitemap 可访问：`https://www.zlseren.online/sitemap.xml`
- [ ] Robots.txt 可访问：`https://www.zlseren.online/robots.txt`
- [ ] Google 登录功能正常
- [ ] API 路由正常工作

---

## 🌐 方式二：其他平台部署

### Netlify 部署

1. **连接仓库**
   - 访问 [Netlify](https://www.netlify.com/)
   - 导入 Git 仓库

2. **构建设置**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **环境变量**
   - 在 **Site settings** > **Environment variables** 中添加所有变量

4. **重定向配置**
   创建 `netlify.toml`：
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### 自托管部署（VPS/服务器）

#### 使用 PM2 部署

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

4. **启动应用**
   ```bash
   pm2 start npm --name "zlseren-ai" -- start
   ```

5. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name www.zlseren.online zlseren.online;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **配置 SSL（使用 Let's Encrypt）**
   ```bash
   sudo certbot --nginx -d www.zlseren.online -d zlseren.online
   ```

---

## 🔍 部署后验证清单

### 功能验证

- [ ] **首页加载正常**
  - 访问 `https://www.zlseren.online`
  - 检查页面元素正常显示

- [ ] **认证功能**
  - 测试 Google 登录
  - 确认重定向正常

- [ ] **API 路由**
  - 测试图像生成功能
  - 测试图像分析功能

- [ ] **支付功能**（如果启用）
  - 测试支付流程
  - 验证 Webhook 接收

### SEO 验证

- [ ] **Sitemap**
  - 访问 `https://www.zlseren.online/sitemap.xml`
  - 验证所有 URL 正确

- [ ] **Robots.txt**
  - 访问 `https://www.zlseren.online/robots.txt`
  - 确认内容正确

- [ ] **Meta 标签**
  - 检查页面源代码
  - 确认 SEO meta 标签存在

### 分析工具验证

- [ ] **Google Tag Manager**
  - 使用 GTM 预览模式验证
  - 检查数据层（dataLayer）是否正常

- [ ] **Ahrefs Analytics**
  - 在 Ahrefs 后台验证安装状态
  - 确认数据开始收集

- [ ] **Vercel Analytics**（如果使用 Vercel）
  - 检查 Vercel 仪表板
  - 确认分析数据正常

---

## 🔧 常见问题排查

### 问题 1: 环境变量未生效

**症状**: 功能异常，API 调用失败

**解决方案**:
1. 检查环境变量名称是否正确（注意大小写）
2. 确认 `NEXT_PUBLIC_` 前缀的变量已正确设置
3. 重新部署应用（环境变量更改需要重新部署）

### 问题 2: Google OAuth 重定向错误

**症状**: Google 登录后出现重定向 URI 不匹配错误

**解决方案**:
1. 检查 Google Cloud Console 中的重定向 URI
2. 确认生产环境 URL 已添加到授权列表
3. 更新 Supabase 中的重定向 URL 配置

### 问题 3: 构建失败

**症状**: 部署时构建错误

**解决方案**:
1. 检查构建日志中的具体错误
2. 确认所有依赖已正确安装
3. 检查 TypeScript 类型错误
4. 运行本地构建测试：`npm run build`

### 问题 4: 静态资源加载失败

**症状**: 图片、CSS 等资源无法加载

**解决方案**:
1. 检查 `public` 目录中的文件
2. 确认资源路径正确
3. 检查 CDN 配置（如果使用）

---

## 📊 性能优化建议

### 1. 启用 Vercel Analytics
如果使用 Vercel，Analytics 已自动集成。

### 2. 图片优化
- 使用 Next.js Image 组件
- 启用图片 CDN（如 Cloudinary）

### 3. 缓存策略
- 静态资源使用长期缓存
- API 路由使用适当的缓存头

### 4. 代码分割
- Next.js 自动进行代码分割
- 确保使用动态导入（`dynamic import`）加载大型组件

---

## 🔐 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理所有密钥

2. **HTTPS 强制**
   - 确保所有流量使用 HTTPS
   - 配置 HSTS 头

3. **API 安全**
   - 实施速率限制
   - 验证用户输入
   - 使用 CORS 正确配置

4. **依赖更新**
   - 定期更新依赖包
   - 检查安全漏洞

---

## 📞 支持

如有部署问题，请：
1. 查看构建日志
2. 检查环境变量配置
3. 参考项目文档：`TROUBLESHOOTING.md`
4. 联系支持：luyao@zlseren.online

---

## 🎉 部署成功！

部署完成后，你的网站应该可以正常访问了。记得：
- 定期监控网站性能
- 检查错误日志
- 更新依赖包
- 备份重要数据

祝部署顺利！🚀

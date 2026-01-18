# 📋 Supabase + Google OAuth 配置指南

## 当前状态
根据配置检查，您需要完成以下配置：
- ❌ Supabase URL 和 Key
- ✅ OpenRouter API Key（已配置）

---

## 🎯 配置步骤

### 步骤 1️⃣: 创建 Supabase 项目

#### 1.1 访问 Supabase
👉 **打开**: https://supabase.com/

#### 1.2 创建项目
1. 点击 **"Start your project"** 或登录
2. 点击 **"New Project"**
3. 填写信息：
   - **Name**: `image-editor`（或您喜欢的名称）
   - **Database Password**: 设置强密码（请保存！）
   - **Region**: 选择最近的区域（如 `Southeast Asia (Singapore)`）
4. 点击 **"Create new project"**
5. ⏳ 等待 1-2 分钟项目创建完成

#### 1.3 获取 API 凭据
1. 项目创建后，点击左侧 **⚙️ Settings**
2. 选择 **API**
3. 找到以下信息并**复制**：
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. 📝 **保存这两个值**，稍后需要

---

### 步骤 2️⃣: 配置 Google OAuth

#### 2.1 访问 Google Cloud Console
👉 **打开**: https://console.cloud.google.com/

#### 2.2 创建或选择项目
1. 点击顶部项目选择器
2. 点击 **"New Project"**
3. 输入名称：`image-editor-oauth`
4. 点击 **"Create"**

#### 2.3 配置 OAuth 同意屏幕
1. 左侧菜单：**APIs & Services** > **OAuth consent screen**
2. 选择 **External**（外部用户）
3. 点击 **"Create"**
4. 填写：
   - **App name**: `Image Editor`
   - **User support email**: 选择您的邮箱
   - **Developer contact**: 输入您的邮箱
5. 点击 **"Save and Continue"**
6. 在 **Scopes** 页面，点击 **"Save and Continue"**（使用默认作用域）
7. 在 **Test users** 页面，点击 **"Save and Continue"**（可选）
8. 查看摘要，点击 **"Back to Dashboard"**

#### 2.4 创建 OAuth 2.0 凭据
1. 左侧菜单：**APIs & Services** > **Credentials**
2. 点击 **"+ CREATE CREDENTIALS"**
3. 选择 **"OAuth client ID"**
4. 如果提示配置同意屏幕，点击 **"Configure Consent Screen"** 并完成
5. 选择应用类型：**Web application**
6. 填写：
   - **Name**: `Image Editor Web Client`
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**: 
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     ⚠️ **重要**: 将 `YOUR_PROJECT_REF` 替换为您的 Supabase 项目引用
     - 如何找到项目引用？在 Supabase Project URL 中，`https://` 和 `.supabase.co` 之间的部分
     - 例如：如果 URL 是 `https://abcdefghijklmnop.supabase.co`，则项目引用是 `abcdefghijklmnop`
7. 点击 **"Create"**
8. 📝 **复制并保存**：
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`

---

### 步骤 3️⃣: 在 Supabase 中启用 Google

#### 3.1 返回 Supabase 项目
👉 **打开**: https://app.supabase.com/

#### 3.2 配置 Google 提供商
1. 左侧菜单：**Authentication** > **Providers**
2. 找到 **Google** 卡片
3. 点击切换开关**启用 Google**
4. 填写：
   - **Client ID (for OAuth)**: 粘贴从 Google Cloud Console 复制的 Client ID
   - **Client Secret (for OAuth)**: 粘贴从 Google Cloud Console 复制的 Client Secret
5. 点击 **"Save"**
6. ✅ 确认 Google 提供商显示为 **"Enabled"**

---

### 步骤 4️⃣: 配置环境变量

#### 4.1 创建 `.env.local` 文件
在项目根目录创建 `.env.local` 文件

#### 4.2 添加配置
打开 `.env.local`，添加以下内容：

```env
# OpenRouter API (已配置)
OPENROUTER_API_KEY=your_openrouter_key_here

# Site Configuration
SITE_URL=http://localhost:3000
SITE_NAME=Zlseren AI

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**替换以下值**：
- `YOUR_PROJECT_REF`: 您的 Supabase 项目引用
- `your_anon_key_here`: 您的 Supabase anon public key

#### 4.3 示例
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 步骤 5️⃣: 验证配置

运行配置检查：
```bash
npm run check-config
```

应该看到：
```
✅ NEXT_PUBLIC_SUPABASE_URL: 已配置
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: 已配置
✅ OPENROUTER_API_KEY: 已配置
✅ 配置检查通过！
```

---

### 步骤 6️⃣: 测试 Google 登录

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器：
   ```
   http://localhost:3000/login
   ```

3. 点击 **"Google"** 按钮

4. 应该会：
   - 重定向到 Google 登录页面
   - 登录后重定向回应用
   - 显示您的用户信息

---

## ❌ 常见问题

### 问题 1: 重定向 URI 不匹配
**错误**: `redirect_uri_mismatch`

**解决**:
- 检查 Google Cloud Console 中的重定向 URI
- 确保格式完全正确：`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- 确保没有多余的空格或斜杠

### 问题 2: 环境变量未加载
**错误**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**解决**:
- 确保 `.env.local` 文件在项目根目录
- 确保变量名正确（以 `NEXT_PUBLIC_` 开头）
- **重启开发服务器**

### 问题 3: Google 提供商未启用
**错误**: `Google provider is not enabled`

**解决**:
- 检查 Supabase 控制台：Authentication > Providers > Google
- 确保已启用并保存了 Client ID 和 Secret

---

## 📚 参考文档

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ 配置检查清单

完成以下所有步骤后，您的配置就完成了：

- [ ] 创建了 Supabase 项目
- [ ] 复制了 Supabase URL 和 anon key
- [ ] 创建了 Google Cloud 项目
- [ ] 配置了 OAuth 同意屏幕
- [ ] 创建了 OAuth 2.0 凭据
- [ ] 复制了 Google Client ID 和 Secret
- [ ] 在 Supabase 中启用了 Google 提供商
- [ ] 创建了 `.env.local` 文件
- [ ] 添加了所有必需的环境变量
- [ ] 运行了 `npm run check-config` 并通过
- [ ] 测试了 Google 登录功能

完成所有步骤后，您就可以使用 Google 登录功能了！🎉

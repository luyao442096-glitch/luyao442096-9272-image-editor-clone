# Supabase 和 Google OAuth 配置指南

本指南将帮助您完成 Supabase 和 Google OAuth 的配置。

## 第一步：创建 Supabase 项目

1. **访问 Supabase**
   - 打开 [https://supabase.com/](https://supabase.com/)
   - 点击 "Start your project" 或登录您的账户

2. **创建新项目**
   - 点击 "New Project"
   - 填写项目信息：
     - **Name**: 输入项目名称（例如：image-editor）
     - **Database Password**: 设置一个强密码（请保存好，稍后需要）
     - **Region**: 选择离您最近的区域
   - 点击 "Create new project"
   - 等待项目创建完成（通常需要 1-2 分钟）

3. **获取 API 凭据**
   - 项目创建完成后，点击左侧菜单的 **Settings** (⚙️)
   - 选择 **API**
   - 您会看到以下信息：
     - **Project URL**: 例如 `https://xxxxx.supabase.co`
     - **anon public key**: 一长串字符（以 `eyJ` 开头）
   - **复制这两个值**，稍后需要添加到 `.env.local` 文件

## 第二步：配置 Google OAuth

### 2.1 在 Google Cloud Console 创建项目

1. **访问 Google Cloud Console**
   - 打开 [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - 使用您的 Google 账户登录

2. **创建或选择项目**
   - 点击顶部项目选择器
   - 点击 "New Project"
   - 输入项目名称（例如：image-editor-oauth）
   - 点击 "Create"
   - 等待项目创建完成

### 2.2 配置 OAuth 同意屏幕

1. **打开 OAuth 同意屏幕**
   - 在左侧菜单中，点击 **APIs & Services** > **OAuth consent screen**

2. **选择用户类型**
   - 选择 **External**（外部用户）
   - 点击 "Create"

3. **填写应用信息**
   - **App name**: 输入您的应用名称（例如：Image Editor）
   - **User support email**: 选择您的邮箱
   - **Developer contact information**: 输入您的邮箱
   - 点击 "Save and Continue"

4. **配置作用域（Scopes）**
   - 点击 "Add or Remove Scopes"
   - 确保以下作用域已添加：
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - 点击 "Update"，然后 "Save and Continue"

5. **测试用户（可选）**
   - 如果您选择的是 "External" 用户类型，可以添加测试用户
   - 点击 "Save and Continue"

6. **完成配置**
   - 查看摘要信息
   - 点击 "Back to Dashboard"

### 2.3 创建 OAuth 2.0 凭据

1. **创建凭据**
   - 在左侧菜单中，点击 **APIs & Services** > **Credentials**
   - 点击顶部的 **+ CREATE CREDENTIALS**
   - 选择 **OAuth client ID**

2. **选择应用类型**
   - 选择 **Web application**

3. **配置 OAuth 客户端**
   - **Name**: 输入名称（例如：Image Editor Web Client）
   - **Authorized JavaScript origins**: 
     - 添加：`http://localhost:3000`（用于本地开发）
     - 如果已部署，添加您的生产域名（例如：`https://yourdomain.com`）
   - **Authorized redirect URIs**: 
     - **重要**：添加您的 Supabase 回调 URL
     - 格式：`https://<your-project-ref>.supabase.co/auth/v1/callback`
     - 将 `<your-project-ref>` 替换为您的 Supabase 项目引用
     - 例如：`https://abcdefghijklmnop.supabase.co/auth/v1/callback`
     - 如何找到项目引用：在 Supabase 项目 URL 中，`https://` 和 `.supabase.co` 之间的部分
   - 点击 "Create"

4. **保存凭据**
   - 您会看到一个弹出窗口，显示：
     - **Your Client ID**: 一长串字符（以 `.apps.googleusercontent.com` 结尾）
     - **Your Client Secret**: 一长串字符
   - **重要**：立即复制这两个值，稍后需要添加到 Supabase
   - 点击 "OK"

## 第三步：在 Supabase 中配置 Google 提供商

1. **返回 Supabase 项目**
   - 打开您的 Supabase 项目控制台

2. **配置 Google 提供商**
   - 在左侧菜单中，点击 **Authentication**
   - 选择 **Providers**
   - 找到 **Google** 提供商
   - 点击切换开关以**启用 Google 登录**

3. **输入 Google OAuth 凭据**
   - **Client ID (for OAuth)**: 粘贴从 Google Cloud Console 复制的 Client ID
   - **Client Secret (for OAuth)**: 粘贴从 Google Cloud Console 复制的 Client Secret
   - 点击 "Save"

4. **验证配置**
   - 确保 Google 提供商显示为 "Enabled"
   - 状态应该显示为绿色

## 第四步：配置环境变量

1. **创建 `.env.local` 文件**
   - 在项目根目录创建 `.env.local` 文件
   - 如果已有该文件，请打开它

2. **添加 Supabase 配置**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   - 将 `your-project-ref` 替换为您的 Supabase 项目引用
   - 将 `your_anon_key_here` 替换为您的 Supabase anon key

3. **完整示例**
   ```env
   # OpenRouter API Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Site Configuration
   SITE_URL=http://localhost:3000
   SITE_NAME=Nano Banana
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 第五步：测试配置

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试 Google 登录**
   - 打开浏览器访问 `http://localhost:3000/login`
   - 点击 "Google" 按钮
   - 应该会重定向到 Google 登录页面
   - 登录后应该会重定向回您的应用

## 常见问题排查

### 问题 1：重定向 URI 不匹配
**错误信息**：`redirect_uri_mismatch`

**解决方案**：
- 检查 Google Cloud Console 中的 "Authorized redirect URIs"
- 确保添加了正确的 Supabase 回调 URL：`https://<your-project-ref>.supabase.co/auth/v1/callback`
- 确保 URL 完全匹配（包括 `https://` 和路径）

### 问题 2：Supabase 环境变量未加载
**错误信息**：`NEXT_PUBLIC_SUPABASE_URL is not defined`

**解决方案**：
- 确保 `.env.local` 文件在项目根目录
- 确保环境变量名称正确（以 `NEXT_PUBLIC_` 开头）
- 重启开发服务器

### 问题 3：Google OAuth 未启用
**错误信息**：`Google provider is not enabled`

**解决方案**：
- 检查 Supabase 控制台中的 Authentication > Providers
- 确保 Google 提供商已启用
- 确保 Client ID 和 Client Secret 已正确配置

### 问题 4：OAuth 同意屏幕未发布
**错误信息**：`Access blocked: This app's request is invalid`

**解决方案**：
- 在 Google Cloud Console 中，完成 OAuth 同意屏幕配置
- 如果应用处于测试模式，确保添加了测试用户
- 或者发布应用（需要验证）

## 下一步

配置完成后，您可以：
1. 测试 Google 登录功能
2. 查看 Supabase 数据库中的用户数据
3. 根据需要自定义用户元数据
4. 配置其他认证提供商（GitHub、Apple 等）

## 有用的链接

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)

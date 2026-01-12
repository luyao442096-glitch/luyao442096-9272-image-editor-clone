# 快速配置指南

## 🚀 5 分钟快速配置

### 步骤 1: 创建 Supabase 项目（2 分钟）

1. 访问 [https://supabase.com/](https://supabase.com/) 并登录
2. 点击 "New Project"
3. 填写项目信息并创建
4. 在 **Settings** > **API** 中复制：
   - Project URL
   - anon public key

### 步骤 2: 配置 Google OAuth（2 分钟）

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. **APIs & Services** > **OAuth consent screen**：
   - 选择 "External"
   - 填写应用名称和邮箱
   - 保存
4. **APIs & Services** > **Credentials**：
   - 创建 OAuth 2.0 Client ID
   - 类型：Web application
   - 重定向 URI：`https://<your-project-ref>.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Client Secret

### 步骤 3: 在 Supabase 中启用 Google（1 分钟）

1. 返回 Supabase 项目
2. **Authentication** > **Providers** > **Google**
3. 启用并粘贴 Client ID 和 Client Secret
4. 保存

### 步骤 4: 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
```

### 步骤 5: 验证配置

```bash
npm run check-config
```

### 步骤 6: 启动应用

```bash
npm run dev
```

访问 `http://localhost:3000/login` 测试 Google 登录！

---

📖 **详细配置指南**: 查看 `SUPABASE_SETUP.md`

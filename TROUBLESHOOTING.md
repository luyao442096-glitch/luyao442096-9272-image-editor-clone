# Google OAuth 登录故障排查指南

## 🔍 常见错误及解决方案

### 错误 1: "Google 登录失败，请重试"

#### 可能原因：

1. **Supabase Google 提供商未启用**
   - ✅ 检查：访问 Supabase 控制台 > Authentication > Providers > Google
   - ✅ 确保：Google 提供商已启用（开关为绿色）
   - ✅ 确保：Client ID 和 Client Secret 已正确填写

2. **Google Cloud Console 配置错误**
   - ✅ 检查：重定向 URI 是否正确
   - ✅ 格式应为：`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - ✅ 确保：没有多余的空格或斜杠
   - ✅ 确保：使用 HTTPS（不是 HTTP）

3. **环境变量未配置**
   - ✅ 检查：`.env.local` 文件是否存在
   - ✅ 确保：`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已设置
   - ✅ 重启：开发服务器（`npm run dev`）

4. **OAuth 同意屏幕未配置**
   - ✅ 检查：Google Cloud Console > APIs & Services > OAuth consent screen
   - ✅ 确保：已选择用户类型（External）
   - ✅ 确保：应用信息已填写完整
   - ✅ 如果应用在测试模式：确保添加了测试用户

### 错误 2: "redirect_uri_mismatch"

**原因**：Google Cloud Console 中的重定向 URI 与 Supabase 回调 URL 不匹配

**解决步骤**：
1. 在 Supabase 控制台找到您的项目 URL
2. 提取项目引用（`https://` 和 `.supabase.co` 之间的部分）
3. 在 Google Cloud Console > Credentials > OAuth 2.0 Client ID
4. 添加授权重定向 URI：`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. 确保完全匹配，包括协议（https）和路径

### 错误 3: "Provider is not enabled"

**原因**：Supabase 中的 Google 提供商未启用

**解决步骤**：
1. 访问 Supabase 控制台
2. 进入 Authentication > Providers
3. 找到 Google 卡片
4. 点击切换开关启用
5. 输入 Client ID 和 Client Secret
6. 点击 Save

### 错误 4: "Invalid client credentials"

**原因**：Google Client ID 或 Secret 配置错误

**解决步骤**：
1. 检查 Supabase 中的 Google 提供商配置
2. 确保 Client ID 格式正确（以 `.apps.googleusercontent.com` 结尾）
3. 确保 Client Secret 格式正确（以 `GOCSPX-` 开头）
4. 重新从 Google Cloud Console 复制凭据
5. 在 Supabase 中重新保存

## 🔧 调试步骤

### 步骤 1: 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 点击 Google 登录按钮
4. 查看错误信息

### 步骤 2: 检查服务器日志

1. 查看运行 `npm run dev` 的终端
2. 查找错误信息
3. 注意任何 Supabase 或 OAuth 相关的错误

### 步骤 3: 验证配置

运行配置检查：
```bash
npm run check-config
```

### 步骤 4: 测试 Supabase 连接

1. 访问 Supabase 控制台
2. 检查项目状态（应该是 Active）
3. 检查 API 设置中的 URL 和 Key

### 步骤 5: 测试 Google OAuth 配置

1. 访问 Google Cloud Console
2. 检查 OAuth 2.0 凭据
3. 验证重定向 URI 列表
4. 检查 OAuth 同意屏幕状态

## 📋 配置检查清单

完成以下所有项目以确保配置正确：

- [ ] Supabase 项目已创建并处于活动状态
- [ ] `.env.local` 文件存在并包含正确的环境变量
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 格式正确（以 `https://` 开头，以 `.supabase.co` 结尾）
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已设置（通常以 `eyJ` 开头）
- [ ] Google Cloud Console 项目已创建
- [ ] OAuth 同意屏幕已配置
- [ ] OAuth 2.0 Client ID 已创建（Web application 类型）
- [ ] 重定向 URI 已添加到 Google OAuth 凭据
- [ ] Supabase 中的 Google 提供商已启用
- [ ] Google Client ID 和 Secret 已正确输入到 Supabase
- [ ] 开发服务器已重启（如果修改了环境变量）

## 🆘 仍然无法解决？

如果按照以上步骤仍无法解决问题，请检查：

1. **网络连接**：确保可以访问 Supabase 和 Google 服务
2. **防火墙/代理**：确保没有阻止 OAuth 请求
3. **浏览器缓存**：尝试清除浏览器缓存或使用隐私模式
4. **Supabase 状态**：检查 [Supabase Status](https://status.supabase.com/)

## 📞 获取帮助

- [Supabase 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Discord](https://discord.supabase.com/)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)

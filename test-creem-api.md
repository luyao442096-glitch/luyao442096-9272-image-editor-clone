# Creem API Key 测试指南

## 方法 1: 使用浏览器控制台测试

1. 打开浏览器，按 F12 打开开发者工具
2. 切换到 Console（控制台）标签
3. 复制并粘贴以下代码：

```javascript
fetch('https://api.creem.io/v1/checkouts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'creem_test_3dlkEtyc4co7RWiLPFNHAE'
  },
  body: JSON.stringify({
    product_id: 'prod_3IjLmvk9PCT9GeVtWmtiNL',
    success_url: 'https://www.zlseren.online/pricing/success'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ 成功:', data);
  if (data.checkout_url || data.url) {
    console.log('Checkout URL:', data.checkout_url || data.url);
  }
})
.catch(error => {
  console.error('❌ 错误:', error);
});
```

## 方法 2: 使用 curl 命令测试

在终端（PowerShell 或 CMD）中运行：

```powershell
curl -X POST https://api.creem.io/v1/checkouts `
  -H "Content-Type: application/json" `
  -H "x-api-key: creem_test_3dlkEtyc4co7RWiLPFNHAE" `
  -d '{\"product_id\":\"prod_3IjLmvk9PCT9GeVtWmtiNL\",\"success_url\":\"https://www.zlseren.online/pricing/success\"}'
```

## 方法 3: 提交代码并部署测试端点

1. 提交代码：
```bash
git add app/api/creem/test-api-key/
git add app/api/creem/checkout/route.ts
git commit -m "Add API key test endpoint and fix checkout"
git push
```

2. 等待 Vercel 自动部署完成（通常 1-2 分钟）

3. 部署完成后访问：
   https://www.zlseren.online/api/creem/test-api-key

## 预期结果

### ✅ API Key 有效：
- 状态码：200
- 返回包含 `checkout_url` 或 `id` 字段

### ❌ API Key 无效：
- 状态码：401 或 403
- 错误信息：Invalid API key 或类似

### ❌ 产品ID无效：
- 状态码：400 或 404
- 错误信息：Product not found 或类似

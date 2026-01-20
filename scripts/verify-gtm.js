#!/usr/bin/env node

/**
 * GTM 验证脚本
 * 检查 Google Tag Manager 是否正确安装
 */

const https = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');

const GTM_CONTAINER_ID = 'GTM-TCGJHBJ5';
const PRODUCTION_URL = 'https://www.zlseren.online';

console.log('🔍 验证 Google Tag Manager 安装...\n');

// 检查本地代码
console.log('📁 检查本地代码...');
const layoutPath = join(process.cwd(), 'app/layout.tsx');

try {
  const layoutContent = readFileSync(layoutPath, 'utf-8');
  
  // 检查 head 脚本
  if (layoutContent.includes(GTM_CONTAINER_ID)) {
    console.log(`  ✅ GTM 容器 ID (${GTM_CONTAINER_ID}) 已找到`);
  } else {
    console.log(`  ❌ GTM 容器 ID (${GTM_CONTAINER_ID}) 未找到`);
  }
  
  // 检查 noscript 部分
  if (layoutContent.includes('googletagmanager.com/ns.html')) {
    console.log('  ✅ GTM noscript 部分已找到');
  } else {
    console.log('  ❌ GTM noscript 部分未找到');
  }
  
  // 检查 Script 组件
  if (layoutContent.includes('Script') && layoutContent.includes('beforeInteractive')) {
    console.log('  ✅ GTM Script 组件配置正确');
  } else {
    console.log('  ⚠️  GTM Script 组件配置可能有问题');
  }
  
} catch (error) {
  console.log(`  ❌ 无法读取 layout.tsx: ${error.message}`);
}

// 检查生产环境（可选）
console.log('\n🌐 检查生产环境（需要网络连接）...');
console.log(`  正在检查: ${PRODUCTION_URL}`);

const options = {
  hostname: 'www.zlseren.online',
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'GTM-Verification-Script'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data.includes(GTM_CONTAINER_ID)) {
      console.log(`  ✅ 生产环境检测到 GTM 代码 (${GTM_CONTAINER_ID})`);
    } else {
      console.log(`  ⚠️  生产环境未检测到 GTM 代码`);
      console.log('     可能原因:');
      console.log('     1. 代码尚未部署到生产环境');
      console.log('     2. 缓存问题，需要等待缓存更新');
      console.log('     3. 部署的代码版本不包含 GTM');
    }
    
    // 检查 noscript
    if (data.includes('googletagmanager.com/ns.html')) {
      console.log('  ✅ 生产环境检测到 GTM noscript');
    } else {
      console.log('  ⚠️  生产环境未检测到 GTM noscript');
    }
    
    console.log('\n📝 验证建议:');
    console.log('  1. 如果代码未部署，请先部署到生产环境');
    console.log('  2. 部署后等待 5-10 分钟让 GTM 检测工具更新');
    console.log('  3. 在 GTM 后台使用"预览模式"进行实时验证');
    console.log('  4. 查看页面源代码确认 GTM 代码存在');
  });
});

req.on('error', (error) => {
  console.log(`  ⚠️  无法连接到生产环境: ${error.message}`);
  console.log('     这可能是正常的，如果网站尚未部署');
});

req.setTimeout(10000, () => {
  req.destroy();
  console.log('  ⚠️  连接超时');
});

req.end();

console.log('\n💡 手动验证步骤:');
console.log('  1. 访问 https://www.zlseren.online');
console.log('  2. 查看页面源代码 (Ctrl+U 或 Cmd+Option+U)');
console.log('  3. 在 <head> 中查找 GTM-TCGJHBJ5');
console.log('  4. 在 <body> 开始位置查找 noscript iframe');
console.log('  5. 打开浏览器控制台，输入: window.dataLayer');
console.log('  6. 应该看到 dataLayer 数组');

#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证所有必需的环境变量和配置是否已准备就绪
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始部署前检查...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENROUTER_API_KEY',
];

const optionalEnvVars = [
  'CREEM_API_KEY',
  'CREEM_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'SITE_URL',
  'SITE_NAME',
];

// 检查文件是否存在
const requiredFiles = [
  'app/layout.tsx',
  'app/sitemap.xml/route.ts',
  'public/robots.txt',
  'public/sitemap.xml',
];

console.log('📁 检查必需文件...');
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    errors.push(`缺少文件: ${file}`);
    hasErrors = true;
  }
});

console.log('\n🔐 检查环境变量...');
console.log('注意: 此检查基于 .env.local 文件，生产环境需要在部署平台配置环境变量\n');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ⚠️  ${varName} - 未在 .env.local 中找到（生产环境需要在部署平台配置）`);
      warnings.push(`环境变量 ${varName} 需要在生产环境配置`);
    }
  });
  
  optionalEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName} (可选)`);
    } else {
      console.log(`  ⚠️  ${varName} (可选) - 未配置`);
    }
  });
} else {
  console.log('  ⚠️  .env.local 文件不存在');
  console.log('  提示: 生产环境需要在部署平台（如 Vercel）配置环境变量');
}

console.log('\n📦 检查 package.json...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  console.log(`  ✅ 项目名称: ${packageJson.name}`);
  console.log(`  ✅ 版本: ${packageJson.version}`);
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`  ✅ 构建命令: ${packageJson.scripts.build}`);
  }
}

console.log('\n🔍 检查 GTM 和 Analytics...');
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  
  if (layoutContent.includes('GTM-TCGJHBJ5')) {
    console.log('  ✅ Google Tag Manager 已配置');
  } else {
    console.log('  ⚠️  Google Tag Manager 未找到');
    warnings.push('Google Tag Manager 可能未正确配置');
  }
  
  if (layoutContent.includes('5gzv0pKH6Z/18hLrdcc42Q')) {
    console.log('  ✅ Ahrefs Analytics 已配置');
  } else {
    console.log('  ⚠️  Ahrefs Analytics 未找到');
    warnings.push('Ahrefs Analytics 可能未正确配置');
  }
}

console.log('\n📊 检查结果总结:');
if (errors.length > 0) {
  console.log('\n❌ 发现错误:');
  errors.forEach(error => console.log(`  - ${error}`));
  hasErrors = true;
}

if (warnings.length > 0) {
  console.log('\n⚠️  警告:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
}

if (!hasErrors) {
  console.log('\n✅ 基本检查通过！');
  console.log('\n📝 下一步:');
  console.log('  1. 确保所有环境变量已在部署平台配置');
  console.log('  2. 检查 Google OAuth 重定向 URI 已更新为生产环境 URL');
  console.log('  3. 运行 npm run build 测试构建');
  console.log('  4. 部署到生产环境');
  console.log('\n📖 详细部署指南请查看: DEPLOYMENT.md');
  process.exit(0);
} else {
  console.log('\n❌ 检查失败，请修复上述错误后重试');
  process.exit(1);
}

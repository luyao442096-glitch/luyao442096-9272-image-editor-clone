#!/usr/bin/env node

/**
 * 配置检查脚本
 * 检查 Supabase 和 Google OAuth 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查配置...\n');

// 检查 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.local.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local 文件不存在');
  console.log('📝 请创建 .env.local 文件并添加以下配置：\n');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('OPENROUTER_API_KEY=your_openrouter_api_key\n');
  process.exit(1);
}

// 读取环境变量
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// 检查必需的变量
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalVars = [
  'OPENROUTER_API_KEY',
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 环境变量检查：\n');

// 检查必需变量
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (!value || value.includes('your_') || value.includes('example')) {
    console.log(`❌ ${varName}: 未配置或使用示例值`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: 已配置`);
  }
});

// 检查可选变量
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (!value || value.includes('your_') || value.includes('example')) {
    console.log(`⚠️  ${varName}: 未配置（可选）`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: 已配置`);
  }
});

// 验证 Supabase URL 格式
if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log(`\n⚠️  NEXT_PUBLIC_SUPABASE_URL 格式可能不正确`);
    console.log(`   期望格式: https://xxxxx.supabase.co`);
    hasWarnings = true;
  }
}

// 验证 Supabase Key 格式
if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Check if it's a valid JWT format (starts with eyJ) or a valid key
  if (!supabaseKey.startsWith('eyJ') && supabaseKey.length < 50) {
    console.log(`\n⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY 格式可能不正确`);
    console.log(`   通常以 'eyJ' 开头，长度应该较长`);
    hasWarnings = true;
  } else if (!supabaseKey.startsWith('eyJ') && supabaseKey.length >= 50) {
    // Might be a different format, but still valid
    console.log(`\nℹ️  NEXT_PUBLIC_SUPABASE_ANON_KEY 格式检查已跳过`);
    console.log(`   如果遇到认证问题，请确认 key 是否正确`);
  }
}

console.log('\n📚 配置指南：');
console.log('   详细配置步骤请查看: SUPABASE_SETUP.md\n');

if (hasErrors) {
  console.log('❌ 配置检查失败，请修复上述错误后重试');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  配置检查完成，但有一些警告');
  process.exit(0);
} else {
  console.log('✅ 配置检查通过！');
  console.log('\n💡 下一步：');
  console.log('   1. 确保已在 Supabase 中配置 Google OAuth 提供商');
  console.log('   2. 确保已在 Google Cloud Console 中配置 OAuth 凭据');
  console.log('   3. 重启开发服务器: npm run dev');
  process.exit(0);
}

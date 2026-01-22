#!/usr/bin/env node

/**
 * 检查生产环境的 sitemap.xml 是否已更新
 */

const https = require('https');

const PRODUCTION_SITEMAP_URL = 'https://www.zlseren.online/sitemap.xml';

console.log('🔍 检查生产环境的 sitemap.xml...\n');
console.log(`正在检查: ${PRODUCTION_SITEMAP_URL}\n`);

const url = new URL(PRODUCTION_SITEMAP_URL);
const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'Sitemap-Checker'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 生产环境 sitemap.xml 内容检查:\n');
    
    // 检查是否包含无效值
    if (data.includes('changefreq>quarterly</changefreq>')) {
      console.log('❌ 发现无效值: quarterly');
      console.log('   生产环境的 sitemap.xml 尚未更新！');
      console.log('\n💡 解决方案:');
      console.log('   1. 确保代码已推送到远程仓库: git push');
      console.log('   2. 等待部署完成（如果使用自动部署）');
      console.log('   3. 或手动部署到生产环境');
    } else {
      console.log('✅ 未发现无效值 "quarterly"');
    }
    
    // 检查是否包含修复后的值
    if (data.includes('changefreq>yearly</changefreq>')) {
      console.log('✅ 发现修复后的值: yearly');
    }
    
    // 统计 changefreq 值
    const changefreqMatches = data.match(/<changefreq>([^<]+)<\/changefreq>/g);
    if (changefreqMatches) {
      console.log(`\n📊 找到 ${changefreqMatches.length} 个 changefreq 标记`);
      
      const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      const invalidValues = [];
      
      changefreqMatches.forEach(match => {
        const value = match.replace(/<\/?changefreq>/g, '');
        if (!validValues.includes(value)) {
          invalidValues.push(value);
        }
      });
      
      if (invalidValues.length > 0) {
        console.log(`\n❌ 发现 ${invalidValues.length} 个无效值:`);
        invalidValues.forEach(val => console.log(`   - "${val}"`));
      } else {
        console.log('✅ 所有 changefreq 值都是有效的！');
      }
    }
    
    // 检查行号（对应 Google Search Console 的错误）
    const lines = data.split('\n');
    console.log(`\n📝 总行数: ${lines.length}`);
    
    // 检查第 54 和 60 行（Google 报告的错误行号）
    if (lines.length >= 60) {
      console.log('\n🔍 检查 Google 报告的错误行:');
      [54, 60].forEach(lineNum => {
        const line = lines[lineNum - 1]; // 数组索引从 0 开始
        if (line && line.includes('changefreq')) {
          console.log(`   第 ${lineNum} 行: ${line.trim()}`);
          if (line.includes('quarterly')) {
            console.log(`   ❌ 此行仍包含无效值 "quarterly"`);
          } else {
            console.log(`   ✅ 此行已修复`);
          }
        }
      });
    }
    
    console.log('\n💡 如果生产环境已更新但仍显示错误:');
    console.log('   1. 在 Google Search Console 中重新提交 sitemap');
    console.log('   2. 等待 Google 重新抓取（通常需要几小时到几天）');
    console.log('   3. 清除浏览器缓存后重新检查');
  });
});

req.on('error', (error) => {
  console.log(`❌ 无法连接到生产环境: ${error.message}`);
  console.log('\n💡 可能的原因:');
  console.log('   1. 网站尚未部署');
  console.log('   2. 网络连接问题');
  console.log('   3. 网站暂时不可用');
});

req.setTimeout(10000, () => {
  req.destroy();
  console.log('⏱️  连接超时');
});

req.end();

// 按邮箱查找用户的测试积分充值脚本
// 使用说明：
// 1. 确保网站已经在本地运行（npm run dev）或已部署到生产环境
// 2. 打开浏览器，访问网站
// 3. 按F12打开开发者工具，切换到Console标签
// 4. 复制以下代码到Console中运行

// 测试积分充值函数
async function testCreditsAddition(plan, targetEmail = "luyao442096@gmail.com") {
    // 根据选择的套餐设置积分数量和产品ID
    const planConfig = {
        "basic": { credits: 2400, productId: "prod_2U14J3cNweMcQPQaQiTHTt" },
        "pro": { credits: 9600, productId: "prod_3GUDoBE0DSES3HGqYDC1S" },
        "max": { credits: 43200, productId: "prod_42aqCZ9KQG1nScBkhK6m10" }
    };
    
    const config = planConfig[plan] || planConfig.basic;
    
    console.log("🔍 正在发起测试请求...");
    console.log(`📋 测试计划: ${plan}`);
    console.log(`📈 预计增加积分: ${config.credits}`);
    console.log(`🎫 产品ID: ${config.productId}`);
    console.log(`📧 目标用户邮箱: ${targetEmail}`);
    
    try {
        // 调用测试API - 使用特殊参数指定目标用户邮箱
        const response = await fetch("/api/test-add-credits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...config,
                targetEmail: targetEmail  // 添加目标邮箱参数
            }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error("❌ 测试失败:", result.error);
            alert(`测试失败: ${result.error}`);
            return;
        }
        
        console.log("🎉 测试成功!");
        console.log(`📊 测试结果:`);
        console.log(`   用户: ${result.email}`);
        console.log(`   原积分: ${result.oldCredits}`);
        console.log(`   增加积分: ${result.creditsAdded}`);
        console.log(`   新积分: ${result.newCredits}`);
        console.log(`   产品ID: ${result.productId}`);
        
        alert(`测试成功！\n\n用户: ${result.email}\n原积分: ${result.oldCredits}\n增加积分: ${result.creditsAdded}\n新积分: ${result.newCredits}`);
        
        // 刷新页面以查看更新后的积分
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error("❌ 测试过程中发生错误:", error);
        alert(`测试过程中发生错误: ${error.message}`);
    }
}

// 快捷函数 - 自动使用目标邮箱
async function testBasicPlan() { await testCreditsAddition("basic", "luyao442096@gmail.com"); }
async function testProPlan() { await testCreditsAddition("pro", "luyao442096@gmail.com"); }
async function testMaxPlan() { await testCreditsAddition("max", "luyao442096@gmail.com"); }

console.log("🚀 按邮箱查找用户的测试积分充值脚本已加载");
console.log("\n使用以下命令测试不同套餐:");
console.log("1. 测试 Basic Plan (2400积分): testBasicPlan()");
console.log("2. 测试 Pro Plan (9600积分): testProPlan()");
console.log("3. 测试 Max Plan (43200积分): testMaxPlan()");
console.log("\n或者直接使用:");
console.log("testCreditsAddition('basic', '你的邮箱')");
console.log("testCreditsAddition('pro', '你的邮箱')");
console.log("testCreditsAddition('max', '你的邮箱')");
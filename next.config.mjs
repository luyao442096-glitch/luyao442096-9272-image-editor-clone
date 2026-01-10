/** @type {import('next').NextConfig} */
const nextConfig = {
  // 新增/修改env配置，关闭调试模式
  env: {
    DEBUG_MODE: "false"
  },
  // 保留文件中原有的其他配置（如reactStrictMode、images等）
};

export default nextConfig;

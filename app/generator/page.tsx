import { Metadata } from "next"
import type React from "react"

// 生成器页面特定的元数据
export const metadata: Metadata = {
  title: "生成器 - Zlseren AI 智能助手",
  description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
  keywords: [
    "AI 图像生成器",
    "Zlseren 生成器",
    "图像到图像",
    "文本到图像",
    "AI 图像编辑",
    "图像生成",
    "AI 智能助手"
  ],
  openGraph: {
    title: "生成器 - Zlseren AI 智能助手",
    description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
    url: "https://www.zlseren.online/generator"
  },
  twitter: {
    title: "生成器 - Zlseren AI 智能助手",
    description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
  },
  alternates: {
    canonical: "https://www.zlseren.online/generator"
  }
}

// 导入客户端组件
import GeneratorContent from './GeneratorContent'

// 默认导出页面组件
export default function GeneratorPage() {
  return <GeneratorContent />
}

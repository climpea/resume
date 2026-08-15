/**
 * 个人主页内容 — 来自简历
 *
 * 全站唯一数据源：各组件直接消费本文件的类型化数据。
 * 修改文案、经历、项目时只需编辑本文件。
 */

export interface Profile {
  nameZh: string
  nameEn: string
  title: string
  tagline: string
  subtitle: string
  location: string
  phone: string
  email: string
  links: {
    github: string
    linkedin: string
    blog: string
  }
}

export const profile: Profile = {
  nameZh: '李永慧',
  nameEn: 'Yonghui Li',
  title: '前端工程师 · 多端 / 低代码 / AI',
  tagline: '把复杂的业务，收敛成上线可用的产品。',
  subtitle: '多端统一、低代码与 AI 应用的三线落地经验，面向业务给出可执行方案并闭环上线。',
  location: '北京',
  phone: '15750398278',
  email: 'lyh2830@163.com',
  links: {
    github: 'https://github.com/climpea',
    linkedin: '',
    blog: '',
  },
}

/** 走马灯关键词 */
export const marquee: string[] = [
  '多端统一',
  'R2X',
  '鸿蒙适配',
  '低代码',
  '飞搭',
  'AI 助手',
  'LangChain',
  '微前端',
  '性能优化',
  '小程序',
  'Midway BFF',
  '组件沉淀',
  'AEM 埋点',
  'EventSource',
]

/** GitHub 模块配置（lib/github.ts 实时拉取 + README 分析） */
export interface GithubConfig {
  username: string
  excludeForks: boolean
  excludeArchived: boolean
  exclude: string[]
  maxRepos: number
  featured: string[]
  sort?: 'updated' | 'stars'
  /** 一句话简介：优先用这里手写的（最准），没有则自动从 README 提取 */
  summaries: Record<string, string>
}

export const github: GithubConfig = {
  username: 'climpea', // 留空则自动从 profile.links.github 解析
  excludeForks: true, // 排除 fork 仓库
  excludeArchived: true, // 排除已归档仓库
  exclude: ['resume'], // 排除指定仓库名（如当前简历仓库本身）
  maxRepos: 20, // 最多展示数量
  featured: [], // 需要置顶的仓库名（可选，按顺序排最前）
  // 适合 README 缺失或 README 是模板文案的仓库：
  // summaries: { 'focus_training': '一句话说明这个项目干什么' },
  summaries: {},
}

/**
 * 雨滴粒子配置（lib/droplets.ts 消费，改这里即可调效果，无需改代码）。
 * 语义来自粒子引擎：
 *  - intensity：雨量（0-1.25，越高越多；<0.3 时主雨层基本关闭）
 *  - scale：雨滴图案尺寸（越大雨滴越小）
 *  - dropWidth / dropLength：雨滴粗细 / 长短
 *  - staticDrops：静态小水珠数量
 *  - wiggle / fallSpeed / speed：摆动幅度与下落速度（越小越安静）
 *  - refraction / blur / vignette：折射与背景模糊强度（越小越不抢注意力）
 */
export const particles = {
  intensity: 0.3, // 少雨：主雨层淡出，保留次层细雨
  speed: 0.8,
  scale: 0.62, // 更小的雨滴图案
  dropWidth: 0.75, // 更细
  dropLength: 0.9, // 更短
  refraction: 0.15, // 折射更弱
  blur: 0.08, // 背景模糊更轻
  vignette: 0.04,
  fallSpeed: 0.75, // 下落更慢
  wiggle: 0.6, // 摆动更小
  staticDrops: 0.15, // 静态小水珠减半
}

export interface Stat {
  value: string
  label: string
  detail: string
}

/** 关键成果 — 用数字讲清楚做过什么。 */
export const stats: Stat[] = [
  { value: '4', label: '端同构交付', detail: 'PC / Android / iOS / 鸿蒙' },
  { value: '~4×', label: '页面适配提速', detail: '10+ 页面由约 2 天降至半天内' },
  { value: '-90%', label: '上传接口耗时', detail: '大图压缩 + 性能优化' },
  { value: '3', label: '落地方向', detail: '多端统一 / 低代码 / AI 应用' },
]

export const about = {
  lead: '我不只做页面——拆解业务，收敛方案，推动落地，直到它稳定上线。',
  body: '习惯从业务场景出发收敛方案：拆清多端差异、低代码边界与定制开发范围，并推动可复用组件与物料沉淀，稳定支撑多业务线迭代。主动使用 AI 工具提升研发与回归效率，同时关注方案可维护性与线上稳定性。',
}

export interface SkillGroup {
  title: string
  items: string[]
}

/** 技能按方向分组，方便招聘方快速对号入座。 */
export const skillGroups: SkillGroup[] = [
  {
    title: '基础',
    items: ['HTML / CSS / JavaScript', 'ES6+', 'React / Redux'],
  },
  {
    title: '多端',
    items: ['R2X 多端', '支付宝小程序', '鸿蒙适配'],
  },
  {
    title: '工程与架构',
    items: ['qiankun 微前端', 'LowCode Engine / 飞搭', 'Midway BFF', '性能优化', 'AEM 埋点'],
  },
  {
    title: 'AI 应用',
    items: ['LangChain', 'EventSource 流式输出'],
  },
]

export interface ExperienceItem {
  period: string
  role: string
  org: string
  points: string[]
}

export const experience: ExperienceItem[] = [
  {
    period: '2025.05 — 至今',
    role: 'Web 前端工程师',
    org: '北京三快科技有限公司（纬致芯创科技）',
    points: [
      '基于 R2X 一套代码分端构建，覆盖 PC / Android / iOS / 鸿蒙，10+ 页面适配耗时由约 2 天降至最多半天；',
      '参与点金、闪购一站式、涨单宝等商家端应用，支撑中小商家 APP 矩阵与营销 / 资金类 PC 业务持续迭代；',
      '在鸿蒙侧基于自研 Skill 完成页面级快速适配，沉淀跨端复用方案。',
    ],
  },
  {
    period: '2021.11 — 2025.05',
    role: 'Web 前端工程师',
    org: '浙江飞猪网络技术有限公司（易宝软件）',
    points: [
      '负责租车、接送机、汽车票等业务的中后台与 H5 / 小程序多端页面；',
      '主导汽车票低代码建设与小二后台重构：基于飞搭（LowCode Engine）完成 CRS 相关功能建设，沉淀可复用组件 / 物料，缩短中后台交付周期；',
      '参与机票运营后台 AI 助手：EventSource 流式输出，Midway BFF 聚合 LangChain 与私域知识库，形成可复用的 AI 接入范式；',
      '完成环球影城支付宝小程序订单 / 退款页（多票种），兼容支付宝 / 淘宝 / 高德多端；大图上传压缩使接口耗时下降 90%，并接入 AEM 埋点提升关键行为可观测性。',
    ],
  },
  {
    period: '2017.09 — 2021.06',
    role: '软件工程 · 本科',
    org: '天津商业大学',
    points: ['系统学习软件工程与前端相关基础，为后续多端与工程化实践打下基础。'],
  },
]

export interface Project {
  name: string
  org: string
  desc: string
  tech: string[]
  href: string
}

export const projects: Project[] = [
  {
    name: '中小商家 APP 矩阵多端统一',
    org: '美团',
    desc: 'R2X 一套代码分端构建，鸿蒙侧复用 Skill 做页面级适配，完成 PC / Android / iOS / 鸿蒙同构交付。',
    tech: ['R2X', '鸿蒙适配', '多端同构'],
    href: '#',
  },
  {
    name: '机票运营后台 AI 助手',
    org: '飞猪',
    desc: '对话式助手前端与链路联调：EventSource 流式输出，Midway BFF 聚合 LangChain 大模型与私域知识库。',
    tech: ['EventSource', 'Midway BFF', 'LangChain'],
    href: '#',
  },
  {
    name: '汽车票小二后台低代码重构',
    org: '飞猪',
    desc: '基于飞搭（LowCode Engine）主导接入方案与旧系统重构，完成 CRS 相关功能建设，沉淀可复用组件与物料。',
    tech: ['LowCode Engine', '飞搭', '组件沉淀'],
    href: '#',
  },
  {
    name: '环球影城度假区小程序',
    org: '飞猪',
    desc: '支付宝小程序订单页、退款页（多票种）开发，兼容支付宝 / 淘宝 / 高德多端，保障活动链路稳定可用。',
    tech: ['支付宝小程序', '多端兼容'],
    href: '#',
  },
  {
    name: '租车商家 CRS 系统',
    org: '飞猪',
    desc: '封装公共与业务组件；大图上传前压缩使接口耗时下降 90%，并接入 AEM 埋点提升关键行为可观测性。',
    tech: ['组件化', '性能优化', 'AEM 埋点'],
    href: '#',
  },
]

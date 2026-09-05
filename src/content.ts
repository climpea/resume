/**
 * 个人主页内容 — 与个人简历 PDF 原文逐字同步（不改写、不归纳）
 *
 * 全站唯一数据源：各组件直接消费本文件的类型化数据。
 * 文案一律照搬简历原文；只清除了 PDF 文本提取产生的转义符（\( \) \~）。
 */

export interface Profile {
  nameZh: string
  nameEn: string
  title: string
  tagline: string
  subtitle: string
  location: string
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
  title: 'Web 前端工程师',
  tagline: '把复杂的业务，收敛成上线可用的产品。',
  subtitle: '覆盖出行（租车/机票/船票等）与商家（营销/商家管理）两大业务域，具备中后台PC、小程序（支付宝/淘宝/高德）、RN/鸿蒙等多端交付经验，独立全权负责多条业务线开发。',
  location: '北京',
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
  'AI 应用',
  '微前端',
  '性能优化',
  '小程序',
  '组件复用',
  'React 18',
  'TypeScript',
  'MobX',
  '阿里云百炼',
  'SSE 流式问答',
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
  /** 有完整描述的仓库跳过 README 拉取（省配额，默认 true） */
  skipReadmeWhenDescribed?: boolean
  /** 一句话简介：优先用这里手写的（最准），没有则自动从 README 提取 */
  summaries: Record<string, string>
}

export const github: GithubConfig = {
  username: 'climpea', // 留空则自动从 profile.links.github 解析
  excludeForks: true, // 排除 fork 仓库
  excludeArchived: true, // 排除已归档仓库
  exclude: [], // 排除指定仓库名（如不需要展示当前简历仓库时可加 'resume'）
  maxRepos: 20, // 最多展示数量
  featured: [], // 需要置顶的仓库名（可选，按顺序排最前）
  skipReadmeWhenDescribed: true, // 有完整描述（≥10 字）的仓库跳过 README 拉取，省配额
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
  { value: '4', label: '端同构交付', detail: 'R2X：PC / Android / iOS / 鸿蒙' },
  { value: '200+', label: '低代码页面', detail: '飞搭平台沉淀，开发周期 2 天 → 2 小时' },
  { value: '<1.5s', label: '商品集加载', detail: '请求拆分 + 并发控制（原 3-5 秒）' },
  { value: '90%', label: '组件复用率', detail: '环球影城 10+ 组件跨场景复用' },
]

export const about = {
  lead: '4年+前端经验，深耕React + TypeScript，具备HTML5/CSS3/JavaScript扎实基础，熟悉UmiJS/MobX/Ant Design及微前端架构',
  /** 自我评价 5 点 — 逐字照搬原文，逐条分行展示 */
  items: [
    '1. 4年+前端经验，深耕React + TypeScript，具备HTML5/CSS3/JavaScript扎实基础，熟悉UmiJS/MobX/Ant Design及微前端架构；',
    '2. 覆盖出行（租车/机票/船票等）与商家（营销/商家管理）两大业务域，具备中后台PC、小程序（支付宝/淘宝/高德）、RN/鸿蒙等多端交付经验，独立全权负责多条业务线开发；',
    '3. 注重工程化与复用，抽离公共组件10+个，沉淀低代码文档与脚手架，推动团队交付效率提升，曾获飞猪2024年度卓越进取奖；',
    '4. 积极拥抱AI提效，具备AI应用开发经验（RAG/SSE流式问答），善用AI编程工具链（Cursor/Trae/DeepSeekHarness）及自研浏览器插件辅助开发测试；',
    '5. 具备良好的业务理解与沟通协作能力，对新技术保持好奇心，乐于沉淀分享技术经验。',
  ],
}

export interface SkillGroup {
  title: string
  items: string[]
}

/** 技能特长 — 照搬简历原文条目。 */
export const skillGroups: SkillGroup[] = [
  {
    title: '技能特长',
    items: [
      '前端基础：熟练掌握HTML5/CSS3/JavaScript（ES6+），具备扎实的Web标准与语义化编码能力，熟练运用Flexbox/Grid布局及CSS预处理器。',
      'React生态：熟练掌握React18+TypeScript开发，具备UmiJS大型中后台项目经验，熟悉MobX状态管理（makeAutoObservable/computed/flow）及AntDesign组件库二次封装。',
      '微前端与跨端：具备qiankun微前端架构落地经验（应用接入、路由分发、沙箱隔离、跨应用通信）；了解ReactNative及美团自研R2x框架，具备跨端组件设计能力。',
      '性能优化：具备前端性能优化实战经验，包括虚拟列表（react-window）、请求拆分与并发控制、懒加载、骨架屏、缓存策略及内存泄漏防范。',
      'AI提效与AI应用：熟练使用vibeCoding/Curso/True辅助代码生成与重构，Catpaw（美团自研IDE）提升团队协作效率，DeepSeekHarness辅助方案设计；了解阿里云百炼RAG知识库与Agent智能体开发，具备SSE流式问答落地经验。',
      '服务端开发：了解Midway.jsNode.js框架，具备RESTfulAPI开发经验；了解JWT认证机制与RBAC权限模型，具备权限系统设计实践。',
      '低代码平台：具备低代码平台开发经验，了解Schema驱动渲染、物料组件封装及可视化编辑器实现原理。',
      '组件化与工程化：具备组件化架构设计能力，擅长封装高复用业务组件（卡片/列表/弹窗/统计等）。',
      '小程序开发：具备多端小程序开发经验，了解一码多端跨端方案（支付宝/高德/淘宝三端适配）。',
      '通用能力：具备组件化思维与性能优化意识，能独立完成复杂业务模块的设计与交付；熟悉Git协作流程。',
    ],
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
    period: '2025.05 — 2026.06',
    role: 'Web 前端工程师',
    org: '北京三快在线科技有限公司',
    points: [
      '研发工具建设：开发EditCookie浏览器插件实现跨窗口Cookie复制，解决手动修改域名的繁琐问题；开发MockAssistant浏览器插件，拦截目标接口返回Mock数据，替代Network面板手动override，提升本地开发效率。',
      '业务支撑与AI提效：负责营销魔方、资金联盟等重点商家项目PC端迭代；使用AIIDE及平台AI能力辅助开发与用例回归，降低旧框架维护成本。',
      '多端应用开发：面向中小商家APP矩阵与营销/资金类PC业务，负责点金、闪购一站式、张单宝等多产品线前端交付，支撑多业务线稳定迭代。',
      '跨端架构落地：基于内部R2X框架实现一套代码、分端打包，覆盖PC/Android/iOS/鸿蒙四端，降低多端重复建设成本；在鸿蒙适配中基于自研Skill能力完成页面快速适配，收敛端差异。',
    ],
  },
  {
    period: '2021.11 — 2025.05',
    role: 'Web 前端工程师',
    org: '浙江飞猪网络技术有限公司',
    points: [
      '中后台物料统一与复用：抽离公共组件形成内网依赖包（10+）个，支撑汽车票、租车、机票等多业务线复用，减少重复开发成本。',
      '低代码体系建设：沉淀低代码开发使用文档及踩坑经验文档，基于飞搭（LowCodeEngine）完成CRS功能开发与小二后台重构，提升中后台交付效率。',
      '工程化提效：实现内网脚手架，封装日常Git操作命令，统一团队开发流程与规范。',
      '业务负责人：独立全权负责租车、接送机、汽车票等业务线的需求评审、技术方案设计与开发交付。',
    ],
  },
  {
    period: '2017.09 — 2021.06',
    role: '软件工程 · 本科',
    org: '天津商业大学',
    points: [],
  },
]

export interface Project {
  name: string
  org: string
  desc: string
  /** 技术栈 — 照搬原文 */
  stack: string
  /** 项目职责 — 照搬原文逐条 */
  duties: string[]
  href: string
}

export const projects: Project[] = [
  {
    name: '营销魔方',
    org: '美团',
    desc: '“营销魔方”是面向到家业务（外卖、闪购、医药）商家的自助投广平台，帮助多门店重点商家创建商品推广计划，实现引流、提升点击率和成交率。',
    stack: 'React + TypeScript + MobX + axios',
    duties: [
      '负责闪购商品推广全链路开发，包括商品选择、预算设置、投放策略配置、计划创编与提交等核心流程。',
      '主导从“商品平铺”到“商品集推广”的功能升级，商家可按商品集批量圈选商品投流，批量圈品效率指数级提高。',
      '使用MobX管理创编页复杂状态（商品集、商品详情、策略配置、预算等），通过computed实现衍生数据自动更新，提升代码可维护性。',
      '针对商品集下大量商品（单集 200+ 商品）的加载场景，设计请求拆分与并发控制方案——按单次请求承载上限（如50个）拆分多批请求并发发出，结合Promise.all聚合数据，加载时间从3-5秒优化至<1.5秒，接口超时率下降 60%。',
    ],
    href: '#',
  },
  {
    name: '赏金联盟',
    org: '美团',
    desc: '“赏金联盟”是美团面向商家推出的用户互动营销平台，商家参与平台活动并设置配额与赏金区间，C端用户下单评价后可获赏金。',
    stack: 'React + TypeScript + MobX + axios + Roo（美团自研UI库）',
    duties: [
      'ActivityCard活动卡片组件：封装高度可配置的活动卡片，展示活动标题、时间、成交订单量、剩余报名人数、状态标签；根据活动状态（未开始/进行中/名额已满/已报名/已结束）动态渲染不同操作按钮；支持限时活动（含倒计时）和普通活动双模式渲染。',
      '活动提交确认弹窗：封装ActivityConfirmModal，报名信息二次确认展示配额与赏金区间，提交防重复点击，成功后自动刷新列表/卡片状态。',
      '首页限时活动Card、活动列表与详情页复用：主页仅展示部分满足条件活动，列表页按照一定优先级展示所有活动，详情页展示活动完整信息；通过策略模式抽离差异逻辑，主页、列表与详情共享卡片渲染，核心逻辑复用率达 85%。',
      '通用卡片组件：封装类似AntdCard的底层卡片组件，支持title、extra、cover、actions等插槽配置；统一首页限时活动和普通活动卡片风格，方便后续增加其它模块可复用。',
    ],
    href: '#',
  },
  {
    name: '机票运营后台AI助手',
    org: '飞猪',
    desc: '机票业务拥有数十个运营后台，入口多、学习成本高。我在新机票运营后台基座中主导开发了AI运营助手，基于阿里云百炼大模型服务平台构建RAG（检索增强生成）智能体，帮助运营同学快速查询功能说明和配置入口。',
    stack: 'UmiJS + React + Midway.js + 阿里云百炼 + EventSource(SSE) + Redis',
    duties: [
      '在百炼控制台创建知识库，上传 20+ 篇运营文档，平台自动完成文档解析、智能切片和向量化存储；通过调试工具持续优化检索策略。',
      '基于百炼Agent1.0创建智能体应用，选择通义千问-Max模型，配置系统提示词定义角色与回答规范，将知识库挂载为工具实现RAG问答。',
      'Midway服务端通过百炼兼容OpenAI协议的API调用智能体，支持多轮对话上下文管理（Redis存储会话状态）。',
      '基于SSE协议实现流式输出，前端EventSource接收并渲染“打字机”效果；支持断连自动重连和连接中断时自动中止下游调用，避免费用浪费。',
      '前端AI对话组件：基于UmiJS开发全局AI对话抽屉，封装useSSEHook管理连接生命周期，支持消息列表、流式追加、加载状态、停止生成等功能。',
    ],
    href: '#',
  },
  {
    name: '环球影城度假区小程序',
    org: '飞猪·支付宝链路',
    desc: '环球影城官方小程序覆盖支付宝、高德地图、淘宝三大平台，为用户提供购票、酒店预订、年卡购买等一站式服务。',
    stack: '支付宝小程序开发者工具 + 多端编译框架（一码多端） + 小程序原生组件',
    duties: [
      '基于多端编译框架，通过条件编译和平台适配层，实现一套代码同时构建支付宝、高德地图、淘宝三个小程序，支撑酒店、门票、套餐、年卡四大业务场景。',
      '采用配置驱动设计，抽取公共信息模块（状态栏、温馨提示、凭证卡片），通过状态机管理订单状态流转，一套组件支持酒店/门票/套餐/年卡四种订单类型。',
      '从两个页面中提取 10+ 个可复用组件，通过Props配置实现不同业务场景适配，组件复用率达 90%。',
    ],
    href: '#',
  },
  {
    name: '飞搭低代码中后台',
    org: '飞猪',
    desc: '主导设计并开发低代码后台搭建平台，通过可视化拖拽配置生成后台页面，结合qiankun微前端架构实现与公司现有中后台系统的无缝集成，将页面平均开发周期从2天缩短至2小时，已生成200+页面，接入5个外部系统。',
    stack: 'UmiJS + React + LowCode Engine + Midway.js + Redis + qiankun + Ant Design',
    duties: [
      '采用UmiJS + qiankun构建微前端基座，Midway.js + Redis搭建服务端与缓存层，实现前后端分离。',
      '基于LowCode Engine二次封装，设计Schema2.0协议，接入AntDesign通用物料组件，实现可视化拖拽编辑与实时预览。',
      'UmiJS提供的qiankun插件接入子应用，解决样式隔离、JS沙箱、路由同步等核心问题。',
      '基于Midway.js编写RESTfulAPI，Redis实现分布式锁防止编辑冲突。',
      '实现累计创建50+项目、200+页面，研发效能提升 60% 以上。',
    ],
    href: '#',
  },
  {
    name: '租车运营后台',
    org: '飞猪',
    desc: '租车运营后台是面向商家的综合性管理平台，涵盖车辆、车型、商家入驻、权限和系统消息模版等核心业务模块。',
    stack: 'UmiJS + React + Ant Design + @umijs/plugin-access',
    duties: [
      '设计RBAC权限模型，覆盖路由权限、按钮权限、数据权限三个维度，支持多种角色、50+权限点的精细化管控。',
      '利用UmiJS（@）umijs/plugin- access插件，通过getInitialState实现页面刷新即更新权限，无需用户重新登录。',
      '封装自定义HookusePermission，支持传入权限key控制按钮的visible，实现细粒度的操作权限管控。',
      '支撑2000+商家、3000+日均活跃用户，权限变更生效时间从30秒（重新登录）优化至<1秒（刷新即更新），系统上线后零权限安全事故。',
    ],
    href: '#',
  },
]

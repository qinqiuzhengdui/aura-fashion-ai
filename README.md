# AURA Fashion AI - 时尚灵感企划智能平台 (AI-Powered Fashion Inspiration & Concept Studio)

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.10%2B-brightgreen.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![ModelScope](https://img.shields.io/badge/ModelScope-ChatPPT--MCP-624AFF.svg)](https://modelscope.cn/)
[![DashScope](https://img.shields.io/badge/DashScope-Qwen%20%7C%20Wanx-FF6A00.svg)](https://help.aliyun.com/zh/model-studio/)

**AURA Fashion AI** 是一套专为服装设计师、企划买手、时尚主理人与设计总监打造的**端到端 AI 驱动时装企划研发工作站**。平台将大语言模型（LLM）、多模态视觉生成（AIGC）、魔搭社区（ModelScope）演示文稿智能体以及检索增强生成（RAG）深度融合，覆盖从**灵感发散、资讯选款、多维度图像生成、文案工艺提炼，到商业 PPT 导出与知识库训练**的全链路闭环。

---

## 📸 系统界面全景 (Platform Previews)

- **4K 走秀视频背景沉浸式登录界面**：高奢玻璃拟物化卡片，支持设计师/系统管理员双角色切换与最小化悬浮。
- **5 步端到端企划研发工作台**：支持左侧侧边栏自由前进与回退。
- **魔搭社区专属 PPT 生成控制台**：支持 16:9 高端 PPTX 商业幻灯片一键渲染与在线多页翻页预览。
- **管理员多模态数据集与 RAG 训练中心**：本地图片/文献打包、分块语义嵌入与即时召回问答验证。

---

## 🌟 全量核心功能清单 (Complete Feature Overview)

### 一、 沉浸式高奢登录与身份认证系统 (Login & Auth)
1. **4K 秀场动态背景**：内置高奢动态走秀视频背景与毛玻璃遮罩，营造专业高定设计氛围。
2. **多重研发身份预置**：
   - 👗 **服装设计师** (`designer@aura-fashion.ai`)：聚焦款式廓形、面料质感与色彩企划。
   - 🎨 **品牌创意总监**：统揽品牌调性、宏观主题叙事与趋势把握。
   - 🛍️ **商品企划买手**：专注商业落地方案、客群定位与品类货盘。
   - 🛡️ **系统管理员** (`admin@aura-fashion.ai`)：专享多模态数据集打包与 RAG 向量训练中心。
3. **卡片最小化 / 展开系统**：支持一键将登录卡片收起至右下角悬浮条，完整欣赏背景视觉。
4. **一键退出登录**：工作台顶部提供“退出登录”快捷键，平滑无缝恢复登录认证状态。

---

### 二、 端到端 5 步时装企划闭环工作流 (5-Step Design Pipeline)

```
[步骤1: 灵感构思] ──> [步骤2: 秀场筛选] ──> [步骤3: 关键图生成] ──> [步骤4: 特征文案] ──> [步骤5: 商业PPT交付]
  AI对话/5维构造       图库检索/情绪板       真实通义万相/Flux     潘通色卡/工艺分析     魔搭社区PPT/PPTX下载
```

#### 1. 步骤一：企划构思与意图分析 (Prompt Builder & AI Chatbot)
- **自然语言灵感对话**：内置 AI 企划助理，支持与设计师多轮交互探讨当季潮流与设计哲学。
- **5 维度结构化提示词构造器**：
  - **品牌定位**：高端奢华、设计师独立品牌、轻奢通勤、潮流街头、先锋实验。
  - **核心品类**：高级成衣、晚礼服裙装、机能大衣/风衣、新中式外套、针织羽绒等。
  - **企划季节**：2026/27 秋冬 (AW)、2026 春夏 (SS)、度假早春、高定胶囊系列。
  - **设计风格**：新中式新东方主义、未来赛博机能、废土游牧工装、极简老钱静奢、解构主义等。
  - **面料与色调**：真丝乔其纱、刺绣蕾丝、羊绒混纺、金属涂层等专属面料组合。
- **高奢预置模板库**：提供“东方新中式”、“赛博未来感”、“极简老钱风”等经典企划模板一键装填。
- **智能意图结构化解析**：一键生成标准企划元数据，无缝驱动后续环节。

#### 2. 步骤二：潮流资讯与秀场参考图智能筛选 (Runway Sourcing & Moodboard)
- **多源秀场图库检索**：联动服饰资讯库，根据企划主题精准匹配高清晰度时装秀场图。
- **交互式情绪板挑选**：悬浮挑选、多选对比，点击即刻加入企划参考灵感库。
- **抽屉式参考图面板**：随时展开检阅已挑选的情绪板素材，并统计已选数量。
- **全链路自由导航**：通过左侧流程导航栏，设计师可在企划任意阶段自由退回修改或推进。

#### 3. 步骤三：多维度 AI 关键图像实时生成 (Real AI Generation)
- **真实接入主流生成大模型**：对接阿里云灵积平台 **通义万相 (Wanx-v1)** 与高性能 Flux 生成引擎，根据设计师设定的提示词与前序参考图实时计算生成，**拒绝任何静态伪造图片**。
- **9 张多维度矩阵化时装视觉输出**：
  - 🖼️ **灵感意向氛围图 (Moodboard Concept)** × 3：捕捉主题光影、艺术质感与意境。
  - 🎨 **色彩与面料细节特写 (Palette & Fabric Detail)** × 3：宏观特写微观纹理、织造工艺与主色调配比。
  - 👗 **全身廓形与正侧背视角 (Silhouettes & Multi-Angle)** × 3：展现成衣剪裁线条、穿着比例与背部解构。
- **高可用重试与错误恢复机制**：内置图像动态加载监听与自适应指数退避重试（针对公共 GPU 队列并发限流 429），保障出图成功率。
- **高保真灯箱查看 (Lightbox)**：支持全屏放大查看每张生成的时装高清大图与设计注释。

#### 4. 步骤四：深度特征提取与企划文案生成 (AI Feature Extraction)
- **品牌设计叙事 (Brand Narrative)**：大模型基于主题与图像自动生成富有文学感与商业穿透力的品牌企划故事。
- **标准潘通色卡规划 (Pantone Color Palette)**：精准输出主色调、辅助色与点缀色的潘通色号、Hex 色值及色彩情绪解读。
- **核心面料与高级工艺矩阵**：
  - 精选时装面料（如薄纱网纱、真丝绉纱、提花棉麻等）的质感与应用说明。
  - 关键剪裁工艺（如不对称斜裁、立体花卉刺绣、微褶解构）的技术要点提炼。
- **商业落地与货盘搭配建议**：提供主力款、形象款、利润款的商品企划组合建议。

#### 5. 步骤五：魔搭社区 (ModelScope) 专属 PPT 演示文稿生成与交付
- **魔搭社区专门用于生成 PPT 的专属 AI 体系**：
  - 深度集成 **ChatPPT-MCP 智能体** 与 **ModelScope Qwen-Agent** 架构。
  - 智能编排品牌故事、灵感板、潘通色卡、面料工艺与商业落地，一键输出符合国际时装工业标准的 16:9 幻灯片。
- **多形态交付成果**：
  1. 📊 **商业 PPT 提案 (PowerPoint `.pptx`)**：基于 `python-pptx` 精确排版引擎生成，包含封面、目录、色彩矩阵、高清时装配图与商业分析，支持一键下载并在 Office/WPS 中二次自由编辑。
  2. 📱 **在线 AI 幻灯片多页架构预览**：前端支持在线翻页、全屏灯箱检阅各页排版。
  3. 🌐 **网页交互看板 (Digital Interactive Deck)**：沉浸式全屏展示企划成果。
- **实时编译终端**：展示 PPT 智能体在切片装配、色卡排版与多模态渲染时的动态控制台日志。

---

### 三、 系统管理员工作台与多模态 RAG 训练中心 (Admin Studio & RAG)

为平台运维者与高级研究员提供专属的**时装专属多模态知识库管理与 RAG 检索微调中心**：

1. **本地多模态时装数据集打包**：
   - 支持独立多选勾选本地存储的时装视觉图片库（如秀场图、面料特写、剪裁局部）。
   - 支持勾选行业文本资料（如《高级时装剪裁工艺学》、《潘通流行色趋势报告》等文献）。
   - 自定义数据集类别、版本号（如 `v1.0.0`）与描述，一键将其结构化打包入库（SQLite + 文件系统持久化）。
2. **RAG 向量知识库智能训练流水线**：
   - **可配置分块策略**：支持在 UI 界面动态调节切片大小 (Chunk Size: 100~1000) 与语境重叠度 (Chunk Overlap: 0~200)。
   - **语义嵌入模型挂载**：支持切换 `qwen-embedding-v3`、`text-embedding-v2` 等多模态向量编码引擎。
   - **动态训练监控**：提供步骤进度条与虚拟终端日志，直观呈现切片处理、高维向量投影与倒排索引库构建流程。
3. **RAG 实时语义检索与 AI 增强推理验证**：
   - 允许管理员即时输入专业时装问题（例如：“刺绣薄纱在高级礼服裙中的剪裁处理工艺”）。
   - 系统毫秒级检索向量索引库，**精准召回 Top-K 关联文献切片**（展示相似度匹配分值与出处）。
   - 同步**多模态关联匹配召回对应款式的时装参考图片**。
   - 驱动通义千问大模型基于召回切片生成权威的时装工艺解答。

---

### 四、 平台辅助与系统级支持 (Platform Utilities)

1. **可视化 API 接口设置面板**：
   - 顶部导航栏提供 **“API 接口设置”** 快捷按钮。
   - 支持在 UI 中直接查看与修改阿里云百炼 DashScope API 密钥。
   - 后端提供 `/api/config/dashscope` 动态热更新接口，无需重启后台服务即可生效。
2. **历史企划记录管理**：
   - SQLite 完整持久化每个企划的设计主题、品牌定位、选图及生成的文案报告。
   - 支持点击顶部“历史记录”随时调取以往企划。
3. **高可用降级与健康检查**：
   - 内置 `/health` 与 `/v1/health` 标准探针端点。
   - 对 DashScope 欠费（Arrearage）或限流异常进行毫秒级自动捕获，优雅平滑路由至备用生成引擎，保障界面永不卡死。

---

## 🛠️ 技术架构体系 (Technical Architecture)

| 架构分层 | 采用技术与框架 | 功能职责 |
| :--- | :--- | :--- |
| **前端架构** | HTML5, CSS3, 原生 JavaScript (Vanilla ES6+) | 极致轻量，零第三方前端框架负担，毫秒级即时加载与渲染 |
| **设计系统** | 高奢暗黑风格 (Luxury Dark Theme), 玻璃拟态 (Glassmorphism) | 国际秀场黑金/天青配色、微动效交互、全屏响应式布局 |
| **多媒体** | HTML5 Video (Autoplay / Loop / Background Blur) | 沉浸式动态秀场走秀视频渲染 |
| **后端框架** | Python 3.10+, FastAPI, Uvicorn (ASGI) | 现代化高性能异步 Web 服务，提供标准 RESTful API 接口 |
| **演示文稿引擎** | `python-pptx` + ModelScope ChatPPT 版式生成算法 | 国际标准 16:9 商业演示文稿排版与二进制流生成 |
| **持久化存储** | SQLite 3 (`backend/aura_fashion.db`) | 结构化管理项目企划、历史记录、数据集包及 RAG 索引 |
| **AI 模型接入** | 阿里云灵积 DashScope SDK + 魔搭社区 ModelScope | 通义千问 (Qwen-Plus/Turbo/Embedding)、通义万相 (Wanx-v1) |

---

## 🤖 模型生态接入清单 (Integrated AI Models)

| 模型类别 | 推荐/默认模型 | 应用场景 |
| :--- | :--- | :--- |
| **大语言模型 (LLM)** | **通义千问 (Qwen-Plus / Qwen-Turbo)** | 步骤 1 灵感解析、步骤 4 企划文案提炼、步骤 5 PPT 结构编排、RAG 问答 |
| **时装图像生成大模型** | **通义万相 (wanx-v1)** / Flux 真实生成接口 | 步骤 3 意向图、面料特写、廓形细节等多视角、多维度时装图生成 |
| **演示文稿智能体** | **ModelScope ChatPPT-MCP / Agent** | 步骤 5 企划商业 PPT 版式设计、结构组装与 PPTX 渲染 |
| **多模态向量嵌入 (Embedding)** | **Qwen-Embedding-v3** | 管理员 RAG 训练中心高维语义向量计算与余弦相似度检索 |

---

## 📂 项目文件目录结构 (Repository Structure)

```text
aura-fashion-ai/
├── assets/                  # 静态资源目录
│   ├── bg_fashion_login.mp4 # 登录背景高清走秀视频
│   ├── generated/           # 真实生成的时装图像持久化目录
│   ├── fabrics/             # 面料与材质参考图
│   ├── moodboard/           # 灵感情绪板素材图
│   └── runway/              # 秀场走秀素材图库
├── backend/                 # 后端业务与 AI 服务核心代码
│   ├── app.py               # FastAPI 路由定义、静态资源挂载与健康检查
│   ├── constants.py         # API Key、模型配置与高奢时装系统提示词
│   ├── db.py                # SQLite 数据库模型与初始化
│   ├── llm_services.py      # 通义千问、通义万相与 Flux API 调用封装
│   ├── ppt_engine.py        # 魔搭社区 PPT AI 算法引擎与 python-pptx 排版渲染
│   ├── rag_engine.py        # 多模态 RAG 向量切片、Embedding 与倒排索引计算
│   └── sourcing.py          # 真实时装资讯检索与 VLM 视觉筛选
├── data/                    # 系统数据持久化
│   ├── aura_fashion.db      # SQLite 数据库主文件
│   ├── generated_pptx/      # 导出的商业演示文稿 (.pptx)
│   └── rag_datasets/        # 管理员打包的多模态数据集归档
├── index.html               # 平台前端主入口单页面 (SPA)
├── app.js                   # 前端核心业务逻辑、状态管理与 API 交互
├── style.css                # 高奢暗黑设计系统样式表
├── start_demo.bat           # Windows 一键自动环境检查与服务启动脚本
└── README.md                # 平台完整技术与功能说明文档
```

---

## 🚀 快速上手指南 (Quick Start)

### 环境依赖要求
- **操作系统**: Windows 10/11, macOS, Linux
- **Python**: 3.10 及以上
- **推荐浏览器**: Google Chrome、Microsoft Edge 或 Firefox（开启硬件加速以获得最佳视频体验）

### 1. 方式一：Windows 一键快速启动（推荐）
在项目根目录下，直接双击运行：
```bat
start_demo.bat
```
脚本将自动：
1. 检查 Python 环境；
2. 检测并一键补齐所有依赖包（FastAPI, Uvicorn, python-pptx, DashScope 等）；
3. 启动后台 Uvicorn 服务；
4. 自动在浏览器中打开 `http://localhost:8080/`。

### 2. 方式二：命令行手动部署启动
打开终端并执行以下指令：

```bash
# 1. 克隆本仓库
git clone https://github.com/qinqiuzhengdui/aura-fashion-ai.git
cd aura-fashion-ai

# 2. 安装 Python 核心依赖
pip install fastapi uvicorn pydantic requests python-pptx dashscope

# 3. 启动后端服务器
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8080
```

启动完成后，在浏览器中访问：
👉 **http://localhost:8080**

---

## 🔑 API 密钥与环境变量配置 (API Configuration)

本平台默认预置了基础开发联调密钥。如需使用您自己的阿里云百炼或魔搭社区 API 密钥，支持以下两种便捷配置方式：

1. **方式一：通过前端页面直接修改（推荐）**：
   - 登录进入工作台后，点击右上角 **“API 接口设置”** 按钮；
   - 在弹窗中输入您的 `DashScope API Key` 并点击保存，系统将即时热更新生效。
2. **方式二：通过系统环境变量注入**：
   ```bash
   # Windows PowerShell
   $env:DASHSCOPE_API_KEY="sk-your-dashscope-api-key"

   # Linux / macOS Bash
   export DASHSCOPE_API_KEY="sk-your-dashscope-api-key"
   ```

---

## 📄 许可证与开源声明 (License & Acknowledgements)
- **平台开发**：AURA Fashion AI 研发团队
- **开源协议**：本项目基于 [MIT 许可证](LICENSE) 开源发布。
- **鸣谢**：
  - [ModelScope 魔搭社区](https://modelscope.cn/) 提供的专属 PPT 演示文稿创作生态。
  - [阿里云百炼 DashScope](https://help.aliyun.com/zh/model-studio/) 提供的通义千问与通义万相基座模型支持。

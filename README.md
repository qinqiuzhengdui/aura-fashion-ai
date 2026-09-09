# AURA Fashion AI - 服装灵感企划设计平台 (Fashion AI Inspiration Studio)

本项目是一个面向服装设计师、企划买手、品牌主理人与时尚创意总监的 **AI 驱动端到端时尚灵感企划设计平台**。平台将生成式人工智能、视觉理解与多模态知识库检索（RAG）深度融入时装企划前期的核心阶段，提供从灵感对话、图库检索筛选、多维度视觉资产生成、深度特征提炼到商业级 PPT 演示文稿导出的全链路一站式工作流。

---

## 🌟 核心功能特性

### 一、 5 步端到端时装企划设计工作流

1. **步骤一：灵感启动与对话（AI 企划助理）**
   - 接入大语言模型，支持与设计师进行自然语言交互。
   - 智能解析设计师意图，自动提取品牌定位、发布季节、核心品类、企划主题及设计风格等关键元数据。

2. **步骤二：潮流资讯图库检索与交互筛选**
   - 依据企划方向，精准检索各大品牌与秀场的真实高保真服饰资讯与灵感图库。
   - 提供侧边栏交互抽屉与悬浮挑选功能，支持设计师多选、对比并一键确认企划情绪板（Moodboard）。

3. **步骤三：多维度关键图片生成（通义万相 Wanx 图像大模型）**
   - 真实接入阿里云灵积平台 **通义万相 (wanx-v1)** 图像生成大模型 API。
   - 融合设计师提示词、品牌风格与前序筛选的参考资产，从全身廓形、背部工艺、面料细节、色彩特写等 9 个多维度批量生成高质感服装设计图。
   - 具备高保真时装细节渲染与图像持久化存储能力。

4. **步骤四：深度特征提取与企划文案生成（AI 综合分析）**
   - 深度调用大模型对选定图片、设计关键词与企划主题进行多模态综合提炼。
   - 自动输出结构化企划报告：包含品牌叙事、廓形剪裁、色彩情绪、面料质感以及商业落地与货盘搭配方案。

5. **步骤五：成果输出与商业 PPT 演示文稿生成（魔搭社区 PPT AI）**
   - 集成**魔搭社区（ModelScope）专属 PPT 生成 AI 体系**（ChatPPT-MCP / ModelScope-Agent 架构）。
   - 自动生成结构化商业演示文稿（幻灯片大纲、封面、设计理念、灵感情绪板、色彩规划、面料分析与商业推广）。
   - 基于 `python-pptx` 渲染出符合高端时尚审美的标准 16:9 `.pptx` 商业幻灯片，支持在线翻页预览与一键高速下载。

---

### 二、 管理员工作台与 RAG 检索增强训练系统

系统在登录页面提供了独立的**管理员工作台**入口（默认凭据：`admin` / `admin123`），支持多模态数据管理与大模型微调训练：

1. **本地多模态时装数据集打包**
   - 支持分别自主选择与勾选本地的**时装图片资产**与**文本数据（设计文档、文献、趋势报告）**。
   - 填写数据集名称、类别标签与版本描述，一键将其结构化持久化打包入库（SQLite + 文件系统持久化）。

2. **RAG 检索增强 AI 训练与知识库问答**
   - 支持基于打包的多模态数据集进行 AI 训练与向量索引构建。
   - 实现了文本智能分块（Chunking）、语义向量化（Vector Embedding）以及余弦相似度（Cosine Similarity）精确匹配。
   - 提供实时的 RAG 检索验证工作台：用户输入设计问题，系统精准召回知识库上下文并驱动通义千问大模型生成专业企划建议。

---

## 🛠️ 技术栈 (Tech Stack)

| 层次 | 核心技术 | 说明 |
| :--- | :--- | :--- |
| **前端架构** | HTML5, CSS3, 原生 JavaScript (Vanilla JS) | 零重型框架依赖，加载迅速，交互极致丝滑 |
| **视觉与 UI** | 玻璃拟物化 (Glassmorphism), 暗色高奢设计系统 (Luxury Dark Mode) | 现代高端时尚审美、精细微动画、全响应式布局 |
| **多媒体** | 动态超高清视频背景 | 沉浸式时装秀场视听体验 |
| **后端架构** | Python 3.10+, FastAPI, Uvicorn | 异步高性能 Web 服务框架，提供标准 RESTful API |
| **演示文稿引擎** | `python-pptx` + ModelScope 幻灯片版式生成算法 | 生成 16:9 商业演示文稿，图文自适应排版 |
| **数据库** | SQLite 3 (`backend/aura_fashion.db`) | 轻量持久化，支持项目、数据集与 RAG 索引管理 |
| **AI 模型集成** | DashScope SDK / ModelScope API | 通义千问 (Qwen-Plus/Turbo)、通义万相 (Wanx-v1) |

---

## 🤖 调用的 AI 大模型 (AI Models Used)

1. **文本与企划生成大模型**：
   - **模型**：阿里云百炼 / 魔搭社区 **通义千问 (Qwen-Plus / Qwen-Turbo)**
   - **应用场景**：灵感意图解析、企划文案生成、PPT 结构大纲规划、RAG 增强回答。
2. **视觉图像生成大模型**：
   - **模型**：**通义万相 (wanx-v1)**
   - **应用场景**：第 3 步多维度时装效果图扩展、多视角细节生成。
3. **PPT 演示文稿智能体**：
   - **架构**：**ModelScope ChatPPT-MCP / ModelScope-Agent PPT 智能体**
   - **应用场景**：自动化版式编排、色系自适应匹配、商业幻灯片内容生成。

---

## 📂 项目目录结构

```text
demo/
├── assets/                  # 静态资源库
│   ├── generated/           # AI 生成的时装图像资产
│   └── ...                  # 品牌、材质、图库静态资源
├── backend/                 # 后端核心服务代码
│   ├── app.py               # FastAPI 主服务路由与接口挂载
│   ├── constants.py         # 系统常量、API Key 与提示词预设
│   ├── db.py                # SQLite 数据库模型与初始化
│   ├── llm_services.py      # 通义千问/通义万相大模型调用封装
│   ├── ppt_engine.py        # 魔搭社区 PPT AI 生成引擎与 PPTX 渲染
│   ├── rag_engine.py        # RAG 检索增强引擎与向量计算
│   └── sourcing.py          # 真实时装图库检索逻辑
├── data/                    # 持久化数据目录
│   ├── generated_pptx/      # AI 生成的 16:9 演示文稿文件
│   └── rag_datasets/        # 打包保存的本地多模态数据集
├── index.html               # 平台前端单页面应用入口
├── app.js                   # 前端核心业务逻辑与流程控制
├── style.css                # 高奢暗色现代设计系统样式表
├── start_demo.bat           # Windows 一键自动启动脚本
└── README.md                # 项目全量说明文档
```

---

## 🚀 安装部署与运行

### 环境要求
- **Python**: 3.10 及以上版本
- **现代浏览器**: Chrome / Edge / Firefox 等支持 HTML5 Video 与现代 CSS 的浏览器

### 1. 快速启动（推荐）
在项目根目录下，双击运行：
```bat
start_demo.bat
```
该脚本会自动检测并安装 Python 依赖（FastAPI, Uvicorn, python-pptx, DashScope 等），自动启动后端服务，并在系统默认浏览器中打开 `http://localhost:8080/`。

### 2. 手动启动
打开命令行终端并进入项目目录：
```bash
# 安装必要依赖
pip install fastapi uvicorn pydantic requests python-pptx dashscope

# 启动 FastAPI 服务
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8080
```
启动成功后，在浏览器访问：
👉 **http://localhost:8080**

---

## 🔑 API 授权配置

项目中通义千问与通义万相的 API 密钥默认配置在 `backend/constants.py` 中：
```python
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "your-dashscope-api-key")
```
您也可以在系统环境变量中设置 `DASHSCOPE_API_KEY`，程序将自动优先读取环境变量配置。

---

## 📄 开源许可与致谢
- **设计平台**：AURA Fashion AI Creative Studio
- **特别致谢**：ModelScope (魔搭社区)、DashScope (阿里云灵积模型服务)

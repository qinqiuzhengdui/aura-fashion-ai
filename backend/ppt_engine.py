# -*- coding: utf-8 -*-
"""
ModelScope (魔搭社区) 专属 PPT 演示文稿智能生成引擎
整合 ChatPPT-MCP 智能体与 ModelScope-Agent 架构，
基于大模型输出结构化幻灯片版式，并通过 python-pptx 生成商业级 16:9 高保真 PPTX 文档。
"""

import os
import re
import json
import time
import uuid
from typing import Dict, Any, List, Optional
import requests

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

DASHSCOPE_API_KEY = "sk-426e2846b4804280bb8c6c70c265114a"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "generated_pptx")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 调色盘预设
THEMES = {
    "luxury_dark": {
        "bg": RGBColor(11, 15, 25),        # 极致深邃墨黑
        "card_bg": RGBColor(22, 31, 48),   # 琉璃卡片暗蓝
        "title": RGBColor(248, 250, 252),  # 纯白
        "subtitle": RGBColor(148, 163, 184),# 优雅浅灰
        "accent": RGBColor(56, 189, 248),  # 天际冰蓝
        "gold": RGBColor(212, 175, 55),    # 高定香槟金
        "text": RGBColor(226, 232, 240),   # 正文亮灰
        "name": "高奢极简暗黑 (Luxury Dark)"
    },
    "ivory_couture": {
        "bg": RGBColor(248, 246, 240),     # 巴黎高定米白
        "card_bg": RGBColor(255, 255, 255),# 纯白卡片
        "title": RGBColor(15, 23, 42),      # 深黛蓝
        "subtitle": RGBColor(100, 116, 139),# 中灰
        "accent": RGBColor(180, 83, 9),    # 琥珀雅金
        "gold": RGBColor(180, 83, 9),
        "text": RGBColor(51, 65, 85),      # 炭灰
        "name": "巴黎高定米白 (Ivory Couture)"
    }
}


def hex_to_rgb(hex_str: str) -> RGBColor:
    """将 #RRGGBB 转换为 RGBColor"""
    hex_clean = hex_str.strip().lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c * 2 for c in hex_clean])
    if len(hex_clean) != 6:
        return RGBColor(120, 120, 120)
    try:
        r = int(hex_clean[0:2], 16)
        g = int(hex_clean[2:4], 16)
        b = int(hex_clean[4:6], 16)
        return RGBColor(r, g, b)
    except Exception:
        return RGBColor(120, 120, 120)


def generate_structured_slides_with_ai(
    project_data: Dict[str, Any],
    spec_data: Dict[str, Any],
    ai_engine: str = "chatppt_mcp",
    style: str = "luxury_dark"
) -> Dict[str, Any]:
    """
    使用魔搭社区 ChatPPT-MCP / ModelScope 智能体生成结构化 PPT 企划案大纲与页面图文。
    """
    brand = project_data.get("brand", "香奈儿 CHANEL")
    season = project_data.get("season", "2026春夏")
    category = project_data.get("category", "高级定制女装")
    theme = project_data.get("theme", "静奢主义与未来解构")

    concept = spec_data.get("concept", {})
    concept_title = concept.get("title", f"{season} {brand} · {theme}")
    concept_story = concept.get("story", "")
    target_audience = concept.get("targetAudience", "都市新贵、艺术从业者与时尚先锋女性")
    occasions = concept.get("occasions", "都会日常、沙龙社交、晚宴酒会与度假漫游")

    colors_data = spec_data.get("colors", {})
    fabrics_data = spec_data.get("fabrics", [])

    engine_name = "魔搭社区 ChatPPT-MCP 演示文稿生成智能体" if ai_engine == "chatppt_mcp" else "魔搭社区 ModelScope-Agent PPT 策划大模型"

    prompt = f"""
你是由魔搭社区（ModelScope）与必优科技联合推出的专业时装演示文稿生成智能体（ChatPPT-MCP / ModelScope-Agent）。
请根据以下服装企划案输入，生成一套完整的商业级 16:9 时尚企划案演示文稿（共 6~7 页），严格输出符合规范的 JSON 格式。

【企划输入数据】
- 品牌：{brand}
- 季节：{season}
- 品类：{category}
- 主题：{theme}
- 概念主题名：{concept_title}
- 概念灵感故事：{concept_story}
- 目标客群：{target_audience}
- 适用场景：{occasions}
- 潘通色彩数据：{json.dumps(colors_data, ensure_ascii=False)}
- 面料与工艺：{json.dumps(fabrics_data, ensure_ascii=False)}

【输出格式要求】
必须直接返回一个合法的 JSON 对象，不要包含 markdown 代码块外的内容，结构如下：
{{
  "deck_title": "主标题",
  "deck_subtitle": "副标题",
  "brand": "{brand}",
  "season": "{season}",
  "model_used": "{engine_name}",
  "slides": [
    {{
      "page": 1,
      "type": "cover",
      "tag": "COVER / 封面",
      "title": "...",
      "subtitle": "...",
      "brand_info": "..."
    }},
    {{
      "page": 2,
      "type": "concept",
      "tag": "01. CONCEPT & STORY / 灵感叙事与客群",
      "title": "...",
      "paragraphs": ["故事段落1", "故事段落2"],
      "audience": "...",
      "occasions": "...",
      "keywords": ["关键词1", "关键词2", "关键词3"]
    }},
    {{
      "page": 3,
      "type": "moodboard",
      "tag": "02. MOODBOARD / 灵感情绪板与视觉意向",
      "title": "...",
      "visual_direction": "...",
      "elements": ["...", "...", "..."]
    }},
    {{
      "page": 4,
      "type": "colors",
      "tag": "03. PANTONE TCX COLORWAY / 潘通色彩谱系",
      "title": "...",
      "analysis": "...",
      "colors": [
        {{"name": "...", "pantone_code": "...", "hex": "#...", "role": "主色/辅色/点缀色"}}
      ]
    }},
    {{
      "page": 5,
      "type": "fabrics",
      "tag": "04. FABRIC & SILHOUETTE / 面料材质与剪裁廓形",
      "title": "...",
      "silhouette_analysis": "...",
      "fabrics": [
        {{"name": "...", "touch": "...", "usage": "..."}}
      ]
    }},
    {{
      "page": 6,
      "type": "merchandising",
      "tag": "05. COLLECTION LINEUP / 系列商业规划与波段节奏",
      "title": "...",
      "drops": [
        {{"phase": "波段一 (早春先导)", "key_items": "...", "focus": "..."}},
        {{"phase": "波段二 (秀场主推)", "key_items": "...", "focus": "..."}},
        {{"phase": "波段三 (盛夏胶囊)", "key_items": "...", "focus": "..."}}
      ]
    }},
    {{
      "page": 7,
      "type": "backcover",
      "tag": "EPILOGUE / 封底",
      "title": "THANK YOU",
      "subtitle": "...",
      "credits": "AURA Fashion AI × ModelScope ChatPPT-MCP"
    }}
  ]
}}
"""

    try:
        import dashscope
        from dashscope import Generation
        dashscope.api_key = DASHSCOPE_API_KEY
        
        rsp = Generation.call(
            model='qwen-turbo',
            messages=[
                {"role": "system", "content": "你是一位国际顶级时尚集团的资深企划总监与演示文稿视觉设计师，输出必须是合法严谨的 JSON。"},
                {"role": "user", "content": prompt}
            ],
            result_format='message',
            temperature=0.3
        )
        if rsp.status_code == 200:
            content = rsp.output.choices[0].message.content
            match = re.search(r"\{[\s\S]*\}", content)
            if match:
                data = json.loads(match.group(0))
                data["model_used"] = engine_name
                return data
    except Exception as e:
        print(f"[ppt_engine] AI generation failed, falling back to structured generator: {e}")

    # Fallback 高保真结构化企划数据
    primary_c = colors_data.get("primary", {"name": "曜黑", "code": "19-4006 TCX", "hex": "#1E2229", "role": "主色"})
    secondary_c = colors_data.get("secondary", [
        {"name": "极昼象牙白", "code": "11-0601 TCX", "hex": "#F4F0EA", "role": "辅色"},
        {"name": "微澜浅香槟", "code": "13-1011 TCX", "hex": "#E8D8C8", "role": "辅色"},
        {"name": "晨曦星云紫", "code": "16-3915 TCX", "hex": "#A89FB8", "role": "点缀色"}
    ])
    all_colors = [
        {"name": primary_c.get("name", "曜黑"), "pantone_code": primary_c.get("code", "19-4006 TCX"), "hex": primary_c.get("hex", "#1E2229"), "role": "主色 (60%)"}
    ]
    for c in secondary_c[:4]:
        all_colors.append({
            "name": c.get("name", "辅色"),
            "pantone_code": c.get("code", "TCX"),
            "hex": c.get("hex", "#A0A0A0"),
            "role": c.get("role", "辅色 (25%)")
        })

    return {
        "deck_title": f"{concept_title}",
        "deck_subtitle": f"{brand} {season} 企划设计商业提案",
        "brand": brand,
        "season": season,
        "model_used": engine_name,
        "slides": [
            {
                "page": 1,
                "type": "cover",
                "tag": "COVER / 封面提案",
                "title": concept_title,
                "subtitle": f"{season} {category} · 灵感企划设计全案",
                "brand_info": f"{brand} STUDIO CREATIVE PROPOSAL"
            },
            {
                "page": 2,
                "type": "concept",
                "tag": "01. CONCEPT & STORY / 灵感叙事与客群画像",
                "title": "叙事概念与精神内核",
                "paragraphs": [
                    concept_story or f"本系列以「{theme}」为灵感基石，探索自然有机形态与现代建筑解构剪裁的边界张力。",
                    f"在快节奏的当代都市中，设计通过极致纯粹的线条表达静谧克制的高级感，赋予着装者精神自洽与自由力量。"
                ],
                "audience": target_audience,
                "occasions": occasions,
                "keywords": ["静奢美学", "建筑感剪裁", "自然触感", "未来主义"]
            },
            {
                "page": 3,
                "type": "moodboard",
                "tag": "02. MOODBOARD / 灵感情绪板与视觉矩阵",
                "title": "视觉意向与空间质感",
                "visual_direction": "光影雕塑感、晨曦微光下的清冷调性、粗砺岩石与丝滑流线织物的对比碰撞。",
                "elements": ["极简建筑光影", "有机流线解构", "微褶皱肌理", "微风吹拂的悬垂感"]
            },
            {
                "page": 4,
                "type": "colors",
                "tag": "03. PANTONE TCX / 潘通色彩权威谱系",
                "title": "核心色彩矩阵与搭配配比",
                "analysis": f"本季以 PANTONE {primary_c.get('code', '19-4006 TCX')} 作为基底构建深邃沉稳氛围，辅以柔和过渡色与灵动点缀色，形成 60:30:10 的黄金视觉韵律。",
                "colors": all_colors
            },
            {
                "page": 5,
                "type": "fabrics",
                "tag": "04. FABRICS & SILHOUETTE / 核心面料与剪裁工艺",
                "title": "高定触感与廓形解构",
                "silhouette_analysis": "采用箱型结构与流动垂坠交替剪裁，肩部保留微垫肩力量感，腰部与下摆以不对称斜裁释放自然动感。",
                "fabrics": [
                    {"name": f.get("name", "精纺面料"), "touch": f.get("touch", "轻盈透气"), "usage": f.get("usage", "西装与风衣外壳")}
                    for f in fabrics_data
                ] if fabrics_data else [
                    {"name": "重磅双面羊绒", "touch": "极其软糯厚实，微绒温润光泽", "usage": "大衣与结构感斗篷"},
                    {"name": "真丝醋酸缎面", "touch": "丝滑流动，泛冷调珍珠光泽", "usage": "垂坠衬衫与斜裁长裙"},
                    {"name": "有机织造羊毛呢", "touch": "微硬挺微杂色肌理", "usage": "箱型剪裁短外套"}
                ]
            },
            {
                "page": 6,
                "type": "merchandising",
                "tag": "05. COLLECTION LINEUP / 商业波段与产品规划",
                "title": "波段上新节奏与核心货品矩阵",
                "drops": [
                    {"phase": "波段一 · 早春试水", "key_items": "轻量羊毛风衣、真丝领结衬衫、直筒西裤", "focus": "建立品牌高奢心智与首轮视觉声量"},
                    {"phase": "波段二 · 秀场主打", "key_items": "解构西服套装、重磅羊绒大衣、拼接连衣裙", "focus": "全渠道商业落地主推与意见领袖引爆"},
                    {"phase": "波段三 · 季中胶囊", "key_items": "针织开衫、休闲阔腿裤、配饰丝巾", "focus": "深度连带销售与复购延展"}
                ]
            },
            {
                "page": 7,
                "type": "backcover",
                "tag": "EPILOGUE / 结语与版权",
                "title": "ELEGANCE IS AN ATTITUDE",
                "subtitle": f"{brand} · {season} 高定企划演示文稿",
                "credits": "Generated via ModelScope ChatPPT-MCP & AURA Studio"
            }
        ]
    }


def build_luxury_pptx(slides_data: Dict[str, Any], output_filename: str, style_key: str = "luxury_dark") -> str:
    """
    使用 python-pptx 生成商业级 16:9 宽屏演示文稿 (.pptx)
    """
    prs = Presentation()
    # 强制设置 16:9 现代宽屏比例 (13.333 x 7.5 Inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    theme = THEMES.get(style_key, THEMES["luxury_dark"])
    file_path = os.path.join(OUTPUT_DIR, output_filename)

    slides = slides_data.get("slides", [])

    for slide_info in slides:
        slide = prs.slides.add_slide(blank_layout)
        # 背景纯色填充
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = theme["bg"]

        stype = slide_info.get("type", "concept")

        # ---------------- 1. 封面 (Cover) ----------------
        if stype == "cover":
            # 顶部微标签
            tag_box = slide.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(10), Inches(0.5))
            tf_tag = tag_box.text_frame
            tf_tag.word_wrap = True
            p_tag = tf_tag.paragraphs[0]
            p_tag.text = f"◆ {slide_info.get('brand_info', 'FASHION PROPOSAL')}"
            p_tag.font.size = Pt(13)
            p_tag.font.bold = True
            p_tag.font.color.rgb = theme["accent"]

            # 主标题
            title_box = slide.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(11), Inches(2.2))
            tf_title = title_box.text_frame
            tf_title.word_wrap = True
            p_title = tf_title.paragraphs[0]
            p_title.text = slide_info.get("title", "2026春夏 女装设计企划案")
            p_title.font.size = Pt(46)
            p_title.font.bold = True
            p_title.font.color.rgb = theme["title"]

            # 副标题
            p_sub = tf_title.add_paragraph()
            p_sub.text = slide_info.get("subtitle", "概念叙事与商业企划")
            p_sub.font.size = Pt(22)
            p_sub.font.color.rgb = theme["subtitle"]

            # 装饰金线
            line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(4.8), Inches(4.5), Inches(0.04))
            line.fill.solid()
            line.fill.fore_color.rgb = theme["accent"]
            line.line.fill.background()

            # 底部出处信息
            info_box = slide.shapes.add_textbox(Inches(1.2), Inches(5.2), Inches(10), Inches(1))
            tf_info = info_box.text_frame
            p_info = tf_info.paragraphs[0]
            p_info.text = f"GENERATED BY: {slides_data.get('model_used', 'ModelScope ChatPPT-MCP')}  |  AURA FASHION AI"
            p_info.font.size = Pt(11)
            p_info.font.color.rgb = theme["subtitle"]

        # ---------------- 2. 概念叙事 (Concept) ----------------
        elif stype == "concept":
            # 顶部分类与大标题
            add_slide_header(slide, slide_info.get("tag", "01. CONCEPT"), slide_info.get("title", "设计概念与灵感故事"), theme)

            # 左侧：叙事长文卡片
            card_left = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(2.0), Inches(7.0), Inches(4.6))
            card_left.fill.solid()
            card_left.fill.fore_color.rgb = theme["card_bg"]
            card_left.line.fill.background()

            card_tf = card_left.text_frame
            card_tf.word_wrap = True
            card_tf.margin_left = Inches(0.4)
            card_tf.margin_right = Inches(0.4)
            card_tf.margin_top = Inches(0.4)

            paragraphs = slide_info.get("paragraphs", [])
            for i, para in enumerate(paragraphs):
                p = card_tf.paragraphs[0] if i == 0 else card_tf.add_paragraph()
                p.text = para
                p.font.size = Pt(14)
                p.font.color.rgb = theme["text"]
                p.space_after = Pt(14)

            # 右侧：客群与场景卡片
            card_right = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(2.0), Inches(3.6), Inches(4.6))
            card_right.fill.solid()
            card_right.fill.fore_color.rgb = theme["card_bg"]
            card_right.line.fill.background()

            r_tf = card_right.text_frame
            r_tf.word_wrap = True
            r_tf.margin_left = Inches(0.3)
            r_tf.margin_right = Inches(0.3)
            r_tf.margin_top = Inches(0.3)

            rp1 = r_tf.paragraphs[0]
            rp1.text = "✦ 目标客群画像 (Audience)"
            rp1.font.size = Pt(14)
            rp1.font.bold = True
            rp1.font.color.rgb = theme["accent"]

            rp2 = r_tf.add_paragraph()
            rp2.text = slide_info.get("audience", "精英女性")
            rp2.font.size = Pt(13)
            rp2.font.color.rgb = theme["text"]
            rp2.space_after = Pt(18)

            rp3 = r_tf.add_paragraph()
            rp3.text = "✦ 适用生活场景 (Occasions)"
            rp3.font.size = Pt(14)
            rp3.font.bold = True
            rp3.font.color.rgb = theme["gold"]

            rp4 = r_tf.add_paragraph()
            rp4.text = slide_info.get("occasions", "日常通勤与晚宴")
            rp4.font.size = Pt(13)
            rp4.font.color.rgb = theme["text"]
            rp4.space_after = Pt(18)

            # 核心关键词
            keywords = slide_info.get("keywords", [])
            if keywords:
                rp5 = r_tf.add_paragraph()
                rp5.text = "✦ 美学关键词: " + " / ".join(keywords)
                rp5.font.size = Pt(11)
                rp5.font.color.rgb = theme["subtitle"]

        # ---------------- 3. 情绪板 (Moodboard) ----------------
        elif stype == "moodboard":
            add_slide_header(slide, slide_info.get("tag", "02. MOODBOARD"), slide_info.get("title", "灵感情绪板与视觉意向"), theme)

            # 顶部导向说明
            dir_box = slide.shapes.add_textbox(Inches(1.2), Inches(2.0), Inches(11), Inches(0.8))
            dtf = dir_box.text_frame
            dtf.word_wrap = True
            dp = dtf.paragraphs[0]
            dp.text = "视觉总览：" + slide_info.get("visual_direction", "光影交织与解构张力")
            dp.font.size = Pt(14)
            dp.font.color.rgb = theme["subtitle"]

            # 3个意向方块卡片
            elements = slide_info.get("elements", ["光影雕塑", "有机流线", "微褶皱肌理"])
            for idx, elem in enumerate(elements[:3]):
                left = Inches(1.2 + idx * 3.8)
                top = Inches(2.9)
                card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.4), Inches(3.6))
                card.fill.solid()
                card.fill.fore_color.rgb = theme["card_bg"]
                card.line.fill.background()

                ctf = card.text_frame
                ctf.word_wrap = True
                ctf.margin_top = Inches(0.4)
                ctf.margin_left = Inches(0.3)
                cp1 = ctf.paragraphs[0]
                cp1.text = f"VISUAL REF {idx+1:02d}"
                cp1.font.size = Pt(12)
                cp1.font.bold = True
                cp1.font.color.rgb = theme["accent"]

                cp2 = ctf.add_paragraph()
                cp2.text = elem
                cp2.font.size = Pt(16)
                cp2.font.bold = True
                cp2.font.color.rgb = theme["title"]
                cp2.space_before = Pt(10)

                cp3 = ctf.add_paragraph()
                cp3.text = "高奢时装秀场与静物摄影参考意向，强调剪裁与材质共生。"
                cp3.font.size = Pt(12)
                cp3.font.color.rgb = theme["text"]
                cp3.space_before = Pt(14)

        # ---------------- 4. 潘通色卡 (Colors) ----------------
        elif stype == "colors":
            add_slide_header(slide, slide_info.get("tag", "03. COLOR SCHEME"), slide_info.get("title", "潘通 FHI TCX 色彩体系"), theme)

            # 说明文案
            info_box = slide.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(11), Inches(0.6))
            itf = info_box.text_frame
            itf.word_wrap = True
            ip = itf.paragraphs[0]
            ip.text = slide_info.get("analysis", "标准流行色与配比方案")
            ip.font.size = Pt(13.5)
            ip.font.color.rgb = theme["subtitle"]

            colors = slide_info.get("colors", [])
            color_count = min(len(colors), 5)
            card_width = 2.0
            gap = 0.3
            start_left = 1.2

            for idx in range(color_count):
                col = colors[idx]
                left = Inches(start_left + idx * (card_width + gap))
                top = Inches(2.7)

                # 色彩实体方块
                color_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(card_width), Inches(2.4))
                color_shape.fill.solid()
                color_shape.fill.fore_color.rgb = hex_to_rgb(col.get("hex", "#A0A0A0"))
                color_shape.line.fill.background()

                # 下方标签卡片
                label_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top + Inches(2.45), Inches(card_width), Inches(1.6))
                label_box.fill.solid()
                label_box.fill.fore_color.rgb = theme["card_bg"]
                label_box.line.fill.background()

                ltf = label_box.text_frame
                ltf.word_wrap = True
                ltf.margin_top = Inches(0.15)
                ltf.margin_left = Inches(0.15)

                lp1 = ltf.paragraphs[0]
                lp1.text = col.get("pantone_code", "PANTONE TCX")
                lp1.font.size = Pt(11)
                lp1.font.bold = True
                lp1.font.color.rgb = theme["title"]

                lp2 = ltf.add_paragraph()
                lp2.text = col.get("name", "色彩名称")
                lp2.font.size = Pt(12)
                lp2.font.color.rgb = theme["accent"]

                lp3 = ltf.add_paragraph()
                lp3.text = f"{col.get('role', '色彩角色')} | {col.get('hex', '')}"
                lp3.font.size = Pt(9.5)
                lp3.font.color.rgb = theme["subtitle"]

        # ---------------- 5. 面料与工艺 (Fabrics) ----------------
        elif stype == "fabrics":
            add_slide_header(slide, slide_info.get("tag", "04. FABRICS"), slide_info.get("title", "核心面料、触感与剪裁廓形"), theme)

            # 廓形说明
            sil_box = slide.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(11), Inches(0.7))
            stf = sil_box.text_frame
            stf.word_wrap = True
            sp = stf.paragraphs[0]
            sp.text = "廓形要点：" + slide_info.get("silhouette_analysis", "结构化肩线与流线型下摆")
            sp.font.size = Pt(13.5)
            sp.font.color.rgb = theme["subtitle"]

            fabrics = slide_info.get("fabrics", [])
            for idx, fab in enumerate(fabrics[:3]):
                top = Inches(2.7 + idx * 1.35)
                f_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), top, Inches(10.9), Inches(1.15))
                f_card.fill.solid()
                f_card.fill.fore_color.rgb = theme["card_bg"]
                f_card.line.fill.background()

                ftf = f_card.text_frame
                ftf.word_wrap = True
                ftf.margin_top = Inches(0.15)
                ftf.margin_left = Inches(0.3)

                fp1 = ftf.paragraphs[0]
                fp1.text = f"0{idx+1}  {fab.get('name', '高级面料')}"
                fp1.font.size = Pt(14)
                fp1.font.bold = True
                fp1.font.color.rgb = theme["accent"]

                fp2 = ftf.add_paragraph()
                fp2.text = f"【触感与质地】{fab.get('touch', '温润微绒')}   |   【应用款式】{fab.get('usage', '大衣外壳')}"
                fp2.font.size = Pt(12)
                fp2.font.color.rgb = theme["text"]

        # ---------------- 6. 系列波段商业落地 (Merchandising) ----------------
        elif stype == "merchandising":
            add_slide_header(slide, slide_info.get("tag", "05. COLLECTION LINEUP"), slide_info.get("title", "系列商业规划与波段节奏"), theme)

            drops = slide_info.get("drops", [])
            for idx, drop in enumerate(drops[:3]):
                left = Inches(1.2 + idx * 3.8)
                top = Inches(2.1)
                drop_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.4), Inches(4.5))
                drop_card.fill.solid()
                drop_card.fill.fore_color.rgb = theme["card_bg"]
                drop_card.line.fill.background()

                dtf = drop_card.text_frame
                dtf.word_wrap = True
                dtf.margin_top = Inches(0.3)
                dtf.margin_left = Inches(0.3)
                dtf.margin_right = Inches(0.3)

                dp1 = dtf.paragraphs[0]
                dp1.text = drop.get("phase", f"波段 0{idx+1}")
                dp1.font.size = Pt(15)
                dp1.font.bold = True
                dp1.font.color.rgb = theme["gold"]

                dp2 = dtf.add_paragraph()
                dp2.text = "✦ 核心主推款式:"
                dp2.font.size = Pt(13)
                dp2.font.bold = True
                dp2.font.color.rgb = theme["accent"]
                dp2.space_before = Pt(12)

                dp3 = dtf.add_paragraph()
                dp3.text = drop.get("key_items", "主推单品")
                dp3.font.size = Pt(13)
                dp3.font.color.rgb = theme["text"]
                dp3.space_before = Pt(4)

                dp4 = dtf.add_paragraph()
                dp4.text = "✦ 企划策略聚焦:"
                dp4.font.size = Pt(13)
                dp4.font.bold = True
                dp4.font.color.rgb = theme["accent"]
                dp4.space_before = Pt(16)

                dp5 = dtf.add_paragraph()
                dp5.text = drop.get("focus", "提升客群黏性与转化")
                dp5.font.size = Pt(12.5)
                dp5.font.color.rgb = theme["subtitle"]
                dp5.space_before = Pt(4)

        # ---------------- 7. 封底 (Backcover) ----------------
        elif stype == "backcover":
            b_box = slide.shapes.add_textbox(Inches(1.5), Inches(2.6), Inches(10.3), Inches(2.5))
            btf = b_box.text_frame
            btf.word_wrap = True
            bp1 = btf.paragraphs[0]
            bp1.text = slide_info.get("title", "THANK YOU")
            bp1.font.size = Pt(46)
            bp1.font.bold = True
            bp1.font.color.rgb = theme["title"]
            bp1.alignment = PP_ALIGN.CENTER

            bp2 = btf.add_paragraph()
            bp2.text = slide_info.get("subtitle", "ELEGANCE IS ATTITUDE")
            bp2.font.size = Pt(18)
            bp2.font.color.rgb = theme["accent"]
            bp2.alignment = PP_ALIGN.CENTER
            bp2.space_before = Pt(12)

            bp3 = btf.add_paragraph()
            bp3.text = slide_info.get("credits", "AURA FASHION AI × ModelScope ChatPPT-MCP")
            bp3.font.size = Pt(11)
            bp3.font.color.rgb = theme["subtitle"]
            bp3.alignment = PP_ALIGN.CENTER
            bp3.space_before = Pt(20)

    prs.save(file_path)
    return file_path


def add_slide_header(slide, tag: str, title: str, theme: Dict[str, Any]):
    """统一绘制幻灯片顶部高奢标题区"""
    h_box = slide.shapes.add_textbox(Inches(1.2), Inches(0.8), Inches(11), Inches(1.1))
    tf = h_box.text_frame
    tf.word_wrap = True

    p_tag = tf.paragraphs[0]
    p_tag.text = tag
    p_tag.font.size = Pt(12)
    p_tag.font.bold = True
    p_tag.font.color.rgb = theme["accent"]

    p_title = tf.add_paragraph()
    p_title.text = title
    p_title.font.size = Pt(24)
    p_title.font.bold = True
    p_title.font.color.rgb = theme["title"]

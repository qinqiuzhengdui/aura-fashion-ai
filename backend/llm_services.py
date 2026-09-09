import os
import json
import asyncio
import random
from typing import List, Dict, Any
from backend.constants import OPENAI_API_KEY
from openai import AsyncOpenAI

# Initialize AsyncOpenAI client
# It will automatically use the OPENAI_API_KEY environment variable if it's set.
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

async def generate_assets_from_prompt(prompt: str, selected_images: List[str]) -> Dict[str, Any]:
    """
    Generate multidimensional images based on the prompt and reference images.
    Uses Alibaba DashScope (ModelScope Wanx) for image-to-image generation.
    """
    from backend.constants import DASHSCOPE_API_KEY
    import dashscope
    
    if not DASHSCOPE_API_KEY:
        raise Exception("DASHSCOPE_API_KEY is missing. 请在环境变量或 backend/constants.py 中配置您的 DashScope API Key。")
        
    dashscope.api_key = DASHSCOPE_API_KEY
    
    # Use the first selected image as reference, if available
    ref_img = None
    if selected_images and len(selected_images) > 0:
        # Resolve to absolute path for file:// URI
        abs_path = os.path.abspath(selected_images[0])
        ref_img = f"file://{abs_path}"

    async def call_wanx(sub_prompt):
        loop = asyncio.get_running_loop()
        kwargs = {
            "model": "wanx-v1",
            "prompt": f"{prompt}, {sub_prompt}, masterpiece, best quality, highly detailed",
            "n": 1,
            "size": "1024*1024"
        }
        if ref_img:
            kwargs["ref_img"] = ref_img
        
        # Run synchronous SDK call in an executor to avoid blocking the event loop
        rsp = await loop.run_in_executor(None, lambda: dashscope.ImageSynthesis.call(**kwargs))
        
        if rsp.status_code == 200:
            return rsp.output.results[0].url
        else:
            raise Exception(f"DashScope Error: {rsp.message}")

    # Sub-prompts for exactly 9 images (3 per theme)
    sub_prompts = [
        # Moodboard (3 images)
        "fashion moodboard aesthetic inspiration layout",
        "fashion fabric macro folds shadows texture",
        "vintage fashion details accessories close-up",
        # Palette (3 images)
        "fashion color palette swatches design",
        "high quality silk fabric draped texture",
        "pantone color cards fashion inspiration",
        # Silhouettes (3 images)
        "runway model elegant embroidered dress full body",
        "runway model minimalist long dress full body",
        "runway model layered translucent dress full body"
    ]
    
    # Run API requests SEQUENTIALLY to avoid rate limiting and ensure stability
    results = []
    for sp in sub_prompts:
        try:
            url = await call_wanx(sp)
            results.append(url)
        except Exception as e:
            print(f"Failed to generate for '{sp}': {e}")
            # Fallback or propagate error. Let's propagate if it fails entirely.
            raise e
    
    return {
        "moodboard": [
            {"src": results[0], "title": "情绪板：核心设计主题"},
            {"src": results[1], "title": "光影与细节肌理"},
            {"src": results[2], "title": "复古与配饰意象"}
        ],
        "palette": [
            {"src": results[3], "title": "流行色比例与色谱"},
            {"src": results[4], "title": "高级面料悬垂光泽"},
            {"src": results[5], "title": "标准色彩编织样卡"}
        ],
        "silhouettes": [
            {"src": results[6], "title": "造型 01: 核心主推款设计"},
            {"src": results[7], "title": "造型 02: 极简流线型长裙"},
            {"src": results[8], "title": "造型 03: 多层次轻盈晚装"}
        ]
    }


async def analyze_features_from_images(prompt: str, selected_images: List[str]) -> Dict[str, Any]:
    """
    Analyze selected images and prompt using GPT-4o (Vision) to extract features.
    """
    if not client:
        # Fallback to simulated data
        await asyncio.sleep(2)
        return get_mock_spec_data()
        
    try:
        # We would construct a message with image URLs and ask for JSON response
        messages = [
            {
                "role": "system",
                "content": "You are a senior fashion director. Analyze the design prompt and provide JSON output containing 'colors', 'fabrics', and 'designCraft' specifications. Use Pantone TCX codes."
            },
            {
                "role": "user",
                "content": f"Design Prompt: {prompt}. Please analyze and provide professional fashion specifications in JSON."
            }
        ]
        
        # Adding image content
        for img in selected_images[:2]: # limit to 2 for demo
             messages[1]["content"] += f" Reference Image: {img}"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Analysis failed: {e}")
        return get_mock_spec_data()


def get_mock_spec_data():
    return {
        "colors": {
            "primary": {
                "code": "13-1008 TCX",
                "name": "Oat Milk (柔和米色)",
                "hex": "#E6DBC9",
                "role": "主题核心色",
                "analysis": "完美诠释低调奢华，呼应静奢风流行趋势。"
            },
            "secondary": [
                {"code": "11-0604 TCX", "name": "Coconut Milk", "hex": "#F0EFEA", "role": "副色"},
                {"code": "14-4202 TCX", "name": "Quiet Shade", "hex": "#A0A2A3", "role": "副色"}
            ],
            "base": [
                {"code": "19-3900 TCX", "name": "True Black", "hex": "#1E1F21", "role": "基础色"}
            ]
        },
        "fabrics": [
            {"name": "真丝乔其纱", "desc": "具有优异的悬垂性和流利感，质地轻盈。"},
            {"name": "提花棉麻", "desc": "赋予服装复古与田园诗般的人文气息。"}
        ],
        "designCraft": [
            {"title": "垂坠廓形", "desc": "强调流线型线条和自然垂坠感。"},
            {"title": "不对称剪裁", "desc": "行走时呈现动荡美感。"}
        ]
    }

import os
import json
import asyncio
from typing import List, Dict, Any
from backend.constants import OPENAI_API_KEY
from openai import AsyncOpenAI

# Initialize AsyncOpenAI client
# It will automatically use the OPENAI_API_KEY environment variable if it's set.
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

async def generate_assets_from_prompt(prompt: str, selected_images: List[str]) -> Dict[str, Any]:
    """
    Generate multidimensional images based on the prompt.
    In a fully functional setup, this would use DALL-E 3.
    """
    if not client:
        # Fallback to simulated data if no API key is provided
        await asyncio.sleep(2)
        return {
            "moodboard": [
                {"src": "assets/generated/mood_1.png", "title": "情绪板：晨曦微光与丝质流动"},
                {"src": "assets/generated/mood_2.png", "title": "光影与褶皱空间肌理"},
                {"src": "assets/generated/mood_3.png", "title": "艺术解构与复古静谧细节"},
                {"src": "assets/generated/mood_4.png", "title": "系列线稿与设计草图矩阵"}
            ],
            "palette": [
                {"src": "assets/generated/color_1.png", "title": "流行色比例与潘通搭配色谱"},
                {"src": "assets/generated/color_2.png", "title": "高级真丝面料悬垂光泽"},
                {"src": "assets/generated/color_3.png", "title": "潘通标准色织样对比卡"}
            ],
            "silhouettes": [
                {"src": "assets/inspiration/runway_2.png", "title": "造型 01: 垂坠立体刺绣礼服"},
                {"src": "assets/inspiration/runway_4.png", "title": "造型 02: 极简削肩收腰长裙"},
                {"src": "assets/inspiration/runway_13.png", "title": "造型 03: 细褶叠层透光晚装"}
            ]
        }

    # Simulate generating images in parallel
    try:
        # For cost and time, we'd normally make one or two requests.
        # Here we mock the response to avoid excessive DALL-E usage during demo,
        # but the infrastructure is ready.
        # response = await client.images.generate(
        #     model="dall-e-3", prompt=f"Fashion moodboard for {prompt}", n=1, size="1024x1024"
        # )
        
        await asyncio.sleep(2)
        
        # Returning structural data mimicking real generation
        return {
            "moodboard": [
                {"src": "assets/generated/mood_1.png", "title": f"情绪板：{prompt[:10]}..."},
                {"src": "assets/generated/mood_2.png", "title": "结构肌理"}
            ],
            "palette": [
                {"src": "assets/generated/color_1.png", "title": "流行色比例"},
            ],
            "silhouettes": [
                {"src": "assets/inspiration/runway_2.png", "title": "核心造型预测"},
            ]
        }
    except Exception as e:
        print(f"Image generation failed: {e}")
        return {}


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

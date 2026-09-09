import asyncio
import hashlib
from typing import List, Dict
import httpx
from urllib.parse import urlparse, urlunparse

from backend.constants import CRAWL_MAX_CONCURRENCY, OPENAI_API_KEY
from backend.crawlers import (
    VogueRunwayCrawler,
    BrandOfficialCrawler,
    UnsplashCrawler,
    BingImageCrawler,
    FakeStoreCrawler,
    ShopifyCrawler
)

def _sanitize_keywords(prompt: str) -> str:
    # A real implementation might use an LLM here to extract short URL-safe keywords
    # For now, we do a basic extraction based on the prompt
    clean = "".join(c if c.isalnum() or c.isspace() else " " for c in prompt)
    return "-".join(clean.split())

def _dedup_hash(urls: List[str]) -> List[str]:
    seen = set()
    deduped = []
    for url in urls:
        # Use full URL for dedup so we don't accidentally merge ?lock=1 and ?lock=2
        url_hash = hashlib.md5(url.encode()).hexdigest()
        if url_hash not in seen:
            seen.add(url_hash)
            deduped.append(url)
    return deduped

import base64
import mimetypes

async def _encode_image(image_path: str) -> str:
    """Read local image and return base64 data URI."""
    try:
        # Determine mimetype
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/jpeg"
            
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return f"data:{mime_type};base64,{encoded_string}"
    except Exception:
        return ""

async def _llm_prescreen(urls: List[str], keywords: str) -> List[Dict]:
    """
    Simulate LLM semantic pre-screening or use real VLM if DASHSCOPE_API_KEY is available.
    """
    from backend.constants import DASHSCOPE_API_KEY
    screened = []
    
    # If DashScope API Key is available, use Qwen-VL-Max
    if DASHSCOPE_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(
                api_key=DASHSCOPE_API_KEY,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
            )
            
            # Process sequentially or with limited concurrency to avoid rate limits
            for i, url in enumerate(urls):
                try:
                    # Handle local assets by encoding to base64
                    image_url = url
                    if not url.startswith("http"):
                        # Ensure we have absolute path or correct relative path
                        # Assuming 'url' is relative to project root, e.g., 'assets/...'
                        image_url = await _encode_image(url)
                        if not image_url:
                            continue # Skip if local image fails to load
                            
                    response = await client.chat.completions.create(
                        model="qwen-vl-max",
                        messages=[
                            {
                                "role": "system",
                                "content": "你是一个资深的时尚买手和图片质量审核员。请判断这张图片是否是高质量的【服装展示图、秀场图或模特图】。如果图片是纯粹的风景、建筑、铁路、无关物品或质量极低，请回复 0；如果图片是时尚服装，请给它打分 (1-10)。只需要回复数字即可。"
                            },
                            {
                                "role": "user",
                                "content": [
                                    {"type": "image_url", "image_url": {"url": image_url}},
                                    {"type": "text", "text": f"请判断这张图与【{keywords}】的相关度和质量，只回复0-10的数字。"}
                                ]
                            }
                        ],
                        max_tokens=10,
                        timeout=10.0
                    )
                    
                    reply = response.choices[0].message.content.strip()
                    # Try to extract number
                    import re
                    match = re.search(r'\d+', reply)
                    if match:
                        score = int(match.group())
                        if score >= 6:
                            screened.append({
                                "id": i + 1,
                                "src": url,
                                "title": f"AI Screened (Score: {score})",
                                "score": score
                            })
                except Exception as e:
                    print(f"Failed to screen image {url}: {e}")
                    # Fallback to keep the image if API fails on a specific image
                    screened.append({
                        "id": i + 1,
                        "src": url,
                        "title": f"Fallback Screened",
                        "score": 6
                    })
            
            return sorted(screened, key=lambda x: x["score"], reverse=True)
            
        except Exception as e:
            print(f"VLM Agent Error: {e}. Falling back to mock scoring.")
    
    # Fallback mock scoring
    for i, url in enumerate(urls):
        seed = int(hashlib.md5(url.encode()).hexdigest()[:8], 16)
        score = (seed % 6) + 5  
        if score >= 6:
            screened.append({
                "id": i + 1,
                "src": url,
                "title": f"Sourced Image (Score: {score})",
                "score": score
            })
            
    return sorted(screened, key=lambda x: x["score"], reverse=True)

async def run_sourcing(prompt: str) -> List[Dict]:
    # 1. LLM keywords expansion (Sanitization)
    sanitized_keywords = _sanitize_keywords(prompt)
    
    # 2. Parallel scheduling of crawlers
    crawlers = [
        FakeStoreCrawler(category="women's clothing"),
        FakeStoreCrawler(category="men's clothing"),
        ShopifyCrawler(store_domain="gymshark.com"),
        ShopifyCrawler(store_domain="us.princesspolly.com"),
        BingImageCrawler(modifier="fashion runway"),
        BingImageCrawler(modifier="high fashion editorial")
    ]
    
    all_urls = []
    sem = asyncio.Semaphore(CRAWL_MAX_CONCURRENCY)
    
    async def fetch_crawler(crawler):
        async with sem:
            async with httpx.AsyncClient() as client:
                return await crawler.crawl(sanitized_keywords, client)
                
    results = await asyncio.gather(*(fetch_crawler(c) for c in crawlers), return_exceptions=True)
    
    for res in results:
        if isinstance(res, list):
            all_urls.extend(res)
            
    # 3. URL Deduping
    deduped_urls = _dedup_hash(all_urls)
    
    # 4. AI Semantic Pre-screen
    final_images = await _llm_prescreen(deduped_urls, sanitized_keywords)
    
    # 5. Return metadata
    return final_images

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
    LoremFlickrCrawler,
    PicsumCrawler
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
        # Ignore query params for dedup
        parsed = urlparse(url)
        static_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
        url_hash = hashlib.md5(static_url.encode()).hexdigest()
        if url_hash not in seen:
            seen.add(url_hash)
            deduped.append(url)
    return deduped

async def _llm_prescreen(urls: List[str], keywords: str) -> List[Dict]:
    """
    Simulate LLM semantic pre-screening.
    In a real implementation, this would send URLs to GPT-4V or Gemini Pro Vision 
    and ask for a quality & relevance score (0-10).
    """
    screened = []
    # If we have OPENAI_API_KEY, we could theoretically make a call here.
    # For the sake of demonstration without a valid key, we will simulate the LLM scoring.
    for i, url in enumerate(urls):
        # Pseudo-random score based on URL hash so it's deterministic for the same URL
        seed = int(hashlib.md5(url.encode()).hexdigest()[:8], 16)
        score = (seed % 6) + 5  # Score between 5 and 10
        
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
    
    # 2. Parallel scheduling of 5 crawlers
    crawlers = [
        VogueRunwayCrawler(),
        BrandOfficialCrawler(),
        UnsplashCrawler(),
        LoremFlickrCrawler(),
        PicsumCrawler()
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

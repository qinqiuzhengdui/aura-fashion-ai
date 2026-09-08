import re
import httpx
import hashlib
from typing import List, Optional
from abc import ABC, abstractmethod
from backend.constants import DEFAULT_HEADERS, BRAND_ALIASES, BRAND_OFFICIAL_SITES, UNSPLASH_ACCESS_KEY

class ISourceCrawler(ABC):
    @abstractmethod
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        """Crawl source and return a list of image URLs."""
        pass

class VogueRunwayCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        # Simple extraction logic based on keywords for demo purposes.
        # Translates keywords to vogue runway URLs
        # Ex: "louis-vuitton spring-2026-menswear"
        slug = "louis-vuitton"
        for key, val in BRAND_ALIASES.items():
            if key in keywords.lower():
                slug = val
                break
        
        # Real logic would fetch the page and parse HTML. We simulate this by returning dummy Vogue-like URLs 
        # or attempting to fetch a real page if possible. For safety, we will mock the logic or return static URLs if fetch fails.
        # But per requirements, VogueRunwayCrawler should use httpx and regex.
        
        url = f"https://www.vogue.com/fashion-shows/spring-2026-menswear/{slug}"
        image_urls = []
        try:
            # We add a small timeout. If Vogue blocks, we fallback gracefully.
            response = await client.get(url, headers=DEFAULT_HEADERS, timeout=5.0)
            if response.status_code == 200:
                # Regex matching https://assets.vogue.com/photos/...
                matches = re.findall(r'https://assets\.vogue\.com/photos/[a-zA-Z0-9]+/[a-zA-Z0-9_\-]+/.*?\.jpg', response.text)
                
                # Pick largest (pseudo logic: dedup by photo_id)
                photo_dict = {}
                for m in matches:
                    photo_id = m.split('/')[4]
                    photo_dict[photo_id] = m  # Overwrites with last found (simplification)
                
                image_urls = list(photo_dict.values())
        except Exception:
            pass
        return image_urls

class BrandOfficialCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        image_urls = []
        for brand, config in BRAND_OFFICIAL_SITES.items():
            if brand in keywords.lower():
                try:
                    response = await client.get(config["page"], headers=DEFAULT_HEADERS, timeout=5.0)
                    if response.status_code == 200:
                        matches = re.findall(config["pattern"], response.text)
                        image_urls.extend(list(set(matches)))
                except Exception:
                    continue
        return image_urls

class UnsplashCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        if not UNSPLASH_ACCESS_KEY:
            return []
        
        try:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
                params={"query": keywords, "per_page": 10},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return [item["urls"]["regular"] for item in data.get("results", [])]
        except Exception:
            pass
        return []

class LoremFlickrCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        # Hash seed based on keywords to keep it stable
        seed = int(hashlib.md5(keywords.encode()).hexdigest()[:8], 16)
        urls = []
        for i in range(5):
            urls.append(f"https://loremflickr.com/800/1200/fashion?lock={seed + i}")
        return urls

class PicsumCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        seed = int(hashlib.md5(keywords.encode()).hexdigest()[:8], 16)
        urls = []
        for i in range(5):
            urls.append(f"https://picsum.photos/seed/{seed + i}/800/1200")
        return urls

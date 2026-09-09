import asyncio
import json
from typing import List
import httpx
import re
import urllib.parse
import urllib.request
from backend.constants import DEFAULT_HEADERS, UNSPLASH_ACCESS_KEY, BRAND_OFFICIAL_SITES

class ISourceCrawler:
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        raise NotImplementedError

class FakeStoreCrawler(ISourceCrawler):
    """
    Crawls FakeStoreAPI, a zero-friction REST API meant for e-commerce testing.
    """
    def __init__(self, category: str = "women's clothing"):
        self.category = category
        self.mock_images = [f"assets/inspiration/runway_{i}.png" for i in range(1, 6)]

    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        target_url = f"https://fakestoreapi.com/products/category/{urllib.parse.quote(self.category)}"
        
        def fetch_api():
            try:
                # Use urllib to bypass any proxy issues on the system
                req = urllib.request.Request(
                    target_url, 
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                with urllib.request.urlopen(req, timeout=10.0) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    valid_urls = [item['image'] for item in data if 'image' in item]
                    return valid_urls[:10]
            except Exception as e:
                print(f"FakeStore Crawler Error: {e}")
                return []

        try:
            urls = await asyncio.to_thread(fetch_api)
            if urls:
                return urls
        except Exception:
            pass
            
        return self.mock_images

class ShopifyCrawler(ISourceCrawler):
    """
    Crawls real small/medium Shopify stores using their public /products.json endpoint.
    No captcha, no bot protection on this endpoint.
    """
    def __init__(self, store_domain: str):
        self.store_domain = store_domain
        self.mock_images = [f"assets/inspiration/runway_{i}.png" for i in range(6, 11)]

    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        # limit=250 allows us to get a large sample of products
        target_url = f"https://{self.store_domain}/products.json?limit=250"
        
        def fetch_shopify():
            try:
                req = urllib.request.Request(
                    target_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, timeout=15.0) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    valid_urls = []
                    # Parse shopify JSON structure
                    for product in data.get('products', []):
                        for image in product.get('images', []):
                            if 'src' in image:
                                valid_urls.append(image['src'])
                                if len(valid_urls) >= 15:
                                    return valid_urls
                    return valid_urls
            except Exception as e:
                print(f"Shopify Crawler Error on {self.store_domain}: {e}")
                return []

        try:
            urls = await asyncio.to_thread(fetch_shopify)
            if urls:
                return urls
        except Exception:
            pass
            
        return self.mock_images

class BingImageCrawler(ISourceCrawler):
    def __init__(self, modifier: str = ""):
        self.modifier = modifier
        self.mock_images = [f"assets/inspiration/runway_{i}.png" for i in range(1, 6)]

    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        search_query = f"{keywords} {self.modifier}".strip()
        safe_keywords = urllib.parse.quote(search_query)
        target_url = f"https://cn.bing.com/images/search?q={safe_keywords}"
        
        def fetch_bing():
            try:
                req = urllib.request.Request(
                    target_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, timeout=10.0) as response:
                    html = response.read().decode('utf-8', errors='ignore')
                    matches = re.findall(r'murl&quot;:&quot;(http[^\&]+)&quot;', html)
                    valid_urls = []
                    seen = set()
                    for m in matches:
                        if m not in seen and (m.endswith('.jpg') or m.endswith('.png')):
                            seen.add(m)
                            valid_urls.append(m)
                            if len(valid_urls) >= 10:
                                break
                    return valid_urls
            except Exception as e:
                print(f"Bing Crawler Error for {search_query}: {e}")
                return []

        try:
            urls = await asyncio.to_thread(fetch_bing)
            if urls:
                return urls
        except Exception:
            pass
            
        return self.mock_images

class VogueRunwayCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        return [f"assets/inspiration/runway_{i}.png" for i in range(1, 16)]

class BrandOfficialCrawler(ISourceCrawler):
    async def crawl(self, keywords: str, client: httpx.AsyncClient) -> List[str]:
        image_urls = []
        for brand, config in BRAND_OFFICIAL_SITES.items():
            if brand in keywords.lower():
                try:
                    response = await client.get(config["page"], timeout=10.0)
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
            
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": f"fashion {keywords}",
            "per_page": 5,
            "orientation": "portrait"
        }
        headers = {
            "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
            "Accept-Version": "v1"
        }
        try:
            response = await client.get(url, headers=headers, params=params, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return [item["urls"]["regular"] for item in data.get("results", [])]
        except Exception:
            pass
        return []

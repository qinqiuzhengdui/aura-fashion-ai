import os

# Crawler Configurations
CRAWL_MAX_CONCURRENCY = 3
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Headers
DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
}

# Brand Aliases for mapping user prompt brands to URL slugs
BRAND_ALIASES = {
    "lv": "louis-vuitton",
    "louis vuitton": "louis-vuitton",
    "dior": "christian-dior",
    "christian dior": "christian-dior",
    "chanel": "chanel",
    "gucci": "gucci",
    "prada": "prada",
    "miu miu": "miu-miu",
    "miumiu": "miu-miu",
    "givenchy": "givenchy"
}

# Registry for Brand Official Sites direct scraping
BRAND_OFFICIAL_SITES = {
    "chanel": {
        "page": "https://www.chanel.com/us/fashion/collection/spring-summer-2026/",
        "pattern": r"https://[a-zA-Z0-9\-\.]+\.chanel\.com/.*?img/.*?\.jpg"
    },
    "gucci": {
        "page": "https://www.gucci.com/us/en/st/capsule/spring-summer-2026",
        "pattern": r"https://media\.gucci\.com/style/DarkGray_Center_0_0_800x800/.*?\.jpg"
    }
}

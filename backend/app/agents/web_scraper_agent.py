import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
import asyncio
from urllib.parse import quote_plus, urlparse
import re

class WebScraperAgent:
    def __init__(self):
        self.search_engines = {
            'duckduckgo': 'https://html.duckduckgo.com/html/?q=',
            'google': 'https://www.google.com/search?q='
        }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def search_and_scrape(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        urls = await self._get_search_results(query, max_results)
        
        results = []
        async with httpx.AsyncClient(timeout=30.0, headers=self.headers, follow_redirects=True) as client:
            for url in urls:
                try:
                    if 'duckduckgo.com/y.js' in url or 'bing.com/aclick' in url:
                        continue
                        
                    content = await self._scrape_page(client, url)
                    if content and content.get('content'):
                        results.append(content)
                except Exception as e:
                    print(f"Error scraping {url}: {e}")
                    continue
        
        return results
    
    async def _get_search_results(self, query: str, max_results: int) -> List[str]:
        urls = []
        search_url = self.search_engines['duckduckgo'] + quote_plus(query)
        
        async with httpx.AsyncClient(timeout=30.0, headers=self.headers) as client:
            try:
                response = await client.get(search_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                for link in soup.find_all('a', class_='result__a'):
                    href = link.get('href')
                    if href and href.startswith('http') and 'duckduckgo.com' not in href:
                        urls.append(href)
                        if len(urls) >= max_results:
                            break
                
                for result in soup.find_all('div', class_='result'):
                    link = result.find('a', class_='result__url')
                    if link:
                        url_text = link.get_text(strip=True)
                        if url_text.startswith('http'):
                            urls.append(url_text)
                        elif not url_text.startswith('/'):
                            urls.append(f"https://{url_text}")
                        
                        if len(urls) >= max_results:
                            break
                
                seen = set()
                unique_urls = []
                for url in urls:
                    if url not in seen:
                        seen.add(url)
                        unique_urls.append(url)
                
                urls = unique_urls[:max_results]
                
            except Exception as e:
                print(f"Search error: {e}")
        
        return urls
    
    async def _scrape_page(self, client: httpx.AsyncClient, url: str) -> Dict[str, str]:
        content = {
            'url': url,
            'title': '',
            'content': ''
        }
        
        try:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            title_tag = soup.find('title')
            if title_tag:
                content['title'] = title_tag.get_text(strip=True)
            
            for script in soup(['script', 'style', 'meta', 'link', 'noscript']):
                script.decompose()
            
            main_content = None
            for selector in ['main', 'article', '[role="main"]', '#content', '.content', 'body']:
                main_content = soup.find(selector)
                if main_content:
                    break
            
            if not main_content:
                main_content = soup.find('body')
            
            if main_content:
                text = main_content.get_text(separator=' ', strip=True)
                
                text = re.sub(r'\s+', ' ', text)
                text = re.sub(r'\n+', ' ', text) 
                
                lines = text.split('.')
                meaningful_lines = [line.strip() for line in lines if len(line.strip()) > 30]
                text = '. '.join(meaningful_lines)
                
                content['content'] = text[:5000]
            
        except httpx.HTTPStatusError as e:
            print(f"HTTP error for {url}: {e}")
        except Exception as e:
            print(f"Error scraping {url}: {e}")
        
        return content

web_scraper_agent = WebScraperAgent()
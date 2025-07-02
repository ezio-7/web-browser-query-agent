from app.services import gemini_service
from typing import List, Dict

class SummarizerAgent:
    def __init__(self):
        self.gemini = gemini_service
    
    async def summarize_results(self, query: str, results: List[Dict[str, str]]) -> str:
        """Create a single comprehensive summary from all search results"""
        
        # Combine all content
        combined_content = ""
        for i, result in enumerate(results, 1):
            combined_content += f"\nSource {i} ({result['title']}):\n{result['content'][:1500]}\n"
        
        prompt = f"""
        You are a helpful search assistant. Based on the search results below, provide a comprehensive answer to the user's query.
        
        User Query: "{query}"
        
        Search Results:
        {combined_content}
        
        Instructions:
        1. Synthesize information from all sources into one coherent answer
        2. Focus on directly answering the user's question
        3. Include specific places, attractions, or information mentioned
        4. Do NOT mention website names or sources
        5. Write in a natural, conversational tone
        6. Make it informative and actionable
        7. If the query asks for "best places" or similar, provide a clear list
        8. Keep the response concise but comprehensive (around 200-300 words)
        
        Provide the answer as if you're a knowledgeable local guide or expert on the topic.
        """
        
        try:
            summary = await self.gemini.generate_content(prompt)
            if summary:
                return summary.strip()
            else:
                # Fallback summary
                return self._create_fallback_summary(query, results)
        except Exception as e:
            print(f"Summarization error: {e}")
            return self._create_fallback_summary(query, results)
    
    def _create_fallback_summary(self, query: str, results: List[Dict[str, str]]) -> str:
        """Create a basic summary if AI fails"""
        if not results:
            return "No relevant information found for your query."
        
        # Extract key information from titles and content
        summary = f"Based on the search for '{query}', here's what was found: "
        
        key_points = []
        for result in results[:3]:
            # Extract first meaningful sentence from content
            if result['content']:
                sentences = result['content'].split('.')
                for sentence in sentences:
                    if len(sentence.strip()) > 50:
                        key_points.append(sentence.strip())
                        break
        
        if key_points:
            summary += " ".join(key_points[:2])
        else:
            summary += "Multiple relevant sources were found, but specific details couldn't be extracted."
        
        return summary

summarizer_agent = SummarizerAgent()
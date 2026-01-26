"""
OpenAI integration for SQL generation from natural language queries.
"""
import os
from typing import Optional

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


def generate_sql_from_query(natural_language_query: str) -> Optional[str]:
    """
    Convert natural language query to SQL using OpenAI.
    
    Args:
        natural_language_query: User's question in natural language
        
    Returns:
        Generated SQL query string or None if OpenAI is not available
    """
    if not HAS_OPENAI:
        return None
    
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    
    try:
        openai.api_key = api_key
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert. Convert natural language queries to SQL for a golden_records table with columns: id, email, phone, first_name, last_name, address, city, state, zip, source, created_at, updated_at. Always use proper SQL syntax and include WHERE clauses for date filtering when relevant."
                },
                {
                    "role": "user",
                    "content": natural_language_query
                }
            ],
            temperature=0.3,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


import requests
import trafilatura

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

def fetch_and_extract(url: str) -> str:
    """Fetch the article and return cleaned main text."""
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
    resp.raise_for_status()

    # Extract main content using trafilatura
    text = trafilatura.extract(
        resp.text,
        include_comments=False,
        include_tables=False,
        include_images=False,
        include_links=False,
        output_format="text"
    )
    
    if not text:
        # Fallback: try with decoded HTML content if text extraction fails
        text = trafilatura.extract(
            resp.content.decode('utf-8', errors='ignore'),
            include_comments=False,
            include_tables=False,
            include_images=False,
            include_links=False,
            output_format="text"
        )
    
    if not text:
        raise ValueError("Could not extract text content from the URL")
    
    # Clean up the text
    text = text.strip().replace("\u00a0", " ")
    
    return text

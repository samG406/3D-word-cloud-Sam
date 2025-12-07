import requests
import trafilatura

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

def fetch_and_extract(url: str) -> str:
    http_response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
    http_response.raise_for_status()

    extracted_content = trafilatura.extract(
        http_response.text,
        include_comments=False,
        include_tables=False,
        include_images=False,
        include_links=False,
        output_format="text"
    )
    
    if not extracted_content:
        extracted_content = trafilatura.extract(
            http_response.content.decode('utf-8', errors='ignore'),
            include_comments=False,
            include_tables=False,
            include_images=False,
            include_links=False,
            output_format="text"
        )
    
    if not extracted_content:
        raise ValueError("Could not extract text content from the URL")
    
    cleaned_text = extracted_content.strip().replace("\u00a0", " ")
    
    return cleaned_text

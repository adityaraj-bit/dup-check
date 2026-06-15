import os
import google.generativeai as genai
import json
import sys

# Configure the API key from environment variable
# Run this script like: GEMINI_API_KEY="your_key" python test_gemini_prompt.py text_image.png
api_key = os.environ.get("GEMINI_API_KEY", "")
if not api_key:
    print("WARNING: GEMINI_API_KEY environment variable not set. Please set it before running.")
    print("Example: export GEMINI_API_KEY='your_api_key_here'")

genai.configure(api_key=api_key)

# ==========================================
# THE PROMPT
# ==========================================
PROMPT = """
Analyze the provided product image and extract all technical specifications, measurements, and relevant text.
Your output must be STRICTLY valid JSON matching the exact structure below. Do not include markdown blocks (e.g. ```json).

{
  "raw_text": "A full dump of all the readable text in the image",
  "specs": {
    "product_dimensions": ["strict format: Length x Width x Depth/Height [unit], e.g. 200x180x50cm or 137x153cm"],
    "package_or_shell_dimensions": ["strict format: Length x Width x Depth [unit], e.g. 22x10x5in"],
    "clothing_size": ["S", "M", "L", "XL", "etc"],
    "volume_quarts": ["e.g. 5 qt", "1.5 quarts"],
    "weight": "extracted weight here, e.g. 45 kg",
    "color": "extracted color",
    "voltage": "e.g. 220v",
    "wattage": "e.g. 50w",
    "other_specs": {
        "Material": "example material",
        "Processor": "example processor",
        "RAM": "example RAM",
        "Storage": "example storage",
        "Compatibility": "what it fits or is designed for",
        "Package Contents": "what is included"
    }
  }
}

Rules:
1. If a specific field is not found in the image, omit it entirely from the JSON or leave it null.
2. DIMENSIONS FORMATTING: You must normalize all 2D or 3D measurements into the strict format `L x W x D unit` (e.g., "10 x 5 x 2 cm" or "10 x 5 cm"). Do not include words like "Length" or "Width" in the output string, just the numbers, the 'x' separator, and the unit.
3. PRODUCT VS SHELL: Intelligently separate the dimensions of the core "product" itself from the dimensions of the "shell", "packaging", or "box" it comes in. Put them in their respective arrays.
4. The "other_specs" object is a catch-all for stone color, metal, cut, purity, karat, vehicle fitment, part numbers, etc.
5. ONLY return the raw JSON object. No extra text, no explanations, no markdown formatting.
"""

def extract_specs_from_image(image_path):
    import requests
    import base64
    
    print(f"Loading image '{image_path}'...")
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return

    # Convert image to base64
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    
    print(f"Sending prompt to Gemini 3.5 Flash using raw REST API...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {"inlineData": {
                    "mimeType": "image/png",
                    "data": encoded_string
                }}
            ]
        }]
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        print(f"API Error ({response.status_code}): {response.text}")
        return
        
    try:
        response_data = response.json()
        raw_output = response_data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"Failed to parse API response structure: {e}")
        print(response.text)
        return
    
    print("\n" + "="*40)
    print("RAW RESPONSE FROM GEMINI:")
    print("="*40)
    print(raw_output)
    
    print("\n" + "="*40)
    print("PARSED JSON DICTIONARY:")
    print("="*40)
    try:
        # Strip potential markdown formatting if the model includes it by mistake
        clean_text = raw_output.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        data = json.loads(clean_text.strip())
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Failed to parse JSON. Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_specs_from_image(sys.argv[1])
    else:
        print("Usage: python test_gemini_prompt.py <path_to_image>")
        print("Example: python test_gemini_prompt.py text_image.png")

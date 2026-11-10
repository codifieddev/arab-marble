import requests

for url in [
    'http://localhost:3000/category/marble',
    'http://localhost:3000/product-category/marble',
    'http://localhost:3000/product-category',
    'http://localhost:3000/shop'
]:
    res = requests.get(url)
    print(f"{url} -> status={res.status_code}")
    if 'Something went wrong' in res.text:
        import re
        err = re.findall(r'<div[^>]*>([^<]*(?:error|is not a function|cannot read)[^<]*)</div>', res.text)
        print("  Error:", err)
    elif 'No products in catalog' in res.text:
        print("  Has 'No products in catalog'")
    else:
        print(f"  OK (len={len(res.text)})")


import requests

for cat in ['marble', 'all', '', 'product-category']:
    url = f'http://localhost:3000/api/commerce/products?category={cat}'
    res = requests.get(url)
    data = res.json()
    items = data.get('data', [])
    print(f'cat="{cat}" -> status={res.status_code}, items={len(items)}')


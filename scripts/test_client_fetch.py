import requests

headers = {
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
}

res = requests.get('http://localhost:3000/api/commerce/products', headers=headers)
print('Status:', res.status_code)
print('Text:', res.text[:300])


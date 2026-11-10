import pymongo
import pprint

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
pk = client['kp_peekeeper']
am = client['kp_arab_marble']

print("=== PEEKEEPER BLUEPRINTS V2 ===")
for bp in pk['business_blueprints_v2'].find():
    p = bp.get('payload', {})
    print("BP keys:", bp.keys())
    print("Payload keys:", p.keys())
    for k in p:
        if 'permalink' in k.lower() or 'route' in k.lower() or 'url' in k.lower() or 'shop' in k.lower() or 'seo' in k.lower():
            print(f"  {k}:", p[k])

print("\n=== ARAB MARBLE BLUEPRINTS V2 ===")
for bp in am['business_blueprints_v2'].find():
    p = bp.get('payload', {})
    print("BP keys:", bp.keys())
    print("Payload keys:", p.keys())
    for k in p:
        if 'permalink' in k.lower() or 'route' in k.lower() or 'url' in k.lower() or 'shop' in k.lower() or 'seo' in k.lower():
            print(f"  {k}:", p[k])


import pymongo
import pprint

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
pk = client['kp_peekeeper']
am = client['kp_arab_marble']

print("=== PEEKEEPER BUSINESS BLUEPRINTS ===")
for bp in pk['business_blueprints'].find():
    pprint.pprint({k: bp[k] for k in bp if 'permalink' in k.lower() or 'route' in k.lower() or 'url' in k.lower() or 'ecommerce' in k.lower() or 'catalog' in k.lower() or 'shop' in k.lower()})

print("\n=== ARAB MARBLE BUSINESS BLUEPRINTS ===")
for bp in am['business_blueprints'].find():
    pprint.pprint({k: bp[k] for k in bp if 'permalink' in k.lower() or 'route' in k.lower() or 'url' in k.lower() or 'ecommerce' in k.lower() or 'catalog' in k.lower() or 'shop' in k.lower()})


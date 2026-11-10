import pymongo
import pprint

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
pk = client['kp_peekeeper']
am = client['kp_arab_marble']

print("=== PEEKEEPER permalinkDetails ===")
pk_bp = pk['business_blueprints_v2'].find_one()
pprint.pprint(pk_bp.get('permalinkDetails'))

print("\n=== ARAB MARBLE permalinkDetails ===")
am_bp = am['business_blueprints_v2'].find_one()
pprint.pprint(am_bp.get('permalinkDetails'))


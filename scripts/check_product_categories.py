import pymongo

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

print("--- COMMERCE CATEGORIES ---")
for c in db['commerce_categories'].find():
    print(f"ID: {c.get('_id')} | Name: {c.get('name')} | Slug: {c.get('slug')}")

print("\n--- SAMPLE PRODUCTS CATEGORY FIELDS ---")
for p in db['commerce_products'].find().limit(5):
    print(f"Name: {p.get('name')}")
    print(f"  categoryIds: {p.get('categoryIds')}")
    print(f"  categorySlugs: {p.get('categorySlugs')}")
    print(f"  primaryCategoryId: {p.get('primaryCategoryId')}")
    print(f"  category: {p.get('category')}")
    print(f"  tags: {p.get('tags')}")


import pymongo
from datetime import datetime

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

# Standard customer testimonials with clean strings (matching kp_peekeeper / kalp standard)
standard_testimonials = [
    {
        "id": "arab-marble-testimonial-1",
        "document_key": "testimonials-arab-marble-1",
        "name": "Eng. Tariq Al Hashimi",
        "author": "Eng. Tariq Al Hashimi",
        "role": "Managing Director, Al Hashimi Architecture & Engineering",
        "quote": "Arab Marble supplied and installed over 4,500 sqm of book-matched Calacatta Oro and Crema Marfil for our luxury villa project in Emirates Hills. The precision waterjet cutting and seamless vein matching were world-class.",
        "text": "Arab Marble supplied and installed over 4,500 sqm of book-matched Calacatta Oro and Crema Marfil for our luxury villa project in Emirates Hills. The precision waterjet cutting and seamless vein matching were world-class.",
        "rating": 5,
        "verified": True,
        "avatar": "",
        "status": "approved",
        "source": "Website Review",
        "tenant_slug": "arab-marble",
        "tenantKey": "arab-marble",
        "date": "2026-03-15",
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "arab-marble-testimonial-2",
        "document_key": "testimonials-arab-marble-2",
        "name": "Elena Rostova",
        "author": "Elena Rostova",
        "role": "Head of Interior Design, Studio Luxe Abu Dhabi",
        "quote": "Finding consistent, high-grade Omani Beige slabs for large-scale hotel lobbies used to be our biggest challenge until we partnered with Arab Marble. Their direct quarry access and on-time delivery set the gold standard in the UAE.",
        "text": "Finding consistent, high-grade Omani Beige slabs for large-scale hotel lobbies used to be our biggest challenge until we partnered with Arab Marble. Their direct quarry access and on-time delivery set the gold standard in the UAE.",
        "rating": 5,
        "verified": True,
        "avatar": "",
        "status": "approved",
        "source": "Website Review",
        "tenant_slug": "arab-marble",
        "tenantKey": "arab-marble",
        "date": "2026-04-02",
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "arab-marble-testimonial-3",
        "document_key": "testimonials-arab-marble-3",
        "name": "Rashid Bin Butti Al Qubaisi",
        "author": "Rashid Bin Butti Al Qubaisi",
        "role": "Project Director, Al Qubaisi Developments",
        "quote": "Having collaborated with Arab Marble across several commercial towers in Mussafah and Abu Dhabi Downtown, their craftsmanship, stone calibration, and dry-lay fixing capabilities are simply unmatched.",
        "text": "Having collaborated with Arab Marble across several commercial towers in Mussafah and Abu Dhabi Downtown, their craftsmanship, stone calibration, and dry-lay fixing capabilities are simply unmatched.",
        "rating": 5,
        "verified": True,
        "avatar": "",
        "status": "approved",
        "source": "Website Review",
        "tenant_slug": "arab-marble",
        "tenantKey": "arab-marble",
        "date": "2026-05-18",
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "arab-marble-testimonial-4",
        "document_key": "testimonials-arab-marble-4",
        "name": "Marcus Vance",
        "author": "Marcus Vance",
        "role": "Principal Architect, Vance & Associates International",
        "quote": "From selecting rare Dark Emperador and Statuario blocks at their Abu Dhabi yard to final polish and on-site fixing, the technical expertise of Arab Marble ensured absolute perfection on our landmark project.",
        "text": "From selecting rare Dark Emperador and Statuario blocks at their Abu Dhabi yard to final polish and on-site fixing, the technical expertise of Arab Marble ensured absolute perfection on our landmark project.",
        "rating": 5,
        "verified": True,
        "avatar": "",
        "status": "approved",
        "source": "Website Review",
        "tenant_slug": "arab-marble",
        "tenantKey": "arab-marble",
        "date": "2026-06-10",
        "updatedAt": datetime.utcnow()
    }
]

# 1. Update cms_testimonials collection
print("Restoring cms_testimonials...")
for item in standard_testimonials:
    db['cms_testimonials'].update_one(
        {"id": item["id"]},
        {"$set": item},
        upsert=True
    )

# 2. Update site_pages home block
print("Updating site_pages home testimonials block...")
home = db['site_pages'].find_one({"slug": "home"})
if home:
    blocks = home.get("blocks", [])
    for block in blocks:
        if block.get("type") == "testimonials":
            # Section titles remain bilingual
            block["props"]["heading"] = {
                "en": "Client Experiences",
                "ar": "آراء عملائنا"
            }
            block["props"]["subheading"] = {
                "en": "What our clients say about our marble & granite craftsmanship",
                "ar": "ماذا يقول عملاؤنا عن حرفيتنا في الرخام والجرانيت"
            }
            block["props"]["tag"] = {
                "en": "Testimonials",
                "ar": "آراء العملاء"
            }
            block["props"]["ctaText"] = {
                "en": "View All Projects",
                "ar": "عرض جميع المشاريع"
            }
            block["props"]["items"] = standard_testimonials
            block["props"]["compiledTestimonials"] = standard_testimonials

    db['site_pages'].update_one(
        {"_id": home["_id"]},
        {
            "$set": {
                "blocks": blocks,
                "content": blocks,
                "payload.blocks": blocks,
                "payload.content": blocks,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    rev_id = home.get("publishedRevisionId")
    if rev_id:
        db['cms_page_revisions'].update_one(
            {"revisionId": rev_id},
            {"$set": {"snapshot.blocks": blocks}}
        )
    print("Home page testimonials block updated successfully.")

print("Done! Testimonials restored to standard clean strings.")


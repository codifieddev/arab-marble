from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

MONGO_URI = "mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin"
client = MongoClient(MONGO_URI)
db = client["kp_arab_marble"]

print("Connected to kp_arab_marble MongoDB")

# 1. Update business_blueprints_v2
print("Updating business_blueprints_v2...")
db["business_blueprints_v2"].update_many(
    {},
    {
        "$set": {
            "localization": {
                "defaultLanguage": "en",
                "languages": [
                    {"code": "en", "name": "English", "enabled": True},
                    {"code": "ar", "name": "Arabic", "enabled": True}
                ],
                "defaultCurrency": "AED",
                "currencies": [
                    {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": True},
                    {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "enabled": True}
                ],
                "timezone": "Asia/Dubai",
                "country": "AE",
                "textDirection": "ltr"
            },
            "updatedAt": datetime.utcnow()
        }
    }
)

# 2. Update business_blueprints (v1)
print("Updating business_blueprints...")
db["business_blueprints"].update_one(
    {"document_key": "blueprint"},
    {
        "$set": {
            "payload.localization": {
                "languages": {
                    "default": "en",
                    "available": [
                        {"code": "en", "name": "English", "enabled": True},
                        {"code": "ar", "name": "Arabic", "enabled": True}
                    ]
                },
                "currencies": {
                    "default": "AED",
                    "available": [
                        {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": True},
                        {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "enabled": True}
                    ]
                },
                "timezone": "Asia/Dubai",
                "country": "AE",
                "defaultLanguage": "en"
            },
            "updatedAt": datetime.utcnow()
        }
    }
)

# 3. Update cms_header
print("Updating cms_header...")
header_menu = [
    {
        "label": {"en": "HOME", "ar": "الرئيسية"},
        "path": "/",
        "icon": None,
        "badge": None,
        "target": None,
        "description": None,
        "megaMenu": None,
        "menuKey": None,
        "permalinkType": "home",
        "permalinkTarget": None,
        "children": None,
        "isActive": True
    },
    {
        "label": {"en": "PRODUCTS", "ar": "المنتجات"},
        "path": "/shop",
        "icon": None,
        "badge": None,
        "target": None,
        "description": None,
        "megaMenu": None,
        "menuKey": None,
        "permalinkType": "shop",
        "permalinkTarget": None,
        "children": [
            {
                "label": {"en": "Marble", "ar": "رخام"},
                "path": "/category/marble",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "category",
                "permalinkTarget": "marble",
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Granite", "ar": "جرانيت"},
                "path": "/category/granite",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "category",
                "permalinkTarget": "granite",
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Natural Stones", "ar": "أحجار طبيعية"},
                "path": "/category/natural-stones",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "category",
                "permalinkTarget": "natural-stones",
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Artificial Stones", "ar": "أحجار صناعية"},
                "path": "/category/artificial-stones",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "category",
                "permalinkTarget": "artificial-stones",
                "children": None,
                "isActive": True
            }
        ],
        "isActive": True
    },
    {
        "label": {"en": "PROJECTS", "ar": "المشاريع"},
        "path": "/projects/latest",
        "icon": None,
        "badge": None,
        "target": None,
        "description": None,
        "megaMenu": None,
        "menuKey": None,
        "permalinkType": "custom",
        "permalinkTarget": None,
        "children": [
            {
                "label": {"en": "Latest Projects", "ar": "أحدث المشاريع"},
                "path": "/projects/latest",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "custom",
                "permalinkTarget": None,
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Iconic Projects", "ar": "مشاريع مميزة"},
                "path": "/projects/iconic",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "custom",
                "permalinkTarget": None,
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Commercial Projects", "ar": "مشاريع تجارية"},
                "path": "/projects/commercial",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "custom",
                "permalinkTarget": None,
                "children": None,
                "isActive": True
            },
            {
                "label": {"en": "Custom Projects", "ar": "مشاريع مخصصة"},
                "path": "/projects/custom",
                "icon": None,
                "badge": None,
                "target": None,
                "description": None,
                "megaMenu": None,
                "menuKey": None,
                "permalinkType": "custom",
                "permalinkTarget": None,
                "children": None,
                "isActive": True
            }
        ],
        "isActive": True
    },
    {
        "label": {"en": "ABOUT US", "ar": "من نحن"},
        "path": "/about",
        "icon": None,
        "badge": None,
        "target": None,
        "description": None,
        "megaMenu": None,
        "menuKey": None,
        "permalinkType": "page",
        "permalinkTarget": "about",
        "children": None,
        "isActive": True
    },
    {
        "label": {"en": "CONTACT US", "ar": "اتصل بنا"},
        "path": "/contact",
        "icon": None,
        "badge": None,
        "target": None,
        "description": None,
        "megaMenu": None,
        "menuKey": None,
        "permalinkType": "page",
        "permalinkTarget": "contact",
        "children": None,
        "isActive": True
    }
]

db["cms_header"].update_many(
    {},
    {
        "$set": {
            "WebsiteName": {
                "title": {"en": "Arab Marble", "ar": "الرخام العربي"},
                "subTitle": {"en": "Natural Stones & Marble", "ar": "الرخام والأحجار الطبيعية"},
                "isActive": True,
                "url": "/"
            },
            "logo.text": {"en": "Arab Marble", "ar": "الرخام العربي"},
            "logo.alt": {"en": "Arab Marble", "ar": "الرخام العربي"},
            "menu": header_menu,
            "language": {
                "enabled": True,
                "default": "en"
            },
            "updatedAt": datetime.utcnow()
        }
    }
)

# 4. Update cms_footer
print("Updating cms_footer...")
footer_quick_links = [
    {
        "title": {"en": "Products", "ar": "المنتجات"},
        "links": [
            {
                "label": {"en": "Marble", "ar": "رخام"},
                "href": "/category/marble",
                "permalinkType": "category",
                "permalinkTarget": "marble"
            },
            {
                "label": {"en": "Granite", "ar": "جرانيت"},
                "href": "/category/granite",
                "permalinkType": "category",
                "permalinkTarget": "granite"
            },
            {
                "label": {"en": "Natural Stones", "ar": "أحجار طبيعية"},
                "href": "/category/natural-stones",
                "permalinkType": "category",
                "permalinkTarget": "natural-stones"
            },
            {
                "label": {"en": "Artificial Stones", "ar": "أحجار صناعية"},
                "href": "/category/artificial-stones",
                "permalinkType": "category",
                "permalinkTarget": "artificial-stones"
            }
        ]
    },
    {
        "title": {"en": "Projects", "ar": "المشاريع"},
        "links": [
            {
                "label": {"en": "Latest Projects", "ar": "أحدث المشاريع"},
                "href": "/projects/latest",
                "permalinkType": "custom"
            },
            {
                "label": {"en": "Iconic Projects", "ar": "مشاريع مميزة"},
                "href": "/projects/iconic",
                "permalinkType": "custom"
            },
            {
                "label": {"en": "Commercial Projects", "ar": "مشاريع تجارية"},
                "href": "/projects/commercial",
                "permalinkType": "custom"
            },
            {
                "label": {"en": "Custom Projects", "ar": "مشاريع مخصصة"},
                "href": "/projects/custom",
                "permalinkType": "custom"
            }
        ]
    },
    {
        "title": {"en": "Company", "ar": "الشركة"},
        "links": [
            {
                "label": {"en": "About Us", "ar": "من نحن"},
                "href": "/about",
                "permalinkType": "page",
                "permalinkTarget": "about"
            },
            {
                "label": {"en": "Promotions", "ar": "العروض الترويجية"},
                "href": "/promotions",
                "permalinkType": "page",
                "permalinkTarget": "promotions"
            },
            {
                "label": {"en": "Contact Us", "ar": "اتصل بنا"},
                "href": "/contact",
                "permalinkType": "page",
                "permalinkTarget": "contact"
            }
        ]
    }
]

db["cms_footer"].update_many(
    {},
    {
        "$set": {
            "brand": {
                "name": {"en": "Arab Marble", "ar": "الرخام العربي"},
                "description": {
                    "en": "Arab Marble was established in Abu Dhabi in 1973. Exclusive distributor of Omani Beige marble, Italian marble, and natural stone solutions across the UAE.",
                    "ar": "تأسست شركة الرخام العربي في أبوظبي عام 1973. الموزع الحصري لرخام بيج عماني والرخام الإيطالي وحلول الأحجار الطبيعية في جميع أنحاء الإمارات العربية المتحدة."
                }
            },
            "quickLinksColumns": footer_quick_links,
            "navigation": footer_quick_links,
            "copyright": {
                "en": "Copyright © {year} | ARAB MARBLE | All Rights Reserved",
                "ar": "حقوق النشر © {year} | الرخام العربي | جميع الحقوق محفوظة"
            },
            "contact": {
                "title": {"en": "Contact Us", "ar": "اتصل بنا"},
                "name": {"en": "Arab Marble Est.", "ar": "مؤسسة الرخام العربي"},
                "phone": "+971 2 555 4008",
                "fax": "+971 2 555 4005",
                "email": "am@arabmarble.ae",
                "address": {
                    "en": "Arab Marble, Mussafah Abu Dhabi - UAE\nP.O.Box: 3835",
                    "ar": "الرخام العربي، مصفح أبوظبي - الإمارات\nص.ب: 3835"
                }
            },
            "companyInfo": {
                "name": {"en": "Arab Marble Est.", "ar": "مؤسسة الرخام العربي"},
                "phone": "+971 2 555 4008",
                "fax": "+971 2 555 4005",
                "email": "am@arabmarble.ae",
                "address": {
                    "en": "Arab Marble, Mussafah Abu Dhabi - UAE\nP.O.Box: 3835",
                    "ar": "الرخام العربي، مصفح أبوظبي - الإمارات\nص.ب: 3835"
                }
            },
            "updatedAt": datetime.utcnow()
        }
    }
)

# 5. Update cms_menus
print("Updating cms_menus...")
db["cms_menus"].update_many(
    {"key": "primary"},
    {
        "$set": {
            "columns": [
                {
                    "width": "1fr",
                    "sections": [
                        {
                            "heading": {"en": "Explore", "ar": "استكشف"},
                            "links": [
                                {"title": {"en": "Home", "ar": "الرئيسية"}, "href": "/"},
                                {"title": {"en": "Shop", "ar": "المنتجات"}, "href": "/shop"},
                                {"title": {"en": "About", "ar": "من نحن"}, "href": "/about"},
                                {"title": {"en": "Contact", "ar": "اتصل بنا"}, "href": "/contact"}
                            ]
                        }
                    ]
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# 6. Update cms_testimonials (standard reviews schema with clean strings)
print("Updating cms_testimonials...")
testimonials_data = {
    "arab-marble-testimonial-1": {
        "name": "Eng. Tariq Al Hashimi",
        "author": "Eng. Tariq Al Hashimi",
        "role": "Managing Director, Al Hashimi Architecture & Engineering",
        "quote": "Arab Marble supplied and installed over 4,500 sqm of book-matched Calacatta Oro and Crema Marfil for our luxury villa project in Emirates Hills. The precision waterjet cutting and seamless vein matching were world-class.",
        "text": "Arab Marble supplied and installed over 4,500 sqm of book-matched Calacatta Oro and Crema Marfil for our luxury villa project in Emirates Hills. The precision waterjet cutting and seamless vein matching were world-class.",
        "status": "approved"
    },
    "arab-marble-testimonial-2": {
        "name": "Elena Rostova",
        "author": "Elena Rostova",
        "role": "Head of Interior Design, Studio Luxe Abu Dhabi",
        "quote": "Finding consistent, high-grade Omani Beige slabs for large-scale hotel lobbies used to be our biggest challenge until we partnered with Arab Marble. Their direct quarry access and on-time delivery set the gold standard in the UAE.",
        "text": "Finding consistent, high-grade Omani Beige slabs for large-scale hotel lobbies used to be our biggest challenge until we partnered with Arab Marble. Their direct quarry access and on-time delivery set the gold standard in the UAE.",
        "status": "approved"
    },
    "arab-marble-testimonial-3": {
        "name": "Rashid Bin Butti Al Qubaisi",
        "author": "Rashid Bin Butti Al Qubaisi",
        "role": "Project Director, Al Qubaisi Developments",
        "quote": "Having collaborated with Arab Marble across several commercial towers in Mussafah and Abu Dhabi Downtown, their craftsmanship, stone calibration, and dry-lay fixing capabilities are simply unmatched.",
        "text": "Having collaborated with Arab Marble across several commercial towers in Mussafah and Abu Dhabi Downtown, their craftsmanship, stone calibration, and dry-lay fixing capabilities are simply unmatched.",
        "status": "approved"
    },
    "arab-marble-testimonial-4": {
        "name": "Marcus Vance",
        "author": "Marcus Vance",
        "role": "Principal Architect, Vance & Associates International",
        "quote": "From selecting rare Dark Emperador and Statuario blocks at their Abu Dhabi yard to final polish and on-site fixing, the technical expertise of Arab Marble ensured absolute perfection on our landmark project.",
        "text": "From selecting rare Dark Emperador and Statuario blocks at their Abu Dhabi yard to final polish and on-site fixing, the technical expertise of Arab Marble ensured absolute perfection on our landmark project.",
        "status": "approved"
    }
}

for doc_id, fields in testimonials_data.items():
    db["cms_testimonials"].update_one(
        {"id": doc_id},
        {"$set": {**fields, "updatedAt": datetime.utcnow()}}
    )

# 7. Update all 12 site_pages
print("Updating site_pages...")

# HOME
compiled_testimonials_list = [
    {
        "id": "arab-marble-testimonial-1",
        "name": "Eng. Tariq Al Hashimi",
        "author": "Eng. Tariq Al Hashimi",
        "role": "Managing Director, Al Hashimi Architecture & Engineering",
        "quote": "Arab Marble supplied and installed over 4,500 sqm of book-matched Calacatta Oro and Crema Marfil for our luxury villa project in Emirates Hills. The precision waterjet cutting and seamless vein matching were world-class.",
        "rating": 5,
        "verified": True
    },
    {
        "id": "arab-marble-testimonial-2",
        "name": "Elena Rostova",
        "author": "Elena Rostova",
        "role": "Head of Interior Design, Studio Luxe Abu Dhabi",
        "quote": "Finding consistent, high-grade Omani Beige slabs for large-scale hotel lobbies used to be our biggest challenge until we partnered with Arab Marble. Their direct quarry access and on-time delivery set the gold standard in the UAE.",
        "rating": 5,
        "verified": True
    },
    {
        "id": "arab-marble-testimonial-3",
        "name": "Rashid Bin Butti Al Qubaisi",
        "author": "Rashid Bin Butti Al Qubaisi",
        "role": "Project Director, Al Qubaisi Developments",
        "quote": "Having collaborated with Arab Marble across several commercial towers in Mussafah and Abu Dhabi Downtown, their craftsmanship, stone calibration, and dry-lay fixing capabilities are simply unmatched.",
        "rating": 5,
        "verified": True
    },
    {
        "id": "arab-marble-testimonial-4",
        "name": "Marcus Vance",
        "author": "Marcus Vance",
        "role": "Principal Architect, Vance & Associates International",
        "quote": "From selecting rare Dark Emperador and Statuario blocks at their Abu Dhabi yard to final polish and on-site fixing, the technical expertise of Arab Marble ensured absolute perfection on our landmark project.",
        "rating": 5,
        "verified": True
    }
]

home_blocks = [
    {
        "id": "hero-home",
        "type": "hero",
        "props": {
            "heading": {
                "en": "Create.\nBuild.\nDesign.",
                "ar": "ابتكر.\nابنِ.\nصمم."
            },
            "subheading": {
                "en": "Premium Natural Stones & Marble in Abu Dhabi since 1973",
                "ar": "أرقى الأحجار الطبيعية والرخام في أبوظبي منذ 1973"
            },
            "backgroundImage": "/images/home-hero.jpg",
            "cta": {
                "label": {
                    "en": "Explore Products",
                    "ar": "استكشف المنتجات"
                },
                "href": "/shop"
            }
        }
    },
    {
        "id": "who-we-are",
        "type": "about-story",
        "props": {
            "tag": {
                "en": "WHO WE ARE",
                "ar": "من نحن"
            },
            "heading": {
                "en": "Who Are We",
                "ar": "من نحن"
            },
            "paragraphs": [
                {
                    "en": "Arab Marble was established in Abu Dhabi in 1973.\nEver since its inception, Arab Marble has played a pivotal role in the Abu Dhabi Market for Marble and Granite. Arab Marble engages in the wholesale and retail distribution and fixing of marble and granite for special decorative works, palaces, hotels, villas and high-rise prestigious and commercial buildings. Our supplier's network encompasses more than 350 stone processing factories worldwide.",
                    "ar": "تأسست شركة الرخام العربي في أبوظبي عام 1973.\nمنذ تأسيسها، لعبت الرخام العربي دوراً محورياً في سوق أبوظبي للرخام والجرانيت. وتعمل الشركة في توزيع وتركيب الرخام والجرانيت بالجملة والتجزئة للأعمال الديكورية الخاصة والقصور والفنادق والفلل والأبراج السكنية والتجارية المرموقة. وتضم شبكة موردينا أكثر من 350 مصنعاً لمعالجة الأحجار حول العالم."
                },
                {
                    "en": "We are an exclusive distributor of Omani Beige marble in Abu Dhabi & Al Ain area.",
                    "ar": "نحن الموزع الحصري لرخام بيج عماني في منطقة أبوظبي والعين."
                }
            ],
            "image": "/images/who-we-are.jpg",
            "imageAlt": {
                "en": "Arab Marble Stonework Sculpture",
                "ar": "منحوتات وأعمال الرخام العربي الحجرية"
            }
        }
    },
    {
        "id": "statement-section",
        "type": "statement",
        "props": {
            "text": {
                "en": "Arab Marble has completed and executed works in Abu Dhabi, Dubai, Sharjah, Al Ain, Ajman, Kuwait, Bahrain and Qatar.",
                "ar": "قامت شركة الرخام العربي بتنفيذ وإنجاز أعمال ومشاريع كبرى في أبوظبي ودبي والشارقة والعين وعجمان والكويت والبحرين وقطر."
            }
        }
    },
    {
        "id": "home-tiles-section",
        "type": "home-tiles",
        "props": {
            "leftLabel": {
                "en": "PRODUCTS",
                "ar": "المنتجات"
            },
            "leftHref": "/shop",
            "leftImage": "/images/products-tile.jpg",
            "rightLabel": {
                "en": "PROJECTS",
                "ar": "المشاريع"
            },
            "rightHref": "/projects/latest",
            "rightImage": "/images/projects-tile.jpg"
        }
    },
    {
        "id": "home-testimonials",
        "type": "testimonials",
        "props": {
            "tag": {
                "en": "CLIENT TESTIMONIALS",
                "ar": "شهادات عملائنا"
            },
            "heading": {
                "en": "WHAT OUR CLIENTS SAY",
                "ar": "ماذا يقول عملاؤنا"
            },
            "subheading": {
                "en": "Trusted by leading architects, interior designers, and luxury developers across the UAE since 1973.",
                "ar": "محل ثقة كبار المهندسين المعماريين ومصممي الديكور الداخلي والمطورين العقاريين في الإمارات منذ عام 1973."
            },
            "items": compiled_testimonials_list,
            "compiledTestimonials": compiled_testimonials_list
        }
    }
]

db["site_pages"].update_one(
    {"slug": "home"},
    {
        "$set": {
            "title": {"en": "Home", "ar": "الرئيسية"},
            "metaTitle": {"en": "Arab Marble - Natural Stones & Marble Abu Dhabi", "ar": "الرخام العربي - رخام وأحجار طبيعية أبوظبي"},
            "metaDescription": {
                "en": "Leading supplier and fixing contractor for premium marble, granite and natural stones in Abu Dhabi, UAE since 1973.",
                "ar": "المورد الرائد ومقاول التركيب للرخام والجرانيت والأحجار الطبيعية الفاخرة في أبوظبي، الإمارات منذ 1973."
            },
            "seo_title": {"en": "Arab Marble - Natural Stones & Marble Abu Dhabi", "ar": "الرخام العربي - رخام وأحجار طبيعية أبوظبي"},
            "seo_description": {
                "en": "Leading supplier and fixing contractor for premium marble, granite and natural stones in Abu Dhabi, UAE since 1973.",
                "ar": "المورد الرائد ومقاول التركيب للرخام والجرانيت والأحجار الطبيعية الفاخرة في أبوظبي، الإمارات منذ 1973."
            },
            "blocks": home_blocks,
            "updatedAt": datetime.utcnow()
        }
    }
)

# SHOP
db["site_pages"].update_one(
    {"slug": "shop"},
    {
        "$set": {
            "title": {"en": "Products", "ar": "المنتجات"},
            "metaTitle": {"en": "Stone Products | Arab Marble", "ar": "منتجات الأحجار | الرخام العربي"},
            "metaDescription": {
                "en": "Explore our complete collection of marble, granite, and natural stones.",
                "ar": "استكشف مجموعتنا الكاملة من الرخام والجرانيت والأحجار الطبيعية."
            },
            "seo_title": {"en": "Stone Products | Arab Marble", "ar": "منتجات الأحجار | الرخام العربي"},
            "seo_description": {
                "en": "Explore our complete collection of marble, granite, and natural stones.",
                "ar": "استكشف مجموعتنا الكاملة من الرخام والجرانيت والأحجار الطبيعية."
            },
            "blocks": [
                {
                    "id": "shop-main",
                    "type": "product-grid",
                    "props": {
                        "heading": {
                            "en": "Our Stone Products",
                            "ar": "منتجاتنا من الأحجار"
                        },
                        "subheading": {
                            "en": "Explore our complete collection of marble, granite, and natural stones.",
                            "ar": "استكشف مجموعتنا الكاملة من الرخام والجرانيت والأحجار الطبيعية."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# PRODUCT
db["site_pages"].update_one(
    {"slug": "product"},
    {
        "$set": {
            "title": {"en": "Product Details", "ar": "تفاصيل المنتج"},
            "metaTitle": {"en": "Product Details | Arab Marble", "ar": "تفاصيل المنتج | الرخام العربي"},
            "metaDescription": {
                "en": "View stone specifications, finish, origin and application.",
                "ar": "عرض مواصفات الحجر والتشطيب والمنشأ والاستخدامات."
            },
            "seo_title": {"en": "Product Details | Arab Marble", "ar": "تفاصيل المنتج | الرخام العربي"},
            "seo_description": {
                "en": "View stone specifications, finish, origin and application.",
                "ar": "عرض مواصفات الحجر والتشطيب والمنشأ والاستخدامات."
            },
            "updatedAt": datetime.utcnow()
        }
    }
)

# ABOUT
db["site_pages"].update_one(
    {"slug": "about"},
    {
        "$set": {
            "title": {"en": "About Arab Marble", "ar": "عن الرخام العربي"},
            "metaTitle": {"en": "About Us | Arab Marble Abu Dhabi", "ar": "من نحن | الرخام العربي أبوظبي"},
            "metaDescription": {
                "en": "Learn more about Arab Marble established in 1973 in Abu Dhabi.",
                "ar": "تعرف على المزيد حول الرخام العربي التي تأسست عام 1973 في أبوظبي."
            },
            "seo_title": {"en": "About Us | Arab Marble Abu Dhabi", "ar": "من نحن | الرخام العربي أبوظبي"},
            "seo_description": {
                "en": "Learn more about Arab Marble established in 1973 in Abu Dhabi.",
                "ar": "تعرف على المزيد حول الرخام العربي التي تأسست عام 1973 في أبوظبي."
            },
            "blocks": [
                {
                    "id": "about-hero",
                    "type": "hero.split",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "default",
                    "props": {
                        "heading": {
                            "en": "About Arab Marble",
                            "ar": "عن الرخام العربي"
                        },
                        "subheading": {
                            "en": "A premier stone and marble enterprise established in Abu Dhabi in 1973, built on trust, quality craftsmanship, and timeless elegance.",
                            "ar": "مؤسسة رائدة في تجارة وتركيب الرخام والأحجار الطبيعية تأسست في أبوظبي عام 1973، قائمة على الثقة والحرفية العالية والفخامة الخالدة."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "About Arab Marble",
                            "ar": "عن الرخام العربي"
                        },
                        "body": {
                            "en": "A premier stone and marble enterprise established in Abu Dhabi in 1973, built on trust, quality craftsmanship, and timeless elegance.",
                            "ar": "مؤسسة رائدة في تجارة وتركيب الرخام والأحجار الطبيعية تأسست في أبوظبي عام 1973، قائمة على الثقة والحرفية العالية والفخامة الخالدة."
                        }
                    }
                },
                {
                    "id": "about-story",
                    "type": "story.feature",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "default",
                    "props": {
                        "heading": {
                            "en": "Our Legacy & Craftsmanship",
                            "ar": "تاريخنا وحرفيتنا العريقة"
                        },
                        "paragraphs": [
                            {
                                "en": "Arab Marble was established in Abu Dhabi in 1973. Ever since its inception, Arab Marble has played a pivotal role in the Abu Dhabi Market for Marble and Granite.",
                                "ar": "تأسست شركة الرخام العربي في أبوظبي عام 1973، ومنذ ذلك الحين لعبت دوراً رائداً ومحورياً في سوق الرخام والجرانيت في أبوظبي."
                            },
                            {
                                "en": "We engage in the wholesale and retail distribution and fixing of marble and granite for special decorative works, palaces, hotels, villas and high-rise commercial buildings.",
                                "ar": "نعمل في التوزيع والتركيب بالجملة والتجزئة للرخام والجرانيت للأعمال الديكورية الخاصة والقصور والفنادق والفلل والمباني التجارية الشاهقة."
                            },
                            {
                                "en": "We are an exclusive distributor of Omani Beige marble in Abu Dhabi & Al Ain area with connections to over 350 stone factories worldwide.",
                                "ar": "نحن الموزع الحصري لرخام بيج عماني في أبوظبي والعين ومرتبطون بأكثر من 350 مصنعاً للحجر عالمياً."
                            }
                        ]
                    },
                    "content": {
                        "heading": {
                            "en": "Our Legacy & Craftsmanship",
                            "ar": "تاريخنا وحرفيتنا العريقة"
                        },
                        "body": {
                            "en": "Arab Marble engages in the wholesale and retail distribution and fixing of marble and granite for palaces, hotels, luxury villas and prestigious towers. With an international network exceeding 350 stone processing factories, we deliver world-class natural stone solutions.",
                            "ar": "تعمل شركة الرخام العربي في توريد وتركيب الرخام والجرانيت للقصور والفنادق والفلل الفاخرة والأبراج المرموقة. ومن خلال شبكة دولية تضم أكثر من 350 مصنعاً لمعالجة الأحجار، نقدم حلول أحجار طبيعية بمقاييس عالمية."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# CONTACT
db["site_pages"].update_one(
    {"slug": "contact"},
    {
        "$set": {
            "title": {"en": "Contact Us", "ar": "اتصل بنا"},
            "metaTitle": {"en": "Contact Us | Arab Marble Abu Dhabi", "ar": "اتصل بنا | الرخام العربي أبوظبي"},
            "metaDescription": {
                "en": "Get in touch with Arab Marble team in Mussafah, Abu Dhabi.",
                "ar": "تواصل مع فريق الرخام العربي في مصفح، أبوظبي."
            },
            "seo_title": {"en": "Contact Us | Arab Marble Abu Dhabi", "ar": "اتصل بنا | الرخام العربي أبوظبي"},
            "seo_description": {
                "en": "Get in touch with Arab Marble team in Mussafah, Abu Dhabi.",
                "ar": "تواصل مع فريق الرخام العربي في مصفح، أبوظبي."
            },
            "blocks": [
                {
                    "id": "contact-hero",
                    "type": "hero",
                    "props": {
                        "heading": {
                            "en": "CONTACT US",
                            "ar": "اتصل بنا"
                        },
                        "align": "center",
                        "backgroundImage": "/images/page-banner.jpg"
                    }
                },
                {
                    "id": "contact-form-block",
                    "type": "contact-form",
                    "props": {
                        "contactHeading": {
                            "en": "Contact Us",
                            "ar": "تواصل معنا"
                        },
                        "formHeading": {
                            "en": "Email Us",
                            "ar": "أرسل لنا رسالة"
                        },
                        "mapImage": "/images/contact-map.jpg",
                        "phone": "+971 2 555 4008",
                        "phoneHeading": {
                            "en": "Phone",
                            "ar": "الهاتف"
                        },
                        "fax": "+971 2 555 4005",
                        "faxHeading": {
                            "en": "FAX",
                            "ar": "الفاكس"
                        },
                        "email": "am@arabmarble.ae",
                        "emailHeading": {
                            "en": "Email",
                            "ar": "البريد الإلكتروني"
                        },
                        "address": {
                            "en": "Arab Marble, Mussafah Abu Dhabi - UAE\nP.O.Box: 3835",
                            "ar": "الرخام العربي، مصفح أبوظبي - الإمارات\nص.ب: 3835"
                        },
                        "addressHeading": {
                            "en": "Address",
                            "ar": "العنوان"
                        },
                        "formId": "6ae9791d21b18b0fa642e1dc",
                        "formSlug": "contact-inquiry-form",
                        "submitButtonText": {
                            "en": "SEND MESSAGE",
                            "ar": "إرسال الرسالة"
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# PRIVACY POLICY
db["site_pages"].update_one(
    {"slug": "privacy-policy"},
    {
        "$set": {
            "title": {"en": "Privacy Policy | Arab Marble", "ar": "سياسة الخصوصية | الرخام العربي"},
            "metaTitle": {"en": "Privacy Policy | Arab Marble", "ar": "سياسة الخصوصية | الرخام العربي"},
            "metaDescription": {
                "en": "Privacy policy and data protection terms for Arab Marble.",
                "ar": "سياسة الخصوصية وحماية البيانات لشركة الرخام العربي."
            },
            "seo_title": {"en": "Privacy Policy | Arab Marble", "ar": "سياسة الخصوصية | الرخام العربي"},
            "seo_description": {
                "en": "Privacy policy and data protection terms for Arab Marble.",
                "ar": "سياسة الخصوصية وحماية البيانات لشركة الرخام العربي."
            },
            "blocks": [
                {
                    "id": "privacy-policy-content",
                    "type": "policy.content",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "legal",
                    "props": {
                        "heading": {
                            "en": "Privacy Policy",
                            "ar": "سياسة الخصوصية"
                        },
                        "content": {
                            "en": "At Arab Marble, we respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your details when you interact with our website, inquire about our stone products, or engage our contracting services in Abu Dhabi and across the UAE.\n\nWe do not sell or trade your personally identifiable information. We employ industry-standard security protocols to maintain the safety of your information.",
                            "ar": "في الرخام العربي، نحترم خصوصيتك ونلتزم بحماية بياناتك ومعلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع بياناتك واستخدامها وحمايتها عند تصفح موقعنا أو الاستفسار عن منتجات الأحجار أو التعاقد على خدماتنا في أبوظبي وجميع أنحاء الإمارات.\n\nنحن لا نبيع أو نتاجر بمعلوماتك الشخصية، ونطبق أعلى معايير الأمان المعتمدة لحماية بياناتك."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "Privacy Policy",
                            "ar": "سياسة الخصوصية"
                        },
                        "body": {
                            "en": "At Arab Marble, we respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your details when you interact with our website, inquire about our stone products, or engage our contracting services in Abu Dhabi and across the UAE.\n\nWe do not sell or trade your personally identifiable information. We employ industry-standard security protocols to maintain the safety of your information.",
                            "ar": "في الرخام العربي، نحترم خصوصيتك ونلتزم بحماية بياناتك ومعلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع بياناتك واستخدامها وحمايتها عند تصفح موقعنا أو الاستفسار عن منتجات الأحجار أو التعاقد على خدماتنا في أبوظبي وجميع أنحاء الإمارات.\n\nنحن لا نبيع أو نتاجر بمعلوماتك الشخصية، ونطبق أعلى معايير الأمان المعتمدة لحماية بياناتك."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# TERMS
db["site_pages"].update_one(
    {"slug": "terms"},
    {
        "$set": {
            "title": {"en": "Terms & Conditions | Arab Marble", "ar": "الشروط والأحكام | الرخام العربي"},
            "metaTitle": {"en": "Terms and Conditions | Arab Marble", "ar": "الشروط والأحكام | الرخام العربي"},
            "metaDescription": {
                "en": "Terms and conditions of service and contracting for Arab Marble.",
                "ar": "الشروط والأحكام للخدمات والتعاقد مع الرخام العربي."
            },
            "seo_title": {"en": "Terms and Conditions | Arab Marble", "ar": "الشروط والأحكام | الرخام العربي"},
            "seo_description": {
                "en": "Terms and conditions of service and contracting for Arab Marble.",
                "ar": "الشروط والأحكام للخدمات والتعاقد مع الرخام العربي."
            },
            "blocks": [
                {
                    "id": "terms-content",
                    "type": "policy.content",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "legal",
                    "props": {
                        "heading": {
                            "en": "Terms & Conditions",
                            "ar": "الشروط والأحكام"
                        },
                        "content": {
                            "en": "Welcome to Arab Marble. By accessing this website or engaging our services, you agree to comply with our terms and conditions. All quotes, stone supply agreements, and fixing contracts are governed under the laws of the United Arab Emirates and the Emirate of Abu Dhabi.",
                            "ar": "مرحباً بكم في الرخام العربي. باستخدامك لهذا الموقع أو التعاقد على خدماتنا، فإنك توافق على الالتزام بشروطنا وأحكامنا. تخضع جميع عروض الأسعار واتفاقيات توريد الأحجار وعقود التركيب لقوانين دولة الإمارات العربية المتحدة وإمارة أبوظبي."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "Terms & Conditions",
                            "ar": "الشروط والأحكام"
                        },
                        "body": {
                            "en": "Welcome to Arab Marble. By accessing this website or engaging our services, you agree to comply with our terms and conditions. All quotes, stone supply agreements, and fixing contracts are governed under the laws of the United Arab Emirates and the Emirate of Abu Dhabi.",
                            "ar": "مرحباً بكم في الرخام العربي. باستخدامك لهذا الموقع أو التعاقد على خدماتنا، فإنك توافق على الالتزام بشروطنا وأحكامنا. تخضع جميع عروض الأسعار واتفاقيات توريد الأحجار وعقود التركيب لقوانين دولة الإمارات العربية المتحدة وإمارة أبوظبي."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# COOKIE POLICY
db["site_pages"].update_one(
    {"slug": "cookie-policy"},
    {
        "$set": {
            "title": {"en": "Cookie Policy | Arab Marble", "ar": "سياسة ملفات تعريف الارتباط | الرخام العربي"},
            "metaTitle": {"en": "Cookie Policy | Arab Marble", "ar": "سياسة ملفات تعريف الارتباط | الرخام العربي"},
            "metaDescription": {
                "en": "Cookie usage guidelines for Arab Marble website.",
                "ar": "إرشادات استخدام ملفات تعريف الارتباط لموقع الرخام العربي."
            },
            "seo_title": {"en": "Cookie Policy | Arab Marble", "ar": "سياسة ملفات تعريف الارتباط | الرخام العربي"},
            "seo_description": {
                "en": "Cookie usage guidelines for Arab Marble website.",
                "ar": "إرشادات استخدام ملفات تعريف الارتباط لموقع الرخام العربي."
            },
            "blocks": [
                {
                    "id": "cookie-policy-content",
                    "type": "policy.content",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "legal",
                    "props": {
                        "heading": {
                            "en": "Cookie Policy",
                            "ar": "سياسة ملفات تعريف الارتباط"
                        },
                        "content": {
                            "en": "We use cookies to enhance your browsing experience, provide language switching persistence, and analyze website traffic. You can adjust your browser settings to decline cookies at any time.",
                            "ar": "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وحفظ اختيار اللغة وتحليل حركة المرور على الموقع. يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط في أي وقت."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "Cookie Policy",
                            "ar": "سياسة ملفات تعريف الارتباط"
                        },
                        "body": {
                            "en": "We use cookies to enhance your browsing experience, provide language switching persistence, and analyze website traffic. You can adjust your browser settings to decline cookies at any time.",
                            "ar": "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وحفظ اختيار اللغة وتحليل حركة المرور على الموقع. يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط في أي وقت."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# SHIPPING POLICY
db["site_pages"].update_one(
    {"slug": "shipping-policy"},
    {
        "$set": {
            "title": {"en": "Delivery & Logistics Policy | Arab Marble", "ar": "سياسة التوصيل والشحن | الرخام العربي"},
            "metaTitle": {"en": "Shipping & Logistics Policy | Arab Marble", "ar": "سياسة التوصيل والشحن | الرخام العربي"},
            "metaDescription": {
                "en": "Marble, granite, and stone delivery terms across UAE.",
                "ar": "شروط توصيل وشحن الرخام والجرانيت والأحجار في الإمارات."
            },
            "seo_title": {"en": "Shipping & Logistics Policy | Arab Marble", "ar": "سياسة التوصيل والشحن | الرخام العربي"},
            "seo_description": {
                "en": "Marble, granite, and stone delivery terms across UAE.",
                "ar": "شروط توصيل وشحن الرخام والجرانيت والأحجار في الإمارات."
            },
            "blocks": [
                {
                    "id": "shipping-policy-content",
                    "type": "policy.content",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "legal",
                    "props": {
                        "heading": {
                            "en": "Delivery & Logistics Policy",
                            "ar": "سياسة التوصيل والخدمات اللوجستية"
                        },
                        "content": {
                            "en": "Arab Marble operates dedicated crane-equipped transport fleets across Abu Dhabi, Dubai, Sharjah, and the GCC region to ensure safe handling and prompt site delivery of natural stone slabs, tiles, and custom architectural elements.",
                            "ar": "تمتلك شركة الرخام العربي أسطول نقل مجهز برافعات في أبوظبي ودبي والشارقة ودول مجلس التعاون الخليجي لضمان المناولة الآمنة والتسليم الفوري لألواح الرخام الطبيعي والبلاط والعناصر المعمارية المخصصة في مواقع العمل."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "Delivery & Logistics Policy",
                            "ar": "سياسة التوصيل والخدمات اللوجستية"
                        },
                        "body": {
                            "en": "Arab Marble operates dedicated crane-equipped transport fleets across Abu Dhabi, Dubai, Sharjah, and the GCC region to ensure safe handling and prompt site delivery of natural stone slabs, tiles, and custom architectural elements.",
                            "ar": "تمتلك شركة الرخام العربي أسطول نقل مجهز برافعات في أبوظبي ودبي والشارقة ودول مجلس التعاون الخليجي لضمان المناولة الآمنة والتسليم الفوري لألواح الرخام الطبيعي والبلاط والعناصر المعمارية المخصصة في مواقع العمل."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# RETURNS & REFUNDS
db["site_pages"].update_one(
    {"slug": "returns-refunds"},
    {
        "$set": {
            "title": {"en": "Returns & Replacements | Arab Marble", "ar": "سياسة الاستبدال والاسترجاع | الرخام العربي"},
            "metaTitle": {"en": "Returns & Replacements | Arab Marble", "ar": "سياسة الاستبدال والاسترجاع | الرخام العربي"},
            "metaDescription": {
                "en": "Natural stone inspection, returns, and replacement policies.",
                "ar": "سياسات فحص واستبدال واسترجاع الأحجار الطبيعية."
            },
            "seo_title": {"en": "Returns & Replacements | Arab Marble", "ar": "سياسة الاستبدال والاسترجاع | الرخام العربي"},
            "seo_description": {
                "en": "Natural stone inspection, returns, and replacement policies.",
                "ar": "سياسات فحص واستبدال واسترجاع الأحجار الطبيعية."
            },
            "blocks": [
                {
                    "id": "returns-refunds-content",
                    "type": "policy.content",
                    "version": "1.0.0",
                    "enabled": True,
                    "variant": "legal",
                    "props": {
                        "heading": {
                            "en": "Returns & Replacements Policy",
                            "ar": "سياسة الإرجاع والاستبدال"
                        },
                        "content": {
                            "en": "Natural stone exhibits inherent variations in veining, shade, and texture. Inspection is conducted upon delivery at site. Custom cut-to-size stonework is tailored specifically to project specifications and manufactured upon architectural approval.",
                            "ar": "تتميز الأحجار الطبيعية بتنوع طبيعي فريد في العروق والظلال والملمس. يتم الفحص عند الاستلام في الموقع. وتُصنّع الأعمال الحجرية المقطوعة حسب المقاس خصيصاً لمواصفات المشروع بعد الاعتماد المعماري."
                        }
                    },
                    "content": {
                        "heading": {
                            "en": "Returns & Replacements Policy",
                            "ar": "سياسة الإرجاع والاستبدال"
                        },
                        "body": {
                            "en": "Natural stone exhibits inherent variations in veining, shade, and texture. Inspection is conducted upon delivery at site. Custom cut-to-size stonework is tailored specifically to project specifications and manufactured upon architectural approval.",
                            "ar": "تتميز الأحجار الطبيعية بتنوع طبيعي فريد في العروق والظلال والملمس. يتم الفحص عند الاستلام في الموقع. وتُصنّع الأعمال الحجرية المقطوعة حسب المقاس خصيصاً لمواصفات المشروع بعد الاعتماد المعماري."
                        }
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# PROMOTIONS
db["site_pages"].update_one(
    {"slug": "promotions"},
    {
        "$set": {
            "title": {"en": "Promotions", "ar": "العروض الترويجية"},
            "metaTitle": {"en": "Stone Promotions | Arab Marble", "ar": "العروض الترويجية للأحجار | الرخام العربي"},
            "metaDescription": {
                "en": "Explore special pricing and offers on selected marble and granite slabs.",
                "ar": "استكشف العروض والأسعار الخاصة على ألواح الرخام والجرانيت المختارة."
            },
            "seo_title": {"en": "Stone Promotions | Arab Marble", "ar": "العروض الترويجية للأحجار | الرخام العربي"},
            "seo_description": {
                "en": "Explore special pricing and offers on selected marble and granite slabs.",
                "ar": "استكشف العروض والأسعار الخاصة على ألواح الرخام والجرانيت المختارة."
            },
            "blocks": [
                {
                    "id": "promotions-hero",
                    "type": "hero",
                    "props": {
                        "title": {"en": "PROMOTIONS", "ar": "العروض الترويجية"},
                        "heading": {
                            "en": "Special Offers & Promotions",
                            "ar": "عروض وأسعار خاصة"
                        },
                        "subheading": {
                            "en": "Exclusive pricing on premium marble and granite stocks in Abu Dhabi.",
                            "ar": "أسعار حصرية على مخزون الرخام والجرانيت الفاخر في أبوظبي."
                        },
                        "align": "center",
                        "backgroundImage": "/images/page-banner.jpg"
                    }
                },
                {
                    "id": "promotions-grid",
                    "type": "promotions",
                    "props": {
                        "items": [
                            {
                                "productId": "6ae848555cd44cc45b374c5e",
                                "productSlug": "light-emperador",
                                "title": {
                                    "en": "Light Emperador – Spain",
                                    "ar": "لايت إمبرادور – إسبانيا"
                                },
                                "price": "Special Offer",
                                "badge": {
                                    "en": "Limited Stock",
                                    "ar": "كمية محدودة"
                                },
                                "image": "/images/products/light-emperador.jpg",
                                "href": "/product/light-emperador"
                            }
                        ]
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# CATEGORY
db["site_pages"].update_one(
    {"slug": "category"},
    {
        "$set": {
            "title": {"en": "Categories", "ar": "الفئات"},
            "metaTitle": {"en": "Categories | Arab Marble", "ar": "فئات الأحجار | الرخام العربي"},
            "metaDescription": {
                "en": "Marble, Granite, Natural Stones and Engineered Quartz in Abu Dhabi.",
                "ar": "رخام، جرانيت، أحجار طبيعية وكوارتز صناعي في أبوظبي."
            },
            "seo_title": {"en": "Categories | Arab Marble", "ar": "فئات الأحجار | الرخام العربي"},
            "seo_description": {
                "en": "Marble, Granite, Natural Stones and Engineered Quartz in Abu Dhabi.",
                "ar": "رخام، جرانيت، أحجار طبيعية وكوارتز صناعي في أبوظبي."
            },
            "blocks": [
                {
                    "id": "category-hero",
                    "type": "hero",
                    "props": {
                        "heading": {
                            "en": "STONE COLLECTION",
                            "ar": "مجموعة الأحجار الطبيعية"
                        },
                        "subheading": {
                            "en": "Marble, Granite, Natural Stones and Engineered Quartz in Abu Dhabi.",
                            "ar": "الرخام والجرانيت والأحجار الطبيعية والكوارتز في أبوظبي."
                        },
                        "backgroundImage": "/images/page-banner.jpg"
                    }
                }
            ],
            "updatedAt": datetime.utcnow()
        }
    }
)

# 8. Ensure content and payload match blocks across all site_pages and revisions
print("Synchronizing content and revisions with blocks...")
for doc in db["site_pages"].find():
    b = doc.get("blocks")
    if b:
        db["site_pages"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"content": b, "payload.content": b, "payload.blocks": b}}
        )
        rev_id = doc.get("publishedRevisionId")
        if rev_id:
            db["cms_page_revisions"].update_one(
                {"revisionId": rev_id},
                {"$set": {"snapshot.blocks": b}}
            )

print("✅ Multilingual migration completed successfully!")



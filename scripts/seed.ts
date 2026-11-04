import 'dotenv/config';
import fs from 'fs';
import path from 'path';

interface LoginResponse {
  access_token?: string;
  token?: string;
}

const API_BASE = (process.env.SEED_API_URL || process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const TENANT_SLUG = process.env.SEED_TENANT_SLUG || process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble';
const TENANT_DB = process.env.NEXT_PUBLIC_TENANT_DB || 'kp_arab_marble';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'arabmarble@gmail.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || '12345678999';
let BEARER_TOKEN = process.env.SEED_BEARER_TOKEN || '';

async function getAuthToken(): Promise<string> {
  if (BEARER_TOKEN) return BEARER_TOKEN;

  console.log(`🔑 Authenticating as ${ADMIN_EMAIL}...`);
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`⚠️ Login failed (${res.status}): ${err}. Proceeding with unauthenticated requests if permitted.`);
      return '';
    }

    const data = (await res.json()) as LoginResponse;
    const token = data.access_token || data.token || '';
    if (token) {
      console.log('✅ Authenticated successfully.');
    }
    return token;
  } catch (err: any) {
    console.warn(`⚠️ Auth error: ${err.message}. Proceeding without token.`);
    return '';
  }
}

async function request(reqPath: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${reqPath}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
    'X-Tenant-DB': TENANT_DB,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (BEARER_TOKEN) {
    headers['Authorization'] = `Bearer ${BEARER_TOKEN}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`[${res.status}] ${options.method || 'GET'} ${reqPath} - ${errorText}`);
  }
  return res.json().catch(() => ({}));
}

// 1. Seed Header
async function seedHeader() {
  console.log('\n📌 Seeding Header Configuration...');
  const headerPayload = {
    title: 'Arab Marble Main Header',
    isActive: true,
    logo: {
      text: 'Arab Marble',
      image: '/images/arab-marble-logo.svg',
      link: '/',
    },
    menu: [
      { label: 'HOME', path: '/', isActive: true },
      {
        label: 'PRODUCTS',
        path: '/shop',
        isActive: true,
        children: [
          { label: 'Marble', path: '/category/marble', isActive: true },
          { label: 'Granite', path: '/category/granite', isActive: true },
          { label: 'Natural Stones', path: '/category/natural-stones', isActive: true },
          { label: 'Artificial Stones', path: '/category/artificial-stones', isActive: true },
        ],
      },
      {
        label: 'PROJECTS',
        path: '/projects/latest',
        isActive: true,
        children: [
          { label: 'Latest Projects', path: '/projects/latest', isActive: true },
          { label: 'Iconic Projects', path: '/projects/iconic', isActive: true },
          { label: 'Commercial Projects', path: '/projects/commercial', isActive: true },
          { label: 'Custom Projects', path: '/projects/custom', isActive: true },
        ],
      },
      { label: 'PROMOTIONS', path: '/promotions', isActive: true },
      { label: 'CONTACT US', path: '/contact', isActive: true },
    ],
  };

  try {
    await request('/cms/headers', {
      method: 'POST',
      body: JSON.stringify(headerPayload),
    });
    console.log('✅ Header seeded successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Header seed notice: ${err.message}`);
  }
}

// 2. Seed Footer
async function seedFooter() {
  console.log('\n📌 Seeding Footer Configuration...');
  const footerPayload = {
    title: 'Arab Marble Main Footer',
    isActive: true,
    logo: {
      text: 'Arab Marble',
      image: '/images/arab-marble-logo.svg',
      link: '/',
    },
    copyright: 'Copyright © 2025 | ARAB MARBLE | All Rights Reserved',
    companyInfo: {
      name: 'Arab Marble Est.',
      phone: '+971 2 555 4008',
      fax: '+971 2 555 4005',
      email: 'am@arabmarble.ae',
      address: 'Arab Marble, Mussafah Abu Dhabi - UAE, P.O.Box: 3835',
    },
    socialLinks: [],
    columns: [
      {
        title: 'Products',
        links: [
          { label: 'Marble', path: '/category/marble' },
          { label: 'Granite', path: '/category/granite' },
          { label: 'Natural Stones', path: '/category/natural-stones' },
          { label: 'Artificial Stones', path: '/category/artificial-stones' },
        ],
      },
      {
        title: 'Projects',
        links: [
          { label: 'Latest Projects', path: '/projects/latest' },
          { label: 'Iconic Projects', path: '/projects/iconic' },
          { label: 'Custom Projects', path: '/projects/custom' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', path: '/about' },
          { label: 'Promotions', path: '/promotions' },
          { label: 'Contact Us', path: '/contact' },
        ],
      },
    ],
  };

  try {
    await request('/cms/footer', {
      method: 'POST',
      body: JSON.stringify(footerPayload),
    });
    console.log('✅ Footer seeded successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Footer seed notice: ${err.message}`);
  }
}

// 2b. Seed Interactive Forms
async function seedForms() {
  console.log('\n📌 Seeding Forms Configuration...');
  try {
    const existing = await request('/cms/forms');
    const formsList = Array.isArray(existing.data) ? existing.data : Array.isArray(existing) ? existing : [];
    const hasForm = formsList.some((f: any) => f.slug === 'contact-inquiry-form' || f.name === 'Contact & Inquiry Form');
    if (!hasForm) {
      await request('/cms/forms', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Contact & Inquiry Form',
          slug: 'contact-inquiry-form',
          purpose: 'general_contact',
          fields: [
            { id: 'f-name', type: 'text', name: 'name', label: 'Your Name', placeholder: 'Enter your full name', required: true },
            { id: 'f-email', type: 'email', name: 'email', label: 'Email Address', placeholder: 'name@example.com', required: true },
            { id: 'f-phone', type: 'phone', name: 'phone', label: 'Phone Number', placeholder: '+971 50 000 0000', required: false },
            { id: 'f-subject', type: 'text', name: 'subject', label: 'Subject / Stone Requirements', placeholder: 'e.g. Crema Marfil slabs estimation', required: false },
            { id: 'f-message', type: 'textarea', name: 'message', label: 'Message', placeholder: 'Provide project details, required dimensions, or marble specifications...', required: true },
          ],
          settings: {
            purpose: 'general_contact',
            sendEmail: true,
            email: {
              to: 'am@arabmarble.ae',
              from: 'Arab Marble <noreply@arabmarble.ae>',
              subject: 'New Arab Marble Inquiry from [name]',
              replyTo: '[email]',
              body: 'You received a new inquiry from Arab Marble website:\n\nName: [name]\nEmail: [email]\nPhone: [phone]\nSubject: [subject]\nMessage: [message]',
            },
            successMessage: 'Thank you for reaching out to Arab Marble. Your inquiry has been received and our team will get in touch shortly.',
            submitButtonText: 'SEND MESSAGE',
          },
        }),
      });
      console.log('✅ Created Contact & Inquiry Form in database.');
    } else {
      console.log('⏭️ Contact & Inquiry Form already exists in database.');
    }
  } catch (err: any) {
    console.warn(`⚠️ Form seed notice: ${err.message}`);
  }
}

// 3. Seed Categories
const CATEGORIES = [
  {
    name: 'Marble',
    slug: 'marble',
    description: 'Premium natural marble slabs, tiles and bespoke decorative cuts from quarries worldwide.',
  },
  {
    name: 'Granite',
    slug: 'granite',
    description: 'Durable and high-density granites ideal for high-traffic flooring, cladding and kitchen countertops.',
  },
  {
    name: 'Natural Stones',
    slug: 'natural-stones',
    description: 'Limestone, travertine, onyx, and sandstone offering authentic earthy textures and geological heritage.',
  },
  {
    name: 'Artificial Stones',
    slug: 'artificial-stones',
    description: 'Engineered quartz and porcelain slabs delivering modern durability, stain resistance and clean finishes.',
  },
];

async function seedCategories(): Promise<Record<string, string>> {
  console.log('\n📌 Seeding Product Categories...');
  const categoryMap: Record<string, string> = {};

  let existingCategories: any[] = [];
  try {
    const listRes = await request('/commerce/categories');
    existingCategories = Array.isArray(listRes) ? listRes : listRes.data || listRes.items || [];
  } catch {
    existingCategories = [];
  }

  for (const cat of CATEGORIES) {
    const match = existingCategories.find((ec: any) => ec.slug === cat.slug);
    if (match) {
      const id = match._id || match.id;
      categoryMap[cat.slug] = id;
      console.log(`⏭️ Category '${cat.name}' already exists (ID: ${id})`);
      continue;
    }

    try {
      const created = await request('/commerce/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: true,
          status: 'active',
        }),
      });
      const id = created._id || created.id || created.data?._id || created.data?.id;
      categoryMap[cat.slug] = id;
      console.log(`✅ Created Category '${cat.name}' (ID: ${id})`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to create category '${cat.name}': ${err.message}`);
    }
  }

  return categoryMap;
}

// 4. Seed Products (Catalog Type with Authentic Stone Images)
const PRODUCTS = [
  {
    name: 'Omani Beige Marble',
    slug: 'omani-beige',
    categorySlug: 'marble',
    color: 'Beige',
    country: 'Oman',
    sizes: ['Slabs (20mm / 30mm)', '600x600mm', '600x300mm'],
    finish: 'Polished / Honed / Brushed',
    image: '/images/products/stone-1.jpg',
    description: 'Arab Marble is an exclusive distributor of Omani Beige marble in Abu Dhabi & Al Ain. Renowned for its uniform warm beige tones, excellent crystalline density, and natural durability.',
  },
  {
    name: 'Crema Marfil',
    slug: 'crema-marfil',
    categorySlug: 'marble',
    color: 'Cream',
    country: 'Spain',
    sizes: ['Slabs 20mm', '600x600mm'],
    finish: 'Polished / Honed',
    image: '/images/products/stone-2.jpg',
    description: 'Classic creamy Spanish marble with subtle golden veining, suitable for grand flooring and wall cladding.',
  },
  {
    name: 'Dark Emperador',
    slug: 'dark-emperador',
    categorySlug: 'marble',
    color: 'Brown',
    country: 'Spain',
    sizes: ['Slabs', '600x600mm', 'Cut to size'],
    finish: 'Polished',
    image: '/images/products/stone-3.jpg',
    description: 'Rich dark chocolate brown marble with prominent white and golden crystalline veins.',
  },
  {
    name: 'Light Emperador',
    slug: 'light-emperador',
    categorySlug: 'marble',
    color: 'Brown',
    country: 'Spain',
    sizes: ['600x600x20mm', 'Slabs'],
    finish: 'Polished',
    image: '/images/products/promo-light-emperador.jpg',
    description: 'Delicate light brown and beige marble with intricate webs of crystalline veins.',
  },
  {
    name: 'Carrara White',
    slug: 'carrara-white',
    categorySlug: 'marble',
    color: 'White',
    country: 'Italy',
    sizes: ['Slabs (20mm / 30mm)', '600x600mm', '600x300mm'],
    finish: 'Polished / Honed',
    image: '/images/products/stone-4.jpg',
    description: 'Iconic Italian white marble with soft feathery grey veining from the quarries of Carrara.',
  },
  {
    name: 'Statuario Extra',
    slug: 'statuario',
    categorySlug: 'marble',
    color: 'White',
    country: 'Italy',
    sizes: ['Bookmatch Slabs 20mm', 'Cut to size'],
    finish: 'Polished',
    image: '/images/products/stone-5.jpg',
    description: 'Precious Italian marble characterized by bright white background and bold grey statement veins.',
  },
  {
    name: 'Calacatta Oro',
    slug: 'calacatta-oro',
    categorySlug: 'marble',
    color: 'White',
    country: 'Italy',
    sizes: ['Slabs', 'Custom Tiles'],
    finish: 'Polished',
    image: '/images/products/promo-calacatta-oro.jpg',
    description: 'High-end luxury Italian marble with distinctive warm golden and grey veins on an ivory base.',
  },
  {
    name: 'Nero Marquina',
    slug: 'nero-marquina',
    categorySlug: 'marble',
    color: 'Black',
    country: 'Spain',
    sizes: ['Slabs 20mm', '600x600mm', '600x300mm'],
    finish: 'Polished',
    image: '/images/products/stone-6.jpg',
    description: 'Deep nocturnal black marble quarried in Northern Spain, highlighted by striking white calcite veins.',
  },
  {
    name: 'Black Marquina Gold',
    slug: 'black-marquina-gold',
    categorySlug: 'marble',
    color: 'Black',
    country: 'Spain',
    sizes: ['Slabs 20mm', 'Cut to size'],
    finish: 'Polished',
    image: '/images/products/stone-7.jpg',
    description: 'Dramatic black marble featuring elegant golden and bronze intersecting vein patterns.',
  },
  {
    name: 'Travertino Navona',
    slug: 'travertino-navona',
    categorySlug: 'natural-stones',
    color: 'Beige',
    country: 'Italy',
    sizes: ['Slabs 20mm / 30mm', 'Veincut Tiles'],
    finish: 'Filled & Polished / Open Pore Honed',
    image: '/images/products/stone-8.jpg',
    description: 'Warm, porous natural Roman travertine celebrated for timeless warmth and architectural authenticity.',
  },
  {
    name: 'Silver Travertine',
    slug: 'silver-travertine',
    categorySlug: 'natural-stones',
    color: 'Grey',
    country: 'Italy',
    sizes: ['Slabs', '600x600mm', '600x1200mm'],
    finish: 'Honed / Brushed',
    image: '/images/products/stone-9.jpg',
    description: 'Contemporary silver, pewter, and charcoal banded travertine ideal for modern facades and wet areas.',
  },
  {
    name: 'Black Absolute Granite',
    slug: 'black-absolute',
    categorySlug: 'granite',
    color: 'Black',
    country: 'India',
    sizes: ['Slabs 20mm / 30mm', 'Counters', 'Tiles'],
    finish: 'Polished / Flamed / Leathered',
    image: '/images/products/stone-10.jpg',
    description: 'Extremely dense, uniform solid black granite with virtually zero water absorption, perfect for heavy counters and floors.',
  },
  {
    name: 'Tan Brown Granite',
    slug: 'tan-brown',
    categorySlug: 'granite',
    color: 'Brown',
    country: 'India',
    sizes: ['Slabs 20mm / 30mm', 'Cut to size'],
    finish: 'Polished / Flamed',
    image: '/images/products/stone-11.jpg',
    description: 'Hard-wearing Indian granite featuring dark brown, copper and grey crystalline mineral blooms.',
  },
  {
    name: 'Kashmir White Granite',
    slug: 'kashmir-white',
    categorySlug: 'granite',
    color: 'White',
    country: 'India',
    sizes: ['Slabs 20mm', '600x600mm'],
    finish: 'Polished',
    image: '/images/products/stone-12.jpg',
    description: 'Light greyish-white granite with cranberry garnet specks and subtle smokey waves.',
  },
  {
    name: 'Pure White Quartz',
    slug: 'pure-white-quartz',
    categorySlug: 'artificial-stones',
    color: 'White',
    country: 'UAE / Engineered',
    sizes: ['Jumbo Slabs 3200x1600x20mm'],
    finish: 'Polished',
    image: '/images/products/stone-13.jpg',
    description: 'Engineered high-purity quartz surface delivering pristine seamless brightness, non-porous hygiene, and stain resistance.',
  },
  {
    name: 'Calacatta Gold Engineered',
    slug: 'calacatta-gold-quartz',
    categorySlug: 'artificial-stones',
    color: 'White',
    country: 'UAE / Engineered',
    sizes: ['Jumbo Slabs 3200x1600x20mm / 30mm'],
    finish: 'Polished / Silk',
    image: '/images/products/stone-14.jpg',
    description: 'Engineered quartz mimicking noble Calacatta marble with subtle golden-grey ribbons and zero maintenance.',
  },
  {
    name: 'Black Opal Quartz',
    slug: 'black-opal-quartz',
    categorySlug: 'artificial-stones',
    color: 'Black',
    country: 'UAE / Engineered',
    sizes: ['Slabs 20mm', 'Custom Vanity Tops'],
    finish: 'Polished',
    image: '/images/products/promo-black-opal.jpg',
    description: 'Midnight black engineered quartz infused with reflective crystalline specks for subtle ambient shimmer.',
  },
  {
    name: 'Verde Guatemala',
    slug: 'verde-guatemala',
    categorySlug: 'marble',
    color: 'Green',
    country: 'India',
    sizes: ['Slabs 20mm', '600x300mm'],
    finish: 'Polished',
    image: '/images/products/stone-15.jpg',
    description: 'Rich emerald-forest green serpentinite marble displaying dense dark web patterns and intense royal presence.',
  },
  {
    name: 'Rosa Portugal',
    slug: 'rosa-portugal',
    categorySlug: 'marble',
    color: 'Pink',
    country: 'Portugal',
    sizes: ['Slabs', 'Tiles'],
    finish: 'Polished',
    image: '/images/products/stone-16.jpg',
    description: 'Prestige Portuguese marble with pale salmon pink hues and delicate grey-brown accents.',
  },
  {
    name: 'Rosso Levanto',
    slug: 'rosso-levanto',
    categorySlug: 'marble',
    color: 'Red',
    country: 'Italy',
    sizes: ['Slabs 20mm', '600x600mm'],
    finish: 'Polished',
    image: '/images/products/stone-17.jpg',
    description: 'Majestic deep burgundy Italian marble with dramatic white calcite patterns.',
  },
];

async function seedProducts(categoryMap: Record<string, string>) {
  console.log('\n📌 Seeding Products (Catalog Type with Real Marble Images)...');

  let existingProducts: any[] = [];
  try {
    const listRes = await request('/commerce/products');
    existingProducts = Array.isArray(listRes) ? listRes : listRes.data || listRes.items || [];
  } catch {
    existingProducts = [];
  }

  for (const p of PRODUCTS) {
    const match = existingProducts.find((ep: any) => ep.slug === p.slug);
    const categoryId = categoryMap[p.categorySlug] || Object.values(categoryMap)[0] || '';
    const imgId = `${p.slug}-img-1`;

    const payload = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      summary: `${p.name} - ${p.color} ${p.country}`,
      type: 'catalog',
      categoryIds: categoryId ? [categoryId] : [],
      primaryCategoryId: categoryId || undefined,
      status: 'active',
      isFeatured: true,
      pricing: {
        price: 0,
        currency: 'AED',
      },
      options: [
        {
          key: 'color',
          label: 'Color',
          values: [p.color],
          selectedValues: [p.color],
          useForVariants: false,
        },
        {
          key: 'country',
          label: 'Country of Origin',
          values: [p.country],
          selectedValues: [p.country],
          useForVariants: false,
        },
        {
          key: 'size',
          label: 'Standard Sizes',
          values: p.sizes,
          selectedValues: p.sizes,
          useForVariants: false,
        },
        {
          key: 'finish',
          label: 'Finish',
          values: [p.finish],
          selectedValues: [p.finish],
          useForVariants: false,
        },
      ],
      gallery: [{ id: imgId, url: p.image, alt: p.name, order: 0 }],
      primaryImageId: imgId,
      tags: [p.color.toLowerCase(), p.country.toLowerCase(), 'marble', 'natural-stone', 'luxury', p.categorySlug],
    };

    if (match) {
      const prodId = match._id || match.id;
      try {
        await request(`/commerce/products/${prodId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        console.log(`✅ Updated Product '${p.name}' with real stone image.`);
      } catch (err: any) {
        console.warn(`⚠️ Failed to update product '${p.name}': ${err.message}`);
      }
      continue;
    }

    try {
      await request('/commerce/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`✅ Created Product '${p.name}'`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to create product '${p.name}': ${err.message}`);
    }
  }
}

// 5. Seed Projects
const PROJECTS = [
  {
    title: 'Boulevard Heights',
    location: 'Dubai',
    category: 'Latest Projects',
    image: '/images/project-boulevard-heights.jpg',
  },
  {
    title: 'Burj Vista',
    location: 'Dubai',
    category: 'Latest Projects',
    image: '/images/project-burj-vista.jpg',
  },
  {
    title: 'Clemenceau Medical Center',
    location: 'Dubai',
    category: 'Latest Projects',
    image: '/images/project-clemenceau.jpg',
  },
  {
    title: 'The Address - Fountain Views',
    location: 'Dubai',
    category: 'Latest Projects',
    image: '/images/project-fountain-views.jpg',
  },
  {
    title: 'Emirates Palace Luxury Suites',
    location: 'Abu Dhabi',
    category: 'Iconic',
    image: '/images/home-hero.jpg',
  },
  {
    title: 'Royal Presidential Villa',
    location: 'Abu Dhabi',
    category: 'Iconic',
    image: '/images/who-we-are.jpg',
  },
  {
    title: 'Saadiyat Island Private Villa',
    location: 'Abu Dhabi',
    category: 'Custom Projects',
    image: '/images/products-tile.jpg',
  },
];

async function seedProjects() {
  console.log('\n📌 Seeding Projects...');
  let existingProjects: any[] = [];
  try {
    const listRes = await request('/cms/projects');
    existingProjects = Array.isArray(listRes) ? listRes : listRes.data || listRes.items || [];
  } catch {
    existingProjects = [];
  }

  for (const prj of PROJECTS) {
    const match = existingProjects.find((ep: any) => ep.title === prj.title);
    const payload = {
      title: prj.title,
      location: prj.location,
      category: prj.category,
      image: prj.image,
      gallery: [prj.image],
      status: 'published',
    };

    if (match) {
      const projId = match._id || match.id;
      try {
        await request(`/cms/projects/${projId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        console.log(`✅ Updated Project '${prj.title}' with authentic project image.`);
      } catch (err: any) {
        console.warn(`⚠️ Failed to update project '${prj.title}': ${err.message}`);
      }
      continue;
    }

    try {
      await request('/cms/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`✅ Created Project '${prj.title}'`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to create project '${prj.title}': ${err.message}`);
    }
  }
}

// 6. Seed CMS Pages into Database
async function seedPages() {
  console.log('\n📌 Seeding CMS Pages into MongoDB Database...');
  const pageFiles = [
    { slug: 'home', file: 'src/lib/pages/homePage.json' },
    { slug: 'promotions', file: 'src/lib/pages/promotionsPage.json' },
    { slug: 'contact', file: 'src/lib/pages/contactPage.json' },
    { slug: 'shop', file: 'src/lib/pages/shopPage.json' },
    { slug: 'category', file: 'src/lib/pages/categoryPage.json' },
  ];

  for (const { slug, file } of pageFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const content = rawData.content || rawData.blocks || [];

    // Check if page already exists
    let existingPage: any = null;
    try {
      const getRes = await request(`/cms/pages?slug=${encodeURIComponent(slug)}`);
      existingPage = getRes.data || getRes;
    } catch {
      existingPage = null;
    }

    const payload = {
      title: typeof rawData.title === 'object' ? rawData.title : { en: String(rawData.title || slug) },
      slug,
      content,
      isPublished: true,
      metaTitle: typeof rawData.metaTitle === 'object' ? rawData.metaTitle : { en: String(rawData.metaTitle || '') },
      metaDescription: typeof rawData.metaDescription === 'object' ? rawData.metaDescription : { en: String(rawData.metaDescription || '') },
      status: 'published',
      isHomepage: slug === 'home',
      isHomePage: slug === 'home',
      isHome: slug === 'home',
    };

    if (existingPage && (existingPage.slug || existingPage._id || existingPage.id)) {
      try {
        await request('/cms/pages', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        console.log(`✅ Updated CMS Page '${slug}' in database.`);
      } catch (err: any) {
        console.warn(`⚠️ Failed to update page '${slug}': ${err.message}`);
      }
    } else {
      try {
        await request('/cms/pages', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        console.log(`✅ Created CMS Page '${slug}' in database.`);
      } catch (err: any) {
        if (err.message && err.message.includes('already exists')) {
          try {
            await request('/cms/pages', {
              method: 'PUT',
              body: JSON.stringify(payload),
            });
            console.log(`✅ Updated CMS Page '${slug}' in database (via PUT fallback).`);
          } catch (putErr: any) {
            console.warn(`⚠️ Failed to update page '${slug}': ${putErr.message}`);
          }
        } else {
          console.warn(`⚠️ Failed to create page '${slug}': ${err.message}`);
        }
      }
    }
  }
}

// 7. Main Runner
async function run() {
  console.log('====================================================');
  console.log(`🚀 Arab Marble Storefront Seed Script`);
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log(`🏢 Tenant Slug: ${TENANT_SLUG}`);
  console.log(`🗄️ Tenant DB: ${TENANT_DB}`);
  console.log('====================================================');

  BEARER_TOKEN = await getAuthToken();

  await seedHeader();
  await seedFooter();
  await seedForms();
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap);
  await seedProjects();
  await seedPages();

  console.log('\n====================================================');
  console.log('🎉 Seed process finished successfully!');
  console.log('====================================================\n');
}

run().catch((err) => {
  console.error('Fatal error during seed execution:', err);
  process.exit(1);
});

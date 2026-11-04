/**
 * referenceGuard.ts
 *
 * Central utilities to identify whether a section, block, or field is linked to
 * a reference (Product, Testimonial, Form, Project, or external dataset) configured
 * in the Kalp Admin Dashboard.
 *
 * Referenced content must ONLY be edited in the Dashboard and protected from inline
 * editing on the storefront.
 */

export function isBlockReferenced(block: any): boolean {
  if (!block || typeof block !== 'object') return false;

  // 1. Check explicit block.references object (configured from SectionReferencesManager in Kalp Admin)
  const refs = block.references;
  if (refs && typeof refs === 'object') {
    const hasProduct = Boolean(
      refs.productId ||
      refs.product_id ||
      (Array.isArray(refs.productIds) && refs.productIds.length > 0) ||
      (Array.isArray(refs.product_ids) && refs.product_ids.length > 0) ||
      (Array.isArray(refs.products) && refs.products.length > 0)
    );
    const hasForm = Boolean(
      refs.formId ||
      refs.form_id ||
      refs.formSlug ||
      refs.form_slug ||
      (Array.isArray(refs.forms) && refs.forms.length > 0)
    );
    const hasTestimonial = Boolean(
      refs.testimonialId ||
      refs.testimonial_id ||
      (Array.isArray(refs.testimonialIds) && refs.testimonialIds.length > 0) ||
      (Array.isArray(refs.testimonial_ids) && refs.testimonial_ids.length > 0) ||
      (Array.isArray(refs.testimonials) && refs.testimonials.length > 0)
    );
    const hasProject = Boolean(
      refs.projectId ||
      refs.project_id ||
      (Array.isArray(refs.projectIds) && refs.projectIds.length > 0) ||
      (Array.isArray(refs.project_ids) && refs.project_ids.length > 0) ||
      (Array.isArray(refs.projects) && refs.projects.length > 0)
    );
    const hasCustom = Boolean(
      refs.referenceId ||
      refs.reference_id ||
      refs.collection ||
      refs.dataset ||
      refs.source ||
      refs.document_key
    );

    if (hasProduct || hasForm || hasTestimonial || hasProject || hasCustom) {
      return true;
    }
  }

  // 2. Check block.props for reference binding identifiers
  const props = block.props;
  if (props && typeof props === 'object') {
    const getVal = (v: any) => (v && typeof v === 'object' && 'value' in v ? v.value : v);

    const productId = getVal(props.productId) || getVal(props.product_id);
    const productIds = getVal(props.productIds) || getVal(props.product_ids) || getVal(props.products);
    if (productId || (Array.isArray(productIds) && productIds.length > 0)) {
      return true;
    }

    const formId = getVal(props.formId) || getVal(props.form_id);
    const formSlug = getVal(props.formSlug) || getVal(props.form_slug) || getVal(props.form);
    if (formId || formSlug) {
      return true;
    }

    const testimonialId = getVal(props.testimonialId) || getVal(props.testimonial_id);
    const testimonialIds = getVal(props.testimonialIds) || getVal(props.testimonial_ids) || getVal(props.testimonials);
    if (testimonialId || (Array.isArray(testimonialIds) && testimonialIds.length > 0)) {
      return true;
    }

    const projectId = getVal(props.projectId) || getVal(props.project_id);
    const projectIds = getVal(props.projectIds) || getVal(props.project_ids) || getVal(props.projects);
    if (projectId || (Array.isArray(projectIds) && projectIds.length > 0)) {
      return true;
    }
  }

  // 3. Check resolved/compiled reference payloads
  if (
    block.compiledProduct ||
    (Array.isArray(block.compiledProducts) && block.compiledProducts.length > 0) ||
    (Array.isArray(block.referenced_products) && block.referenced_products.length > 0) ||
    (Array.isArray(block.compiledTestimonials) && block.compiledTestimonials.length > 0) ||
    (Array.isArray(block.referenced_testimonials) && block.referenced_testimonials.length > 0) ||
    block.compiledForm ||
    block.referenced_form ||
    (Array.isArray(block.referenced_forms) && block.referenced_forms.length > 0) ||
    block.isReferenced === true ||
    block.referenced === true ||
    Boolean(block.reference)
  ) {
    return true;
  }

  return false;
}

export function isFieldReferenced(block: any, fieldPath?: string): boolean {
  if (!fieldPath) {
    return isBlockReferenced(block);
  }

  if (!isBlockReferenced(block)) {
    return false;
  }

  const lower = fieldPath.toLowerCase();

  // If a section is referenced, item entries and dynamic props belong to the referenced entity
  if (
    lower.startsWith('content.') ||
    lower.includes('product') ||
    lower.includes('testimonial') ||
    lower.includes('form') ||
    lower.includes('rating') ||
    lower.includes('review') ||
    lower.includes('price') ||
    lower.includes('quote') ||
    lower.includes('author') ||
    lower.includes('role') ||
    lower.includes('badge') ||
    lower.includes('item')
  ) {
    return true;
  }

  return true;
}

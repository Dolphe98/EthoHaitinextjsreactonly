import { getCategories } from '../lib/woocommerce';

/**
 * Helper to clean HTML entities from category names
 */
function cleanCategoryName(name) {
  if (!name) return '';
  return name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");
}

export async function fetchAllCategories() {
  // Fetch up to 100 to ensure we get all categories, avoiding pagination issues
  return getCategories({ per_page: 100 });
}

export function buildCategoryHierarchy(categories) {
  if (!Array.isArray(categories)) return [];

  const map = {};
  const roots = [];

  // First pass: initialize the map and clean the names
  categories.forEach(cat => {
    map[cat.id] = { ...cat, name: cleanCategoryName(cat.name), children: [] };
  });

  // Second pass: build the tree
  categories.forEach(cat => {
    if (cat.parent === 0) {
      roots.push(map[cat.id]);
    } else if (map[cat.parent]) {
      map[cat.parent].children.push(map[cat.id]);
    }
  });

  return roots;
}

export function fetchCategoryBySlug(slug, allCategories) {
  if (!Array.isArray(allCategories)) return null;
  
  const found = allCategories.find(cat => cat.slug === slug);
  if (found) {
    return { ...found, name: cleanCategoryName(found.name) };
  }
  return null;
}
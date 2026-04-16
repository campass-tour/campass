import wardrobeCatalogData from '../data/wardrobeCatalog.json';
import type { WardrobeCategory, WardrobeItem } from '../types';

type WardrobeCatalog = {
  categories: WardrobeCategory[];
  items: WardrobeItem[];
};

const catalog = wardrobeCatalogData as unknown as WardrobeCatalog;

export const WARDROBE_CATEGORIES = catalog.categories;
export const WARDROBE_ITEMS = catalog.items;

export const WARDROBE_DEFAULT_OWNED_ITEM_IDS = WARDROBE_ITEMS
  .filter((item) => item.ownedByDefault)
  .map((item) => item.id);

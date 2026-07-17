export type CategoryLike = {
  id?: string;
  name: string;
  slug?: string | null;
};

export const DEFAULT_CATEGORY_DEFINITIONS = [
  { id: "default-adventure", name: "Adventure", slug: "adventure" },
  { id: "default-comedy", name: "Comedy", slug: "comedy" },
  { id: "default-family", name: "Family", slug: "family" },
  { id: "default-fantasy", name: "Fantasy", slug: "fantasy" },
  { id: "default-musical", name: "Musical", slug: "musical" },
  { id: "default-sci-fi", name: "Sci-Fi", slug: "sci-fi" },
  { id: "default-documentary", name: "Documentary", slug: "documentary" },
  { id: "default-history", name: "History", slug: "history" },
  { id: "default-crime", name: "Crime", slug: "crime" },
  { id: "default-drama", name: "Drama", slug: "drama" },
  { id: "default-horror", name: "Horror", slug: "horror" },
  { id: "default-romance", name: "Romance", slug: "romance" },
  { id: "default-thriller", name: "Thriller", slug: "thriller" },
  { id: "default-animation", name: "Animation", slug: "animation" },
  { id: "default-action", name: "Action", slug: "action" },
] as const;

export function mergeCategories(categories?: CategoryLike[] | null) {
  const merged = new Map<string, CategoryLike>();

  DEFAULT_CATEGORY_DEFINITIONS.forEach((category) => {
    merged.set(category.slug, {
      id: category.id,
      name: category.name,
      slug: category.slug,
    });
  });

  (categories ?? []).forEach((category) => {
    if (!category?.name) return;
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) return;
    merged.set(slug, {
      id: category.id ?? `category-${slug}`,
      name: category.name,
      slug,
    });
  });

  return Array.from(merged.values());
}

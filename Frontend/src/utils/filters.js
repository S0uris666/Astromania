export function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().toLowerCase();
}

export function filterByCategoryAndQuery(
  items,
  activeCategory,
  query,
  {
    allValue = "all",
    categorySelector = (item) => item?.category,
    fieldSelector = () => [],
  } = {}
) {
  const normalizedQuery = normalizeText(query);

  return (items || []).filter((item) => {
    const itemCategory = categorySelector(item);
    const matchesCategory =
      activeCategory === allValue || itemCategory === activeCategory;

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const fields = fieldSelector(item) || [];

    return fields.some((field) =>
      normalizeText(field).includes(normalizedQuery)
    );
  });
}

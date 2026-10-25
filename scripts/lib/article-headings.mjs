// Article titles are rendered by the page template as h1. Preserve the imported
// section hierarchy, while making its first level h2 and removing skipped ranks.
export function normalizeArticleHeadings($) {
  const ancestors = [];
  $('h1,h2,h3,h4,h5,h6').each((_, heading) => {
    const originalLevel = Number(heading.tagName.slice(1));
    while (ancestors.length && ancestors.at(-1).originalLevel >= originalLevel) {
      ancestors.pop();
    }
    const level = Math.min(6, ancestors.length ? ancestors.at(-1).level + 1 : 2);
    heading.tagName = `h${level}`;
    ancestors.push({ originalLevel, level });
  });
}

// WordPress occasionally links a decorative image separately from its visible
// heading. Reuse the existing text link as the image link's accessible name.
export function labelArticleImageLinks($) {
  $('a[href]').each((_, link) => {
    const node = $(link);
    if (node.text().trim() || node.attr('aria-label') || !node.find('img').length) return;
    if (node.find('img').toArray().some(image => $(image).attr('alt')?.trim())) return;
    const label = $('a[href]').filter((_, candidate) =>
      candidate !== link && $(candidate).attr('href') === node.attr('href') && $(candidate).text().trim()
    ).first().text().trim();
    if (label) node.attr('aria-label', label);
  });
}

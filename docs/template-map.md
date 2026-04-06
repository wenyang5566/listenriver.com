# Template Map

## Active Theme And Override Rules

- Site theme: `themes/PaperMod`
- Hugo loads local `layouts/` first, then falls back to `themes/PaperMod/layouts/`
- Current homepage, header, and list rendering are locally overridden
- Taxonomy landing and term templates were not previously overridden; this batch adds local taxonomy-specific templates

## Actual Files In Use

- Homepage:
  `layouts/index.html`
  This is the active home template override and takes precedence over theme defaults.

- Header and primary navigation:
  `layouts/partials/header.html`
  This locally overrides `themes/PaperMod/layouts/partials/header.html`.

- Categories entry / taxonomy terms page:
  `layouts/_default/taxonomy.html`
  This now controls `/categories/` and other taxonomy landing pages, with category-specific landing treatment.

- Category term page:
  `layouts/_default/term.html`
  This now controls individual category pages such as `/categories/閱讀筆記/`.

- Generic section and archive list pages:
  `layouts/_default/list.html`
  This still controls section lists such as `/blog/` and other non-category list views.

- Article card rendering:
  `layouts/partials/article-card.html`
  This batch introduces a reusable article card partial for homepage featured posts and category landing content.

- Category card rendering:
  `layouts/partials/category-card.html`
  Used by the categories landing page and homepage category rail.

- Category collection / ordering:
  `layouts/partials/category-data.html`
  Builds the ordered category set from `site.Params.salonCategoryOrder` plus taxonomy counts and descriptions.

## Related Content Sources

- Categories landing copy:
  `content/categories/_index.md`

- Individual category intro copy and metadata:
  `content/categories/<category>/_index.md`

- Search page route:
  `content/search.md`
  Uses theme search layout behavior via `layout: search`.

## Theme Files Still Used As Fallback

- Base HTML shell:
  `themes/PaperMod/layouts/_default/baseof.html`

- Search page template:
  `themes/PaperMod/layouts/_default/search.html`

- Footer partial:
  `themes/PaperMod/layouts/partials/footer.html`

- If no local override exists for a partial or layout, Hugo continues to use the PaperMod version.

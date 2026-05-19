(function () {
  const categoryPages = {
    'renungan-pagi': 'artikel-renungan-pagi.html',
    'sekolah-sabat': 'artikel-sekolah-sabat.html',
    'roh-nubuat': 'artikel-roh-nubuat.html'
  };

  const articles = [...(window.ARTICLES || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (date) => new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));

  const escapeHtml = (text = '') => text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const inlineFormat = (text = '') => escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  const articleUrl = (slug) => `artikel-detail.html?slug=${encodeURIComponent(slug)}`;

  const articleCard = (article) => `
    <a class="artikel-card" href="${articleUrl(article.slug)}">
      <div class="artikel-img">
        <img src="${article.thumbnail}" alt="${escapeHtml(article.title)}">
      </div>
      <div class="artikel-body">
        <div class="artikel-cat">${article.category}</div>
        <h3 class="artikel-title">${article.title}</h3>
        <p class="artikel-excerpt">${article.description}</p>
        <div class="artikel-meta">
          <span class="artikel-author">${article.author}</span>
          <span class="artikel-date">${formatDate(article.date)}</span>
        </div>
      </div>
    </a>
  `;

  const renderArticleCards = (container, list) => {
    if (!container) return;
    container.innerHTML = list.map(articleCard).join('');
  };

  const renderCategoryPage = (categorySlug) => {
    const list = articles.filter((article) => article.categorySlug === categorySlug);
    const container = document.getElementById('category-articles');
    const count = document.getElementById('category-count');

    renderArticleCards(container, list);
    if (count) count.textContent = `${list.length} artikel tersedia`;
  };

  const parseMdx = (source) => source
    .replace(/^---[\s\S]*?---\s*/, '')
    .trim();

  const mdxToHtml = (source) => {
    const lines = parseMdx(source).split(/\r?\n/);
    const html = [];
    let listItems = [];

    const flushList = () => {
      if (!listItems.length) return;
      html.push(`<ul>${listItems.map((item) => `<li>${inlineFormat(item)}</li>`).join('')}</ul>`);
      listItems = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith('- ')) {
        listItems.push(trimmed.slice(2));
        return;
      }

      flushList();

      if (trimmed.startsWith('### ')) {
        html.push(`<h3>${inlineFormat(trimmed.slice(4))}</h3>`);
      } else if (trimmed.startsWith('## ')) {
        html.push(`<h2>${inlineFormat(trimmed.slice(3))}</h2>`);
      } else if (trimmed.startsWith('# ')) {
        html.push(`<h1>${inlineFormat(trimmed.slice(2))}</h1>`);
      } else if (trimmed.startsWith('> ')) {
        html.push(`<blockquote>${inlineFormat(trimmed.slice(2))}</blockquote>`);
      } else {
        html.push(`<p>${inlineFormat(trimmed)}</p>`);
      }
    });

    flushList();
    return html.join('');
  };

  const getRelatedArticles = (current) => articles
    .filter((article) => article.slug !== current.slug)
    .map((article) => {
      const sameCategory = article.categorySlug === current.categorySlug ? 2 : 0;
      const sharedTags = article.tags.filter((tag) => current.tags.includes(tag)).length;
      return { article, score: sameCategory + sharedTags };
    })
    .sort((a, b) => b.score - a.score || new Date(b.article.date) - new Date(a.article.date))
    .slice(0, 3)
    .map((item) => item.article);

  const renderArticleDetail = async () => {
    const slug = new URLSearchParams(window.location.search).get('slug') || articles[0]?.slug;
    const article = articles.find((item) => item.slug === slug);
    const content = document.getElementById('article-content');

    if (!article || !content) {
      if (content) content.innerHTML = '<p>Artikel tidak ditemukan.</p>';
      return;
    }

    document.title = `${article.title} - GMAHK Tanjung Barat`;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-description').textContent = article.description;
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-category').href = categoryPages[article.categorySlug];
    document.getElementById('article-author').textContent = article.author;
    document.getElementById('article-date').textContent = formatDate(article.date);
    document.getElementById('article-image').src = article.thumbnail;
    document.getElementById('article-image').alt = article.title;

    try {
      const response = await fetch(article.mdx);
      if (!response.ok) throw new Error('MDX not found');
      content.innerHTML = mdxToHtml(await response.text());
    } catch {
      content.innerHTML = '<p>Konten MDX belum dapat dimuat. Jalankan website melalui server lokal agar file artikel bisa dibaca oleh browser.</p>';
    }

    renderArticleCards(document.getElementById('related-articles'), getRelatedArticles(article));
  };

  window.articleSystem = {
    articleUrl,
    renderArticleCards,
    renderCategoryPage,
    renderArticleDetail,
    getLatestArticles: (limit = 3) => articles.slice(0, limit)
  };
})();

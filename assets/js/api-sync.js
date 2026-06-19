(function () {
    const CDN_SITE_DATA_URL = 'https://cdn.jsdelivr.net/gh/ngajikeun-id/ngajikeun-web@main/content/data/site-data.json';
    let siteDataPromise = null;

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeText(value, fallback = '') {
        return escapeHtml(value ?? fallback);
    }

    function safeUrl(value, fallback = '#') {
        if (!value) return fallback;

        try {
            const urlText = String(value).trim();
            const urlMatch = urlText.match(/https?:\/\/[^\s]+/i);
            const rawUrl = urlMatch ? urlMatch[0] : urlText;
            const url = new URL(rawUrl, window.location.origin);
            const allowedProtocols = ['http:', 'https:'];

            if (url.origin === window.location.origin) {
                return escapeHtml(url.pathname + url.search + url.hash);
            }

            if (allowedProtocols.includes(url.protocol)) {
                return escapeHtml(url.href);
            }
        } catch (error) {
            return fallback;
        }

        return fallback;
    }

    function renderSimpleMarkdown(markdown) {
        const safeMarkdown = String(markdown ?? '');
        return safeMarkdown
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function loadSiteData() {
        if (!siteDataPromise) {
            siteDataPromise = fetch(CDN_SITE_DATA_URL)
                .then((res) => {
                    if (!res.ok) throw new Error('Jaringan bermasalah pas ambil data, Antum!');
                    return res.json();
                })
                .catch((err) => {
                    console.error('Gagal mengambil data dari CDN:', err);
                    siteDataPromise = null;
                    throw err;
                });
        }
        return siteDataPromise;
    }

    function getCollection(data, key) {
        if (!data || !data.collections || !data.collections[key]) return [];
        return Object.values(data.collections[key]);
    }

    function resetModalScroll() {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');
        if (modal) modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
    }

    async function syncAbout() {
        const descEl = document.getElementById('about-description');
        const visionEl = document.getElementById('about-vision');
        const missionEl = document.getElementById('about-mission');

        try {
            const data = await loadSiteData();
            if (!data || !data.collections || !data.collections.about) return;
            const aboutData = Object.values(data.collections.about)[0];

            if (aboutData) {
                if (descEl) descEl.innerText = aboutData.description || '';
                if (visionEl) visionEl.innerText = aboutData.vision || '';
                if (missionEl) {
                    missionEl.innerHTML = '';
                    if (Array.isArray(aboutData.mission)) {
                        aboutData.mission.forEach((m) => {
                            const li = document.createElement('li');
                            li.innerText = m;
                            missionEl.appendChild(li);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Gagal load section About:', error);
        }
    }

    async function syncPrograms() {
        const container = document.getElementById('program-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const programs = getCollection(data, 'programs');
            if (!programs.length) return;

            container.innerHTML = '';

            programs.forEach((prog) => {
                const slug = prog.slug || prog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                container.innerHTML += `
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 transform hover:-translate-y-1">
                        <div>
                            <h3 class="text-xl font-bold text-slate-100">${safeText(prog.title, 'Program')}</h3>
                            <p class="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-3">${safeText(prog.description)}</p>
                        </div>
                        <div class="mt-8 border-t border-slate-800/80 pt-6 flex items-center justify-between">
                            <span class="text-emerald-400 font-extrabold text-sm">${safeText(prog.price, 'Gratis')}</span>
                            <button onclick="window.NgajikeunApi.getProgramBySlug('${safeText(slug)}')"
                                class="bg-slate-800 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all active:scale-95">
                                Detail →
                            </button>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Gagal load program:', error);
        }
    }

    async function getProgramBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) return;

        try {
            const data = await loadSiteData();
            const programs = getCollection(data, 'programs');
            const prog = programs.find((p) => p.slug === slug || (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug));

            if (!prog) return;

            content.innerHTML = `
                <div class="max-w-2xl mx-auto">
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-1">PROGRAM KAMI</span>
                    <h2 class="text-3xl font-black text-slate-100 mb-4 leading-tight">${safeText(prog.title)}</h2>
                    <div class="inline-block px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl mb-6">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Biaya Investasi</span>
                        <p class="text-lg font-black text-emerald-400">${safeText(prog.price, 'Gratis')}</p>
                    </div>
                    <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
                        ${window.marked ? window.marked.parse(prog.description || '') : renderSimpleMarkdown(prog.description)}
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat detail program:', error);
        }
    }

    async function syncMentors() {
        const container = document.getElementById('mentor-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const mentors = getCollection(data, 'mentors');
            if (!mentors.length) return;

            container.innerHTML = '';

            mentors.forEach((mentor) => {
                const imageUrl = safeUrl(mentor.image, 'https://via.placeholder.com/150');
                const slug = mentor.slug || mentor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                container.innerHTML += `
                    <div class="text-center group cursor-pointer transition-transform active:scale-95" data-mentor-slug="${safeText(slug)}">
                        <div class="relative inline-block">
                            <img src="${imageUrl}" alt="${safeText(mentor.name)}"
                                class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-800 group-hover:border-emerald-500 transition-all duration-300 shadow-md">
                        </div>
                        <h3 class="mt-4 text-lg font-bold text-gray-200">${safeText(mentor.name, 'Mentor')}</h3>
                        <p class="text-emerald-400 text-sm font-medium mb-2">${safeText(mentor.specialty, "Mentor Al-Qur'an")}</p>
                    </div>
                `;
            });

            container.querySelectorAll('[data-mentor-slug]').forEach((card) => {
                card.addEventListener('click', () => {
                    window.NgajikeunApi.getMentorModalBySlug(card.dataset.mentorSlug);
                });
            });
        } catch (error) {
            console.error('Gagal load mentor:', error);
        }
    }

    async function getMentorModalBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) return;

        try {
            const data = await loadSiteData();
            const mentors = getCollection(data, 'mentors');
            const mentor = mentors.find((m) => m.slug === slug || (m.name && m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug));

            if (!mentor) return;

            const imageUrl = safeUrl(mentor.image, 'https://via.placeholder.com/150');
            const bioContent = mentor.bio || mentor.description || 'Profil bimbingan musyrifah bersanad.';

            content.innerHTML = `
                <div class="max-w-2xl mx-auto text-center">
                    <div class="flex flex-col items-center text-center mb-6">
                        <div class="h-32 w-32 rounded-full overflow-hidden ring-4 ring-emerald-500/30 shadow-md bg-slate-950 flex items-center justify-center mb-4">
                            <img src="${imageUrl}" alt="${safeText(mentor.name)}" onclick="window.zoomImage(this.src)" class="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105">
                        </div>
                        <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-1">${safeText(mentor.specialty, "Muhafizhoh Bersanad")}</span>
                        <h2 class="text-2xl md:text-3xl font-black text-slate-100 leading-tight">${safeText(mentor.name)}</h2>
                    </div>

                    <div class="border-t border-slate-800 pt-6 text-left">
                        <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Biodata & Sanad</p>
                        <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed">
                            ${window.marked ? window.marked.parse(bioContent) : renderSimpleMarkdown(bioContent)}
                        </div>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat detail mentor:', error);
        }
    }

    async function syncTestimonials() {
        const container = document.getElementById('testimonial-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const testimonials = getCollection(data, 'testimonials');
            if (!testimonials.length) return;

            container.innerHTML = '';

            testimonials.forEach((testi) => {
                container.innerHTML += `
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
                        <p class="text-slate-300 text-sm leading-relaxed italic">"${safeText(testi.text || testi.description)}"</p>
                        <div class="mt-6 flex items-center gap-4 border-t border-slate-800/60 pt-4">
                            <div>
                                <h4 class="text-sm font-bold text-slate-100">${safeText(testi.name, 'Ukhti')}</h4>
                                <p class="text-[11px] font-semibold text-emerald-400 mt-0.5">${safeText(testi.batch, 'Alumni')}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Gagal load testimoni:', error);
        }
    }

    async function syncArticles() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');
            if (!articles.length) return;

            container.innerHTML = '';

            articles.forEach((art) => {
                const slug = art.slug || art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                container.innerHTML += `
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group h-full">
                        <div class="p-6 md:p-8">
                            <span class="text-emerald-400 text-[10px] font-bold tracking-widest uppercase block mb-3">LITERASI ISLAMI</span>
                            <h3 onclick="window.NgajikeunApi.getArticleBySlug('${safeText(slug)}')"
                                class="text-lg font-bold text-slate-100 leading-snug cursor-pointer group-hover:text-emerald-400 transition-colors line-clamp-2">
                                ${safeText(art.title)}
                            </h3>
                            <p class="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-3">${safeText(art.excerpt || art.description)}</p>
                        </div>
                        <div class="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                            <span class="text-[11px] text-slate-500 font-semibold">${safeText(art.date, 'Baru')}</span>
                            <button onclick="window.NgajikeunApi.getArticleBySlug('${safeText(slug)}')"
                                class="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                                Baca Lengkap <span class="transform group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Gagal load artikel:', error);
        }
    }

    async function getArticleBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) return;

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');
            const art = articles.find((a) => a.slug === slug || (a.title && a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug));

            if (!art) return;

            content.innerHTML = `
                <div class="max-w-2xl mx-auto">
                    <div class="mb-6">
                        <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-2">LITERASI ISLAMI</span>
                        <h2 class="text-2xl md:text-3xl font-black text-slate-100 leading-tight">${safeText(art.title)}</h2>
                        <p class="text-slate-500 text-xs font-semibold mt-2">Diterbitkan pada: ${safeText(art.date, '-')}</p>
                    </div>
                    <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
                        ${window.marked ? window.marked.parse(art.content || art.description || '') : renderSimpleMarkdown(art.content || art.description)}
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat detail artikel:', error);
        }
    }

    async function syncProducts() {
        const container = document.getElementById('products-list');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const products = getCollection(data, 'products');
            if (!products.length) return;

            container.innerHTML = '';

            products.forEach((product) => {
                const slug = product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const productImage = product.image
                    ? `<img src="${safeUrl(product.image)}" class="w-full h-full object-cover rounded-[2rem] shadow-sm" alt="${safeText(product.title)}">`
                    : `<span class="text-5xl group-hover:scale-110 transition-transform duration-500">📖</span>`;

                container.innerHTML += `
                    <div class="group bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-500 overflow-hidden col-span-full">
                        <div class="flex flex-col md:flex-row items-center p-4 md:p-6 gap-8">
                            <div data-product-slug="${safeText(slug)}"
                                class="w-full md:w-48 h-48 bg-slate-800/50 rounded-[2rem] flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-800 ring-1 ring-transparent hover:ring-emerald-500/30 transform hover:scale-102 transition-all duration-500">
                                ${productImage}
                            </div>
                            <div class="flex-grow text-center md:text-left">
                                <div class="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                                    <h3 data-product-slug="${safeText(slug)}"
                                        class="text-xl font-black text-slate-100 cursor-pointer hover:text-emerald-400 transition-colors duration-300">
                                        ${safeText(product.title, 'Produk')}
                                    </h3>
                                    <span class="hidden md:block w-1 h-1 rounded-full bg-emerald-500"></span>
                                    <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">E-Book Series</span>
                                </div>
                                <p class="text-[13px] leading-relaxed text-slate-400 mb-4 max-w-2xl">${safeText(product.description)}</p>
                                <div class="flex items-center justify-center md:justify-start gap-4">
                                    <div class="flex items-center gap-1 text-emerald-500">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                                        <span class="text-[11px] font-bold">Akses Selamanya</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.querySelectorAll('[data-product-slug]').forEach((el) => {
                el.addEventListener('click', () => {
                    window.NgajikeunApi.getProductModalBySlug(el.dataset.productSlug);
                });
            });
        } catch (error) {
            console.error('Gagal load produk:', error);
        }
    }

    async function getProductModalBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) return;

        try {
            const data = await loadSiteData();
            const products = getCollection(data, 'products');
            const product = products.find((p) => p.slug === slug || (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug));

            if (!product) return;

            const imageUrl = product.image ? safeUrl(product.image) : null;
            const imageHtml = imageUrl
                ? `<div class="h-40 w-40 mx-auto rounded-2xl overflow-hidden ring-4 ring-emerald-500/30 shadow-md bg-slate-950 flex items-center justify-center mb-4">
                    <img src="${imageUrl}" alt="${safeText(product.title)}" onclick="window.zoomImage(this.src)" class="h-28 w-28 object-contain cursor-zoom-in transition-transform duration-300 hover:scale-105">
                   </div>`
                : `<div class="text-6xl mb-4 text-center select-none">📖</div>`;

            content.innerHTML = `
                <div class="max-w-2xl mx-auto text-center">
                    ${imageHtml}
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-1">${safeText(product.category, 'E-BOOK SERIES')}</span>
                    <h2 class="text-2xl md:text-3xl font-black text-slate-100 mb-4 leading-tight">${safeText(product.title)}</h2>
                    <div class="w-full max-w-[180px] mx-auto my-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                        <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Investasi</span>
                        <p class="text-xl font-black text-emerald-400">${safeText(product.price, 'Gratis')}</p>
                    </div>
                    <div class="border-t border-slate-800 pt-6 text-left mb-8">
                        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Deskripsi Lengkap</h4>
                        <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed">
                            ${window.marked ? window.marked.parse(product.description || '') : renderSimpleMarkdown(product.description)}
                        </div>
                    </div>
                    <a href="${safeUrl(product.link, 'https://wa.me/6281932692047')}" target="_blank" rel="noopener noreferrer"
                       class="inline-block w-full sm:w-auto px-8 py-4 bg-emerald-600 border border-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg">
                        BELI SEKARANG ⚡
                    </a>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat detail produk:', error);
        }
    }

    async function syncQuizzes() {
        const container = document.getElementById('quizzes-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const quizzes = getCollection(data, 'quizzes');
            if (!quizzes.length) return;

            const categorized = {};
            quizzes.forEach((q) => {
                const cat = q.category || 'Umum';
                if (!categorized[cat]) categorized[cat] = [];
                categorized[cat].push(q);
            });

            container.innerHTML = '';

            Object.entries(categorized).forEach(([cat, items]) => {
                const safeCatId = cat.toLowerCase().replace(/[^a-z0-9]/g, '');
                let listHtml = `<div id=\"list-${safeCatId}\" class=\"hidden mt-6 space-y-3\">`;

                items.forEach((q) => {
                    listHtml += `
                        <div class="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h4 class="text-sm font-bold text-slate-200">${safeText(q.title)}</h4>
                                <p class="text-[11px] text-slate-400 mt-1">${safeText(q.description)}</p>
                            </div>
                            <a href="${safeUrl(q.link)}" target="_blank" rel="noopener noreferrer"
                               class="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl text-center transition-all active:scale-95 flex-shrink-0">
                                Mulai Kuis ⚡
                            </a>
                        </div>
                    `;
                });
                listHtml += '</div>';

                container.innerHTML += `
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 class="text-lg font-bold text-slate-100">Kategori: ${safeText(cat)}</h3>
                                <p class="text-xs text-slate-400 mt-1">Total tersedia ${items.length} paket evaluasi hafalan.</p>
                            </div>
                            <button id="btn-${safeCatId}" onclick="window.toggleQuizList('${safeCatId}')"
                                    class="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all active:scale-95 flex-shrink-0">
                                Lihat Daftar Kuis
                            </button>
                        </div>
                        ${listHtml}
                    </div>
                `;
            });
        } catch (error) {
            console.error('Gagal load kuis:', error);
        }
    }

    window.zoomImage = function (src) {
        if (!src) return;

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(2, 6, 23, 0.85)';
        overlay.style.backdropFilter = 'blur(8px)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.cursor = 'zoom-out';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '90vw';
        img.style.maxHeight = '90vh';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '1rem';
        img.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'transform 0.3s ease';

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 10);

        const closeLightbox = () => {
            overlay.style.opacity = '0';
            img.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        };

        overlay.addEventListener('click', closeLightbox);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    window.NgajikeunApi = {
        syncAbout,
        syncPrograms,
        getProgramBySlug,
        syncMentors,
        getMentorModalBySlug,
        syncTestimonials,
        syncArticles,
        syncProducts,
        getProductModalBySlug,
        syncQuizzes,
        getArticleBySlug
    };

    window.toggleQuizList = function (cat) {
        const list = document.getElementById(`list-${cat}`);
        const btn = document.getElementById(`btn-${cat}`);

        if (!list || !btn) return;

        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            btn.innerText = 'Tutup Daftar Kuis';
            btn.classList.replace('bg-slate-800', 'bg-emerald-600');
        } else {
            list.classList.add('hidden');
            btn.innerText = 'Lihat Daftar Kuis';
            btn.classList.replace('bg-emerald-600', 'bg-slate-800');
        }
    };
})();
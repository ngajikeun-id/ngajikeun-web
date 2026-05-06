(function () {
    const CDN_SITE_DATA_URL = 'https://cdn.jsdelivr.net/gh/Ciwai-lab/ngajikeun-web@main/content/data/site-data.json';
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
        const safeMarkdown = String(markdown ?? '').trim();
        if (!safeMarkdown) {
            return '<p>Informasi belum tersedia.</p>';
        }

        return safeMarkdown
            .split(/\n\s*\n/)
            .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    async function fetchJson(url) {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        return response.json();
    }

    function loadSiteData() {
        if (!siteDataPromise) {
            siteDataPromise = (async () => {
                try {
                    return await fetchJson('content/data/site-data.json');
                } catch (localError) {
                    console.warn('Gagal load aggregate lokal, mencoba CDN fallback.', localError);
                    return fetchJson(CDN_SITE_DATA_URL);
                }
            })();
        }

        return siteDataPromise;
    }

    function getCollection(data, key) {
        const collection = data?.[key];
        return Array.isArray(collection) ? collection : [];
    }

    async function getArticleBySlug(slug) {
        const data = await loadSiteData();
        const articles = getCollection(data, 'articles');

        return articles.find((article) => article.slug === slug) || null;
    }

    async function syncPrograms() {
        const container = document.getElementById('program-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const programs = getCollection(data, 'programs');
            if (!programs.length) return;

            container.innerHTML = '';

            programs.forEach(program => {
                const imageUrl = program.image || 'https://via.placeholder.com/600x400?text=Flyer+Program';

                container.innerHTML += `
                <div class="group bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500">
                    <!-- Area Flyer -->
                    <div class="relative overflow-hidden aspect-[4/3]">
                        <img src="${imageUrl}" alt="${safeText(program.title)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                            <span class="text-white text-xs font-bold tracking-widest uppercase">Lihat Detail</span>
                        </div>
                    </div>
                    
                    <!-- Area Teks -->
                    <div class="p-8">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold text-slate-800 leading-tight">${safeText(program.title)}</h3>
                            <span class="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg shadow-emerald-200 uppercase">${safeText(program.price)}</span>
                        </div>
                        <p class="text-slate-500 text-xs leading-relaxed mb-6">${safeText(program.description)}</p>
                        
                        <a href="${safeUrl(program.registration_link)}" target="_blank" 
                           class="block w-full text-center py-4 bg-white border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all active:scale-95">
                            Daftar Sekarang ⚡
                        </a>
                    </div>
                </div>
            `;
            });
        } catch (error) {
            console.error('Gagal sync program:', error);
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

            for (const mentor of mentors) {
                const imageUrl = safeUrl(mentor.image, 'https://via.placeholder.com/150');

                container.innerHTML += `
                    <div class="text-center group">
                        <div class="relative inline-block">
                            <img src="${imageUrl}"
                                class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-100 group-hover:border-emerald-500 transition-all duration-300 shadow-md">
                        </div>
                        <h3 class="mt-4 text-lg font-bold text-gray-800">${safeText(mentor.name, 'Mentor')}</h3>
                        <p class="text-emerald-600 text-sm font-medium mb-2">${safeText(mentor.specialty, 'Mentor Al-Qur\'an')}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Gagal load mentor:', error);
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

            for (const testimonial of testimonials) {
                const imageUrl = safeUrl(
                    testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name || 'Santri')}`,
                    'https://ui-avatars.com/api/?name=Santri'
                );

                container.innerHTML += `
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 italic text-gray-700 relative">
                        <span class="text-6xl text-emerald-200 absolute top-2 left-2 font-serif">“</span>
                        <p class="relative z-10 mb-6">${safeText(testimonial.content)}</p>
                        <div class="flex items-center gap-4 border-t pt-4">
                            <img src="${imageUrl}" class="w-12 h-12 rounded-full border-2 border-emerald-500">
                            <div>
                                <h4 class="font-bold text-gray-800 not-italic">${safeText(testimonial.name, 'Santri')}</h4>
                                <p class="text-xs text-emerald-600 not-italic">${safeText(testimonial.status)}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            container.innerHTML = '';
            console.error('Gagal load testimoni:', error);
        }
    }

    async function syncArticles() {
        const list = document.getElementById('articles-list');
        if (!list) return;

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');

            articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            const now = new Date();
            const publishedArticles = articles.filter(post => new Date(post.date) <= now);

            if (!articles.length) return;

            list.innerHTML = '';

            articles.slice(0, 3).forEach(post => {
                const imageUrl = post.thumbnail || 'https://via.placeholder.com/1280x720?text=Ngajikeun+Artikel';
                const date = new Date(post.date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                list.innerHTML += `
                <article class="group bg-white rounded-[2.5rem] p-2 border border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/5">
                    <div class="bg-slate-100 aspect-video rounded-[2rem] mb-6 overflow-hidden relative">
    <img src="${post.thumbnail || 'https://via.placeholder.com/1280x720?text=Ngajikeun+Artikel'}" 
         alt="${safeText(post.title)}" 
         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
    
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-60"></div>
</div>
                    </div>
                    <div class="px-6 pb-8">
                        <time class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-3">${date}</time>
                        <h3 class="text-xl font-bold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors mb-4">
                            ${safeText(post.title)}
                        </h3>
                        <p class="text-slate-500 text-xs line-clamp-2 mb-6 leading-relaxed">
                            ${safeText(post.body.substring(0, 100))}...
                        </p>
                        <button onclick="openArticlePopup('${post.slug}')" class="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-all">
    Baca Selengkapnya 
    <svg class="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
</button>
                    </div>
                </article>
            `;
            });
        } catch (err) {
            console.error('Duh, gagal narik artikel:', err);
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

            for (const product of products) {
                container.innerHTML += `
                    <div class="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                        <h3 class="font-bold text-emerald-900">${safeText(product.title, 'Produk')}</h3>
                        <p class="text-sm text-emerald-700/70 my-3">${safeText(product.description)}</p>
                        <span class="block font-black text-emerald-600 mb-4">${safeText(product.price, 'Gratis')}</span>
                        <button class="bg-white text-emerald-700 text-xs px-4 py-2 rounded-full font-bold shadow-sm">Beli Sekarang</button>
                    </div>`;
            }
        } catch (error) {
            console.error('Gagal load produk:', error);
        }
    }

    async function syncQuizzes() {
        const listTahfidz = document.getElementById('list-tahfidz');
        const listTajwid = document.getElementById('list-tajwid');
        if (!listTahfidz || !listTajwid) return;

        try {
            const data = await loadSiteData();
            const quizzes = getCollection(data, 'quizzes');

            listTahfidz.innerHTML = '';
            listTajwid.innerHTML = '';

            quizzes.forEach(quiz => {
                const category = (quiz.category || '').toLowerCase();
                const quizHtml = `
                <div class="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-white shadow-sm hover:bg-white transition-all">
                    <div>
                        <h4 class="text-sm font-bold text-slate-800">${safeText(quiz.title)}</h4>
                        <p class="text-[10px] text-slate-500">${safeText(quiz.description)}</p>
                    </div>
                    <a href="${safeUrl(quiz.link)}" target="_blank" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                        Mulai Quiz ⚡
                    </a>
                </div>
            `;

                if (category === 'tahfidz') listTahfidz.innerHTML += quizHtml;
                else if (category === 'tajwid') listTajwid.innerHTML += quizHtml;
            });

        } catch (err) { console.error(err); }
    }

    function toggleQuizList(cat) {
        const list = document.getElementById(`list-${cat}`);
        const btn = document.getElementById(`btn-${cat}`);

        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            list.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            btn.innerText = `Tutup Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-slate-800', 'bg-red-500'); // Ganti warna biar jelas kalau mau tutup
        } else {
            list.classList.add('hidden');
            btn.innerText = `Buka Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-red-500', 'bg-slate-800');
        }
    }

    async function syncAbout() {
        const historyEl = document.getElementById("about-history");
        const slidesEl = document.getElementById("about-slides");
        const visionEl = document.getElementById("about-vision");
        const missionsEl = document.getElementById("about-missions");

        if (!historyEl) return;

        try {
            const siteData = await loadSiteData();
            const data = siteData?.about_details || {};

            // 1. Render Sejarah
            historyEl.innerHTML = window.marked
                ? window.marked.parse(data.history || '')
                : renderSimpleMarkdown(data.history || '');

            // 2. Render Visi & Misi
            if (visionEl) visionEl.innerText = data.vision ? `"${data.vision}"` : "";
            if (missionsEl && data.missions) {
                missionsEl.innerHTML = data.missions.map(misi => `
        <p class="relative pl-4">
            <span class="absolute left-0 text-emerald-500">•</span>
            ${safeText(misi)}
        </p>
    `).join('');
            }

            // 3. Render Gallery (Grid Full)
            if (slidesEl && data.slides) {
                slidesEl.innerHTML = data.slides.map(slide => {
                    const imgPath = safeUrl(slide.image);
                    return `
                        <a href="${imgPath}" data-fancybox="about-gallery" class="cursor-zoom-in block overflow-hidden rounded-2xl shadow-md">
                            <img src="${imgPath}" class="h-48 md:h-64 w-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy">
                        </a>
                    `;
                }).join('');

                if (window.Fancybox) {
                    window.Fancybox.bind("[data-fancybox='about-gallery']", { Images: { zoom: true } });
                }
            }
        } catch (err) { console.error('Gagal sync about:', err); }
    }

    async function openArticlePopup(slug) {
        const modal = document.getElementById('article-modal');
        const modalBody = document.getElementById('modal-body');
        if (!modal) {
            console.error("Modalnya belum ada di HTML, bro!");
            return;
        }

        const contentArea = modal.querySelector('#modal-content');

        contentArea.scrollTop = 0;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        contentArea.innerHTML = '<p class="text-center italic py-10">Membuka catatan hikmah...</p>';

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');
            const article = articles.find(a => a.slug === slug);

            if (article) {
                const htmlContent = window.marked
                    ? window.marked.parse(article.body)
                    : renderSimpleMarkdown(article.body);

                contentArea.innerHTML = `
                <div class="prose prose-slate prose-emerald max-w-none">
        <h2 class="text-3xl font-black text-slate-800 mb-6">${safeText(article.title)}</h2>
        <div class="article-body">
            ${window.marked ? window.marked.parse(article.body) : renderSimpleMarkdown(article.body)}
        </div>
    </div>
`;
                modal.scrollTo(0, 0);
            }
        } catch (err) {
            contentArea.innerHTML = '<p class="text-red-500">Aduh, gagal muat artikelnya, bro.</p>';
        }
    }

    window.openArticlePopup = openArticlePopup;
    window.closeArticleModal = () => {
        document.getElementById('article-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    window.NgajikeunApi = {
        syncAbout,
        syncPrograms,
        syncMentors,
        syncTestimonials,
        syncArticles,
        syncProducts,
        syncQuizzes,
        getArticleBySlug
    };

    window.toggleQuizList = function (cat) {
        const list = document.getElementById(`list-${cat}`);
        const btn = document.getElementById(`btn-${cat}`);

        if (!list || !btn) {
            console.error("Elemen list atau button tidak ketemu, Bro!");
            return;
        }

        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            list.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            btn.innerText = `Tutup Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-slate-800', 'bg-red-500');
        } else {
            list.classList.add('hidden');
            btn.innerText = `Buka Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-red-500', 'bg-slate-800');
        }
    };
}());

(function () {
    const { safeText, safeUrl, renderSimpleMarkdown } = window.NgajikeunUtils;

    // ===== HTML RENDER =====

    function renderArticleModal(post) {
        const imageHtml = post.thumbnail
            ? `<img src="${safeUrl(post.thumbnail)}" alt="${safeText(post.title)}" onclick="zoomImage(this.src)" class="w-full max-h-[60vh] object-contain rounded-[2rem] mb-8 shadow-lg cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]">`
            : '';

        return `
                <div class="max-w-2xl mx-auto text-center">
                    ${imageHtml}
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">Literasi Al-Qur'an</span>
                    <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(post.title)}</h2>
                    <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8">
                        ${window.marked ? window.marked.parse(post.body || '') : renderSimpleMarkdown(post.body)}
                    </div>
                </div>
            `;
    }

    function renderProgramModal(program) {
        const imageHtml = program.image
            ? `<img src="${safeUrl(program.image)}" alt="${safeText(program.title)}" onclick="zoomImage(this.src)" class="w-full max-h-[60vh] object-contain rounded-[2rem] mb-8 shadow-lg cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]">`
            : '';
        const programBody = String(program.body || program.description || '').trim();

        return `
                <div class="max-w-2xl mx-auto text-center">
                    ${imageHtml}
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">Detail Program Belajar</span>
                    <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(program.title)}</h2>

                    <div id="program-markdown-content" class="prose prose-invert prose-emerald prose-sm max-w-none overflow-x-auto text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8 mb-8">
                        ${programBody && window.marked ? window.marked.parse(programBody) : renderSimpleMarkdown(programBody)}
                    </div>

                    ${program.registration_open ? `
<a
   href="/dashboard/daftar/?program=${encodeURIComponent(program.program_slug)}"
   class="inline-block w-full sm:w-auto px-8 py-4 bg-emerald-600 border border-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-950/50">
   Daftar Sekarang 🚀
</a>
` : `
<div class="inline-block px-8 py-4 bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl">
   Pendaftaran Ditutup
</div>
`}
                </div>
            `;
    }

    function renderProgramCard(program) {
        const imageUrl = safeUrl(program.image, 'https://via.placeholder.com/600x400?text=Flyer+Program');
        const slug =
            program.program_slug ||
            program.slug ||
            program.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
            '';

        return `
    <div class="group bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-500">
        <div class="relative overflow-hidden aspect-[4/3] cursor-pointer" onclick="window.openProgramModalBySlug('${safeText(slug)}')">
            <img src="${imageUrl}" alt="${safeText(program.title)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <span class="text-white text-xs font-bold tracking-widest uppercase">Lihat Detail Program 📖</span>
            </div>
        </div>
        
        <div class="p-8">
            <div class="mb-4">
                <h3 class="text-xl font-bold text-slate-100 leading-tight">${safeText(program.title)}</h3>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed mb-6">${safeText(program.description)}</p>
            
            <button type="button" data-program-slug="${safeText(slug)}"
               class="block w-full text-center py-4 bg-slate-950 border border-slate-800 text-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                Detail Program 📖
            </button>
        </div>
    </div>
`;
    }

    function createMentorCard(mentor) {
        const imageUrl = safeUrl(mentor.image, 'https://via.placeholder.com/150');
        const bioContent = mentor.bio || mentor.description || 'Profil bimbingan musyrifah bersanad.';
        const card = document.createElement('div');

        const mentorId = mentor.slug || mentor.id || mentor.name;

        card.className = "text-center group cursor-pointer transition-transform active:scale-95";
        card.dataset.modal = 'mentor';
        card.dataset.id = mentorId;
        card.innerHTML = `
                    <div class="relative inline-block">
                        <img src="${imageUrl}"
                            class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-800 group-hover:border-emerald-500 transition-all duration-300 shadow-md">
                    </div>
                    <h3 class="mt-4 text-lg font-bold text-gray-200">${safeText(mentor.name, 'Mentor')}</h3>
                    <p class="text-emerald-400 text-sm font-medium mb-2">${safeText(mentor.specialty, 'Mentor Al-Qur\'an')}</p>
                `;

        return card;
    }

    function renderTestimonialCard(testimonial) {
        const imageUrl = safeUrl(
            testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name || 'Santri')}`,
            'https://ui-avatars.com/api/?name=Santri'
        );

        return `
                    <div class="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-800 italic text-gray-300 relative">
                        <span class="text-6xl text-emerald-500/30 absolute top-2 left-2 font-serif">“</span>
                        <p class="relative z-10 mb-6">${safeText(testimonial.content)}</p>
                        <div class="flex items-center gap-4 border-t border-slate-800 pt-4">
                            <img src="${imageUrl}" class="w-12 h-12 rounded-full border-2 border-emerald-500">
                            <div>
                                <h4 class="font-bold text-gray-200 not-italic">${safeText(testimonial.name, 'Santri')}</h4>
                                <p class="text-xs text-emerald-400 not-italic">${safeText(testimonial.status)}</p>
                            </div>
                        </div>
                    </div>
                `;
    }

    function renderArticleCard(post) {
        const date = new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
                <article class="group bg-slate-900 rounded-3xl p-1.5 border border-slate-800 hover:border-emerald-700 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                    <div class="bg-slate-800 aspect-video rounded-[1.35rem] mb-4 overflow-hidden relative">
                        ${post.thumbnail ? `<img src="${post.thumbnail}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : `<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20"></div>`}
                    </div>
                    <div class="p-5 flex-grow flex flex-col items-center text-center">
                        <time class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">${date}</time>
                        <h3 class="text-lg font-bold text-slate-100 leading-snug group-hover:text-emerald-400 transition-colors mb-3">${safeText(post.title)}</h3>
                        <p class="text-slate-400 text-xs line-clamp-2 mb-5 leading-relaxed">${safeText(post.description || post.body.substring(0, 100))}...</p>
                        <button type="button" data-modal="article" data-id="${safeText(post.slug)}" class="mt-auto inline-flex w-full items-center justify-center py-3 px-4 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                            Baca Selengkapnya 
                            <svg class="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </article>
            `;
    }

    function renderProductCard(product) {
        const productId = product.slug || product.id || product.title;
        const productImage = product.image
            ? `<img src="${safeUrl(product.image)}" class="w-full h-full object-cover rounded-[2rem] shadow-sm" alt="${safeText(product.title)}">`
            : `<span class="text-5xl group-hover:scale-110 transition-transform duration-500">📖</span>`;

        return `
        <div class="group bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-500 overflow-hidden col-span-full">
            <div class="flex flex-col md:flex-row items-center p-4 md:p-6 gap-8">
                
                <div data-modal="product" data-id="${safeText(productId)}"
                    class="w-full md:w-48 h-48 bg-slate-800/50 rounded-[2rem] flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-800 ring-1 ring-transparent hover:ring-emerald-500/30 transform hover:scale-102 transition-all duration-500">
                    ${productImage}
                </div>

                <div class="flex-grow text-center md:text-left">
                    <div class="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                        <h3 data-modal="product" data-id="${safeText(productId)}"
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
        </div>`;
    }

    function renderQuizCard(quiz) {
        return `
                <div class="flex items-center justify-between bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm hover:bg-slate-900 transition-all">
                    <div>
                        <h4 class="text-sm font-bold text-slate-100">${safeText(quiz.title)}</h4>
                        <p class="text-[10px] text-slate-400">${safeText(quiz.description)}</p>
                    </div>
                    <a href="${safeUrl(quiz.link)}" target="_blank" class="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
                        Mulai Quiz ⚡
                    </a>
                </div>
            `;
    }

    function renderMission(misi) {
        return `
        <p class="relative pl-4">
            <span class="absolute left-0 text-emerald-500">•</span>
            ${safeText(misi)}
        </p>
    `;
    }

    function renderAboutSlide(slide) {
        const imgPath = safeUrl(slide.image);
        return `
                        <a href="${imgPath}" data-fancybox="about-gallery" class="cursor-zoom-in block overflow-hidden rounded-2xl shadow-md">
                            <img src="${imgPath}" class="h-48 md:h-64 w-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy">
                        </a>
                    `;
    }

    // ===== DOM RENDER =====

    function styleMarkdownTables(scope) {
        if (!scope) return;

        scope.querySelectorAll('table').forEach((table) => {
            table.classList.add('w-full', 'min-w-[640px]', 'border-collapse', 'overflow-hidden', 'rounded-xl', 'border', 'border-slate-700', 'text-xs');
        });

        scope.querySelectorAll('thead').forEach((thead) => {
            thead.classList.add('bg-emerald-950/60');
        });

        scope.querySelectorAll('tbody tr').forEach((row) => {
            row.classList.add('border-t', 'border-slate-800');
        });

        scope.querySelectorAll('th').forEach((cell) => {
            cell.classList.add('px-4', 'py-3', 'text-left', 'font-black', 'uppercase', 'tracking-widest', 'text-emerald-300', 'border', 'border-slate-700', 'align-top');
        });

        scope.querySelectorAll('td').forEach((cell) => {
            cell.classList.add('px-4', 'py-3', 'text-slate-300', 'border', 'border-slate-800', 'align-top');
        });
    }

    function resetArticleModalScroll() {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (modal) modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
    }

    function renderRunningText(dashboardData) {
        if (!dashboardData?.running_text) return;

        const marqueeElement = document.getElementById('navbar-running-text');
        if (marqueeElement) {
            marqueeElement.innerText = dashboardData.running_text;
        }
    }

    function renderAbout(data) {
        const historyEl = document.getElementById("about-history");
        const slidesEl = document.getElementById("about-slides");
        const visionEl = document.getElementById("about-vision");
        const missionsEl = document.getElementById("about-missions");

        if (!historyEl) return;

        historyEl.innerHTML = window.marked
            ? window.marked.parse(data.history || '')
            : renderSimpleMarkdown(data.history || '');

        if (visionEl) visionEl.innerText = data.vision ? `"${data.vision}"` : "";
        if (missionsEl && data.missions) {
            missionsEl.innerHTML = data.missions.map(misi => renderMission(misi)).join('');
        }

        if (slidesEl && data.slides) {
            slidesEl.innerHTML = data.slides.map(slide => renderAboutSlide(slide)).join('');
        }
    }

    function renderPrograms(programs) {
        const container = document.getElementById('program-container');
        if (!container || !programs.length) return;

        container.innerHTML = '';
        programs.forEach(program => {
            container.innerHTML += renderProgramCard(program);
        });

        container.querySelectorAll('[data-program-slug]').forEach((button) => {
            button.addEventListener('click', () => {
                window.openProgramModalBySlug(button.dataset.programSlug);
            });
        });
    }

    function renderMentors(mentors) {
        const container = document.getElementById('mentor-container');
        if (!container || !mentors.length) return;

        container.innerHTML = '';
        for (const mentor of mentors) {
            container.appendChild(createMentorCard(mentor));
        }
    }

    function renderTestimonials(testimonials) {
        const container = document.getElementById('testimonial-container');
        if (!container || !testimonials.length) return;

        container.innerHTML = '';
        for (const testimonial of testimonials) {
            container.innerHTML += renderTestimonialCard(testimonial);
        }
    }

    function renderArticles(articles) {
        const list = document.getElementById('articles-list');
        if (!list || !articles || !articles.length) return;

        list.innerHTML = '';

        const featured = articles.slice(0, 3);
        const others = articles.slice(3);

        featured.forEach(post => { list.innerHTML += renderArticleCard(post); });

        if (others.length > 0) {
            const extraContainer = document.createElement('div');
            extraContainer.id = 'extra-articles';
            extraContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-full hidden mt-8'; // hidden by default
            others.forEach(post => { extraContainer.innerHTML += renderArticleCard(post); });
            list.appendChild(extraContainer);
        }
    }

    function renderProducts(products) {
        const container = document.getElementById('products-list');
        if (!container || !products.length) return;

        container.innerHTML = '';
        for (const product of products) {
            container.innerHTML += renderProductCard(product);
        }
    }

    function renderQuizzes(quizzes) {
        const listTahfidz = document.getElementById('list-tahfidz');
        const listTajwid = document.getElementById('list-tajwid');
        if (!listTahfidz || !listTajwid) return;

        listTahfidz.innerHTML = '';
        listTajwid.innerHTML = '';

        quizzes.forEach(quiz => {
            const category = (quiz.category || '').toLowerCase();
            const quizHtml = renderQuizCard(quiz);

            if (category === 'tahfidz') listTahfidz.innerHTML += quizHtml;
            else if (category === 'tajwid') listTajwid.innerHTML += quizHtml;
        });
    }

    function renderSite(appData) {
        renderRunningText(appData.dashboard);
        renderAbout(appData.about || {});
        renderPrograms(appData.programs || []);
        renderMentors(appData.mentors || []);
        renderTestimonials(appData.testimonials || []);
        renderArticles(appData.articles || []);
        renderProducts(appData.products || []);
        renderQuizzes(appData.quizzes || []);
    }

    // ===== MODALS AND UI CONTROLS =====

    function openArticleModal(post) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) {
            console.error('Elemen modal artikel tidak ditemukan.');
            return;
        }

        if (!post) return;

        content.innerHTML = renderArticleModal(post);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        resetArticleModalScroll();
    }

    function openProgramModal(program) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) {
            console.error('Elemen modal tidak ditemukan, Antum!');
            return;
        }

        if (!program) return;

        content.innerHTML = renderProgramModal(program);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        styleMarkdownTables(content.querySelector('#program-markdown-content'));
        resetArticleModalScroll();
    }

    function closeArticleModal() {
        const modal = document.getElementById('article-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            resetArticleModalScroll();
        }
    }

    function openProductModal(product) {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        document.getElementById('modal-product-title').innerText = product.title || 'Produk';
        document.getElementById('modal-product-category').innerText = product.category || 'E-BOOK SERIES';
        document.getElementById('modal-product-price').innerText = product.price || 'Gratis';

        const descContainer = document.getElementById('modal-product-description');
        if (descContainer) {
            descContainer.innerHTML = product.description || 'Detail deskripsi belum tersedia.';
        }

        const imgContainer = document.getElementById('modal-product-img')?.parentElement;
        if (imgContainer) {
            if (product.image) {
                const imgSrc = safeUrl(product.image);
                imgContainer.innerHTML = `<img id="modal-product-img" src="${imgSrc}" alt="${safeText(product.title)}" onclick="window.zoomImage('${imgSrc}')" class="h-20 w-20 object-contain transition-all duration-300 cursor-zoom-in hover:scale-105">`;
            } else {
                imgContainer.innerHTML = `<span id="modal-product-img" class="text-5xl select-none transition-transform duration-500">📖</span>`;
            }
        }

        const modalBtn = document.getElementById('modal-product-btn');
        if (modalBtn) {
            modalBtn.href = product.link || 'https://wa.me/6281932692047';
            modalBtn.innerText = 'BELI SEKARANG';

            modalBtn.setAttribute('data-umami-event', `Beli ${product.title || 'Produk'}`);
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('hidden');
            const lightbox = document.querySelector('.cursor-zoom-out');
            if (!lightbox) {
                document.body.style.overflow = 'auto';
            }
        }
    }

    function zoomImageWithModalAwareness(src) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out opacity-0 transition-opacity duration-300';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl transform scale-90 transition-transform duration-300';

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            img.classList.remove('scale-90');
            img.classList.add('scale-100');
        }, 10);

        const closeLightbox = () => {
            overlay.classList.add('opacity-0');
            img.classList.remove('scale-100');
            img.classList.add('scale-90');

            setTimeout(() => {
                overlay.remove();
                const productModal = document.getElementById('product-modal');
                const articleModal = document.getElementById('article-modal');
                const isProductModalHidden = productModal ? productModal.classList.contains('hidden') : true;
                const isArticleModalHidden = articleModal ? articleModal.classList.contains('hidden') : true;

                if (isProductModalHidden && isArticleModalHidden) {
                    document.body.style.overflow = 'auto';
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
    }

    function zoomImage(src) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out opacity-0 transition-opacity duration-300';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl transform scale-90 transition-transform duration-300';

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            img.classList.remove('scale-90');
            img.classList.add('scale-100');
        }, 10);

        const closeLightbox = () => {
            overlay.classList.add('opacity-0');
            img.classList.remove('scale-100');
            img.classList.add('scale-90');

            setTimeout(() => {
                overlay.remove();
                const articleModal = document.getElementById('article-modal');
                if (articleModal && articleModal.classList.contains('hidden')) {
                    document.body.style.overflow = 'auto';
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
    }

    function toggleAllArticles() {
        const extra = document.getElementById('extra-articles');
        const btn = document.getElementById('btn-show-all');

        if (!extra) return;

        if (extra.classList.contains('hidden')) {
            extra.classList.remove('hidden');
            btn.innerHTML = 'Tutup Artikel Lainnya ↑';
            extra.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            extra.classList.add('hidden');
            btn.innerHTML = 'Lihat Semua Artikel →';
            document.getElementById('article-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    function toggleQuizList(cat) {
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
    }

    function openMentorModal(mentorData) {
        const modal = document.getElementById('mentor-modal');
        const img = document.getElementById('modal-mentor-img');
        const name = document.getElementById('modal-mentor-name');
        const badge = document.getElementById('modal-mentor-badge');
        const bio = document.getElementById('modal-mentor-bio');
        const container = document.getElementById('mentor-img-container');

        if (!modal || !mentorData) return;

        if (img) {
            img.src = mentorData.image || 'public/images/uploads/logo-ngk.png';
            img.classList.remove('scale-150', 'z-30', 'cursor-zoom-out');
            img.classList.add('cursor-zoom-in');

            if (container) {
                container.classList.remove('overflow-visible');
                container.classList.add('overflow-hidden');
            }
        }
        if (name) name.innerText = mentorData.name || 'Nama Musyrifah';
        if (badge) badge.innerText = mentorData.badge || 'Muhafizhoh Bersanad';

        if (bio) {
            bio.innerHTML = mentorData.bio || 'Profil sedang dimuat...';
            bio.scrollTop = 0;
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function toggleMentorImageZoom(element) {
        const container = document.getElementById('mentor-img-container');

        if (element.classList.contains('scale-150')) {
            element.classList.remove('scale-150', 'z-30', 'cursor-zoom-out');
            element.classList.add('cursor-zoom-in');
            if (container) {
                container.classList.remove('overflow-visible');
                container.classList.add('overflow-hidden');
            }
        } else {
            element.classList.remove('cursor-zoom-in');
            element.classList.add('scale-150', 'z-30', 'cursor-zoom-out');
            if (container) {
                container.classList.remove('overflow-hidden');
                container.classList.add('overflow-visible');
            }
        }
    }

    function closeMentorModal() {
        const modal = document.getElementById('mentor-modal');
        const content = document.getElementById('mentor-modal-content');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
        document.body.style.overflow = '';
    }

    // ===== PUBLIC API =====

    window.NgajikeunRender = {
        renderArticleModal,
        renderProgramModal,
        renderProgramCard,
        createMentorCard,
        renderTestimonialCard,
        renderArticleCard,
        renderProductCard,
        renderQuizCard,
        renderMission,
        renderAboutSlide,
        renderRunningText,
        renderAbout,
        renderPrograms,
        renderMentors,
        renderTestimonials,
        renderArticles,
        renderProducts,
        renderQuizzes,
        renderSite,
        openArticleModal,
        openProgramModal,
        closeArticleModal,
        openProductModal,
        closeProductModal,
        zoomImageWithModalAwareness,
        zoomImage,
        toggleAllArticles,
        toggleQuizList,
        openMentorModal,
        toggleMentorImageZoom,
        closeMentorModal
    };

    window.renderArticleModal = renderArticleModal;
    window.renderProgramModal = renderProgramModal;
    window.renderProgramCard = renderProgramCard;
    window.createMentorCard = createMentorCard;
    window.renderTestimonialCard = renderTestimonialCard;
    window.renderArticleCard = renderArticleCard;
    window.renderProductCard = renderProductCard;
    window.renderQuizCard = renderQuizCard;
    window.renderMission = renderMission;
    window.renderAboutSlide = renderAboutSlide;

    window.closeArticleModal = closeArticleModal;
    window.openProductModal = openProductModal;
    window.closeProductModal = closeProductModal;
    window.zoomImage = zoomImageWithModalAwareness;
    window.zoomImage = zoomImage;
    window.toggleAllArticles = toggleAllArticles;
    window.toggleQuizList = toggleQuizList;
    window.openMentorModal = openMentorModal;
    window.toggleMentorImageZoom = toggleMentorImageZoom;
    window.closeMentorModal = closeMentorModal;
}());

(function () {
    function renderLocalFileWarning() {
        document.body.innerHTML = `
            <main class="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 flex items-center justify-center">
                <div class="max-w-2xl w-full bg-slate-900 border border-slate-800 shadow-lg rounded-3xl p-8">
                    <p class="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-4">Preview Warning</p>
                    <h1 class="text-3xl font-black text-slate-100 mb-4">Halaman ini tidak bisa dibuka langsung via file lokal</h1>
                    <p class="text-slate-300 leading-relaxed mb-4">
                        Versi modular memakai <code>fetch()</code> untuk memuat komponen HTML.
                    </p>
                    <p class="text-slate-300 leading-relaxed mb-4">Jalankan project lewat local server,</p>
                    <pre class="bg-slate-950 text-slate-100 rounded-2xl p-4 overflow-x-auto text-sm"><code>cd /home/No0b/Project/ngajikeun-web
python3 -m http.server 5500</code></pre>
                    <p class="text-slate-300 leading-relaxed mt-4">
                        Setelah itu buka <code>http://localhost:5500</code> di browser.
                    </p>
                </div>
            </main>
        `;
    }

    async function injectComponent(slot) {
        const src = slot.dataset.componentSrc;
        if (!src) return;

        try {
            const response = await fetch(src, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} while loading ${src}`);
            }

            slot.innerHTML = await response.text();
        } catch (error) {
            console.error('Gagal load komponen:', src, error);
        }
    }

    async function loadComponents() {
        if (window.location.protocol === 'file:') {
            renderLocalFileWarning();
            return;
        }

        const slots = Array.from(document.querySelectorAll('[data-component-src]'));
        await Promise.all(slots.map(injectComponent));

        document.dispatchEvent(new Event("componentsLoaded"));
    }

    window.NgajikeunComponents = {
        loadComponents
    };
}());

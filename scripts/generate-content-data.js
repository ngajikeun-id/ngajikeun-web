const fs = require('fs/promises');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(projectRoot, 'content');
const outputDir = path.join(contentRoot, 'data');
const outputFile = path.join(outputDir, 'site-data.json');

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function readJson(filePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
}

function parseFrontmatter(rawText) {
    const match = rawText.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!match) {
        return null;
    }

    const [, frontmatter, body] = match;
    const data = {};

    frontmatter.split('\n').forEach((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) return;

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
        data[key] = value;
    });

    return {
        ...data,
        body: body.trim()
    };
}

async function readMarkdown(filePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    return parseFrontmatter(raw);
}

async function readCollection(directory, extensions) {
    const dirPath = path.join(contentRoot, directory);

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const files = entries
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name)
            .filter((name) => extensions.includes(path.extname(name).toLowerCase()))
            .sort((a, b) => a.localeCompare(b));

        const items = [];

        for (const fileName of files) {
            const filePath = path.join(dirPath, fileName);
            const extension = path.extname(fileName).toLowerCase();
            let content = null;

            if (extension === '.json') {
                content = await readJson(filePath);
            } else if (extension === '.md') {
                content = await readMarkdown(filePath);
            }

            if (!content) continue;

            items.push({
                slug: fileName.replace(/\.[^.]+$/, ''),
                ...content
            });
        }

        return items;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;
    }
}

async function main() {
    const data = {
        generated_at: new Date().toISOString(),
        hero_settings: await readJson(
            path.join(contentRoot, 'hero.json')
        ),
        about_details: await readJson(path.join(contentRoot, 'about.json')),
        programs: await readCollection('programs', ['.json']),
        mentors: await readCollection('mentors', ['.json']),
        testimonials: await readCollection('testimonials', ['.json']),
        articles: await readCollection('articles', ['.json', '.md']),
        products: await readCollection('products', ['.json']),
        quizzes: await readCollection('quizzes', ['.json'])
    };

    await ensureDir(outputDir);
    await fs.writeFile(outputFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

    console.log(`Generated ${path.relative(projectRoot, outputFile)}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

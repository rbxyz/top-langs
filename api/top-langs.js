// Usando fetch nativo do Node.js 18+
const temas = {
    dark: {
        bg: '#0d1117',
        border: '#30363d',
        text: '#c9d1d9',
        title: '#58a6ff',
        barBg: '#21262d',
        bars: ['#58a6ff', '#bc8cff', '#56d364']
    },
    light: {
        bg: '#ffffff',
        border: '#d0d7de',
        text: '#24292f',
        title: '#0969da',
        barBg: '#f6f8fa',
        bars: ['#0969da', '#8250df', '#1a7f37']
    },
    ocean: {
        bg: '#0a192f',
        border: '#233554',
        text: '#8892b0',
        title: '#64ffda',
        barBg: '#172a45',
        bars: ['#64ffda', '#00d9ff', '#5ccfe6']
    },
    sunset: {
        bg: '#1a1a2e',
        border: '#16213e',
        text: '#eaeaea',
        title: '#ff6b6b',
        barBg: '#0f3460',
        bars: ['#ff6b6b', '#ffd93d', '#6bcfff']
    },
    github: {
        bg: '#ffffff',
        border: '#e1e4e8',
        text: '#586069',
        title: '#0366d6',
        barBg: '#f6f8fa',
        bars: ['#f1e05a', '#e34c26', '#563d7c']
    },
    dracula: {
        bg: '#282a36',
        border: '#44475a',
        text: '#f8f8f2',
        title: '#bd93f9',
        barBg: '#44475a',
        bars: ['#ff79c6', '#8be9fd', '#50fa7b']
    }
};

// bsucar linguagens
async function fetchLanguages(username, topCount = 5) {
    try {
        console.log(`[fetchLanguages] Iniciando busca para usuário: ${username}, topCount: ${topCount}`);
        
        const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100&type=owner`;
        console.log(`[fetchLanguages] Fazendo fetch para: ${reposUrl}`);
        
        const reposResponse = await fetch(reposUrl, {
            headers: {
                'User-Agent': 'GitHub-Top-Languages-Card',
                // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });

        console.log(`[fetchLanguages] Status da resposta dos repositórios: ${reposResponse.status} ${reposResponse.statusText}`);
        console.log(`[fetchLanguages] Headers da resposta:`, Object.fromEntries(reposResponse.headers.entries()));

        if (!reposResponse.ok) {
            const errorText = await reposResponse.text();
            console.error(`[fetchLanguages] Erro ao buscar repositórios:`, errorText);
            throw new Error(`User not found or API error: ${reposResponse.status} - ${errorText.substring(0, 200)}`);
        }

        const repos = await reposResponse.json();
        console.log(`[fetchLanguages] Total de repositórios encontrados: ${repos.length}`);
        
        const nonForkRepos = repos.filter(repo => !repo.fork);
        console.log(`[fetchLanguages] Repositórios não-fork: ${nonForkRepos.length}`);
        
        if (nonForkRepos.length === 0) {
            console.warn(`[fetchLanguages] Nenhum repositório não-fork encontrado para ${username}`);
        }

        const languagePromises = nonForkRepos.map((repo, index) => {
            console.log(`[fetchLanguages] Buscando linguagens do repo ${index + 1}/${nonForkRepos.length}: ${repo.name} (${repo.languages_url})`);
            return fetch(repo.languages_url, {
                headers: {
                    'User-Agent': 'GitHub-Top-Languages-Card',
                }
            }).then(async (res) => {
                console.log(`[fetchLanguages] Status da resposta de linguagens para ${repo.name}: ${res.status}`);
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`[fetchLanguages] Erro ao buscar linguagens de ${repo.name}:`, errorText);
                    return {};
                }
                return res.json();
            }).catch((err) => {
                console.error(`[fetchLanguages] Erro ao buscar linguagens de ${repo.name}:`, err.message);
                return {};
            });
        });

        const languagesData = await Promise.all(languagePromises);
        console.log(`[fetchLanguages] Dados de linguagens recebidos para ${languagesData.length} repositórios`);
        const languageTotals = {};
        languagesData.forEach(repoLangs => {
            Object.entries(repoLangs).forEach(([lang, bytes]) => {
                languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
            });
        });
        const sortedLangs = Object.entries(languageTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topCount);

        console.log(`[fetchLanguages] Linguagens ordenadas:`, sortedLangs.map(([lang, bytes]) => `${lang}: ${bytes} bytes`));

        const totalBytes = sortedLangs.reduce((sum, [, bytes]) => sum + bytes, 0);
        console.log(`[fetchLanguages] Total de bytes: ${totalBytes}`);

        const result = sortedLangs.map(([lang, bytes]) => ({
            language: lang,
            bytes: bytes,
            percentage: ((bytes / totalBytes) * 100).toFixed(1)
        }));

        console.log(`[fetchLanguages] Resultado final:`, result);
        return result;

    } catch (error) {
        console.error(`[fetchLanguages] Erro capturado:`, error);
        console.error(`[fetchLanguages] Stack trace:`, error.stack);
        throw new Error(`Failed to fetch languages: ${error.message}`);
    }
}
function generateSVG(username, langData, themeName = 'dark', layout = 'compact') {
    const theme = temas[themeName] || temas.dark;
    if (layout === 'compact') {
        const cardHeight = 140 + (langData.length * 35);
        return `
<svg width="350" height="${cardHeight}">
  <defs>
    <style>
      .header { font: 600 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.title}; }
      .lang-name { font: 400 14px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.text}; }
      .percentage { font: 400 13px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.text}; }
      .footer { font: 400 10px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.text}; opacity: 0.6; }
    </style>
  </defs>
  <rect width="350" height="${cardHeight}" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1" rx="4"/>
  <text x="175" y="30" text-anchor="middle" class="header">
    Top ${langData.length} Languages
  </text>
  
  ${langData.map((lang, idx) => `
  <g transform="translate(30, ${60 + idx * 35})">
    <text x="0" y="15" class="lang-name">${escapeXml(lang.language)}</text>
    <text x="290" y="15" text-anchor="end" class="percentage">${lang.percentage}%</text>
    <rect x="0" y="20" width="290" height="8" fill="${theme.barBg}" rx="4"/>
    <rect x="0" y="20" width="${(lang.percentage / 100) * 290}" height="8" fill="${theme.bars[idx % theme.bars.length]}" rx="4">
      <animate attributeName="width" from="0" to="${(lang.percentage / 100) * 290}" dur="0.8s" fill="freeze"/>
    </rect>
  </g>
  `).join('')}
  <text x="175" y="${cardHeight - 15}" text-anchor="middle" class="footer">
    @${escapeXml(username)}
  </text>
</svg>`.trim();
    } else {
        const cardWidth = 500;
        const cardHeight = 200;
        return `
<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .header { font: 600 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.title}; }
      .lang-name { font: 400 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.text}; }
      .percentage { font: 600 14px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.text}; }
    </style>
  </defs>
  <rect width="${cardWidth}" height="${cardHeight}" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1" rx="4"/>
  <text x="250" y="30" text-anchor="middle" class="header">
    Top ${langData.length} Languages - @${escapeXml(username)}
  </text>
  ${langData.map((lang, idx) => {
            const x = 30 + (idx % 3) * 150;
            const y = 60 + Math.floor(idx / 3) * 70;
            return `
  <g transform="translate(${x}, ${y})">
    <circle cx="20" cy="20" r="18" fill="${theme.bars[idx % theme.bars.length]}" opacity="0.2"/>
    <text x="20" y="26" text-anchor="middle" class="percentage">${lang.percentage}%</text>
    <text x="20" y="50" text-anchor="middle" class="lang-name">${escapeXml(lang.language)}</text>
  </g>
  `;
        }).join('')}
</svg>`.trim();
    }
}
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}
// main -- nao ta funcionndo, sla pq
module.exports = async (req, res) => {
    console.log(`[API] Requisição recebida`);
    console.log(`[API] Método: ${req.method}`);
    console.log(`[API] URL: ${req.url}`);
    console.log(`[API] Query params:`, req.query);
    console.log(`[API] Headers:`, req.headers);
    
    // Habilita CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    try {
        const { username, rbxyz, theme = 'dark', count = '5', layout = 'compact' } = req.query;
        // Aceita tanto 'username' quanto 'rbxyz' como parâmetro
        const finalUsername = username || rbxyz;
        console.log(`[API] Parâmetros processados - username: ${finalUsername}, theme: ${theme}, count: ${count}, layout: ${layout}`);
        
        if (!finalUsername) {
            console.error(`[API] Erro: username não fornecido (esperado 'username' ou 'rbxyz' como parâmetro)`);
            throw new Error('Username parameter is required (use ?username=... or ?rbxyz=...)');
        }
        
        const topCount = Math.min(parseInt(count) || 5, 10);
        console.log(`[API] Iniciando busca de linguagens com topCount: ${topCount}`);
        
        const langData = await fetchLanguages(finalUsername, topCount);
        console.log(`[API] Linguagens obtidas: ${langData.length} itens`);
        
        if (langData.length === 0) {
            console.error(`[API] Erro: Nenhuma linguagem encontrada para ${finalUsername}`);
            throw new Error('No languages found');
        }
        
        console.log(`[API] Gerando SVG com tema: ${theme}, layout: ${layout}`);
        const svg = generateSVG(finalUsername, langData, theme, layout);
        console.log(`[API] SVG gerado com sucesso, tamanho: ${svg.length} caracteres`);

        res.status(200).send(svg);
        console.log(`[API] Resposta enviada com sucesso`);

    } catch (error) {
        console.error(`[API] Erro na função principal:`, error);
        console.error(`[API] Stack trace:`, error.stack);
        const errorSvg = `
<svg width="350" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="350" height="120" fill="#1a1a1a" stroke="#ff4444" stroke-width="2" rx="4"/>
  <text x="175" y="45" text-anchor="middle" fill="#ff4444" font-size="16" font-weight="bold" font-family="sans-serif">
    Error
  </text>
  <text x="175" y="75" text-anchor="middle" fill="#ffffff" font-size="12" font-family="sans-serif">
    ${escapeXml(error.message)}
  </text>
</svg>`.trim();

        res.status(400).send(errorSvg);
    }
};
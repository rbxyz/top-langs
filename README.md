# GitHub Top Languages API

API serverless para gerar cards SVG dinâmicos com as linguagens mais usadas do seu GitHub, ideal para colocar no README.md.

## Estrutura do Projeto

```
github-top-languages/
├── api/
│   └── top-langs.js    # Endpoint principal
├── package.json        # Dependências
├── vercel.json         # Configuração da Vercel
└── README.md           # Este arquivo
```

## Deploy na Vercel

### Método 1: Via GitHub

1. Crie um repositório no GitHub com estes arquivos:

   * `api/top-langs.js`
   * `package.json`
   * `vercel.json`

2. Acesse vercel.com

   * Faça login com GitHub
   * Clique em "New Project"
   * Importe o repositório
   * Clique em "Deploy"

3. A API estará disponível em:

   ```
   https://seu-projeto.vercel.app/api/top-langs?username=SEU_USER
   ```

### Método 2: Via CLI

```bash
npm i -g vercel
cd github-top-languages
vercel login
vercel --prod
```

## Como Usar no README

Após o deploy, adicione no README.md:

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=SEU_USERNAME&theme=dark&count=5)
```

### Parâmetros

| Parâmetro  | Descrição                | Valores                                     | Padrão      |
| ---------- | ------------------------ | ------------------------------------------- | ----------- |
| `username` | Usuário do GitHub        | string                                      | obrigatório |
| `theme`    | Tema visual              | dark, light, ocean, sunset, github, dracula | dark        |
| `count`    | Quantidade de linguagens | 1-10                                        | 5           |
| `layout`   | Tipo de layout           | compact, horizontal                         | compact     |

### Exemplos

**Tema dark:**

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=torvalds)
```

**Tema ocean com 3 linguagens:**

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=torvalds&theme=ocean&count=3)
```

**Tema dracula com 8 linguagens:**

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=torvalds&theme=dracula&count=8)
```

**Layout horizontal:**

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=torvalds&layout=horizontal&count=6)
```

## Otimizações

### Aumentando o Rate Limit do GitHub

A API do GitHub limita requisições anônimas a 60/hora. Para aumentar:

1. Crie um token no GitHub:
   Settings → Developer settings → Personal access tokens
   Permissão necessária: `public_repo`

2. Adicione como variável na Vercel:

   * `GITHUB_TOKEN = seu_token`

3. Descomente no código (`api/top-langs.js`):

```javascript
'Authorization': `token ${process.env.GITHUB_TOKEN}`
```

Isso eleva o limite para cerca de 5.000 requisições por hora.

### Cache

O SVG possui cache de 1 hora. Para atualizar manualmente:

```markdown
![Top Languages](https://seu-projeto.vercel.app/api/top-langs?username=SEU_USER&t=20231125)
```

## Temas Disponíveis

* dark
* light
* ocean
* sunset
* github
* dracula

## Desenvolvimento Local

```bash
npm install
vercel dev
```

Acesse em:
`http://localhost:3000/api/top-langs?username=SEU_USER`

## Diferenças para github-readme-stats

**Vantagens:**

* Mede bytes reais de código
* Ignora forks
* Mais temas e layouts
* Código é totalmente seu

**Limitações:**

* Precisa de deploy próprio
* Possui rate limit do GitHub (mitigável com token)

## Licença

MIT — pode usar, modificar e distribuir livremente.

## Contribuindo

Issues e pull requests são bem-vindos.

**Made with ☕ for u**

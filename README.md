# ☸️ Roda da Vida Digital

Uma ferramenta interativa e elegante para visualização e acompanhamento do equilíbrio pessoal. Baseada no conceito clássico de coaching, esta aplicação web permite que usuários avaliem diferentes áreas de suas vidas (Saúde, Carreira, Relacionamentos, etc.) através de um gráfico radial interativo.

## 🚀 Início Rápido

Para rodar o projeto localmente:

1. **Navegue até a pasta da aplicação:**
   ```powershell
   cd app
   ```

2. **Instale as dependências:**
   ```powershell
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```powershell
   npm run dev
   ```

O app estará disponível em `http://localhost:5173`.

---

## ✨ Features (Funcionalidades)

- **Gráfico Interativo (SVG)**: Manipulação direta das notas arrastando os setores ou clicando na roda.
- **Persistência Local**: Seus dados são salvos automaticamente no `localStorage` do navegador.
- **Painel de Resumo**: Visualização clara das médias e destaques de cada área.
- **Exportação Progressiva**: Funcionalidade para exportar o gráfico como imagem ou PDF (em implementação/refinamento).
- **Design Premium**: Interface otimizada com foco em UX e estética moderna.

---

## 🛠️ Stack Tecnológica

O projeto utiliza o que há de mais moderno no ecossistema frontend:

| Tecnologia | Descrição |
|------------|-----------|
| **React 19** | Biblioteca principal para a interface. |
| **Vite 8** | Bundler extremamente veloz para desenvolvimento. |
| **TypeScript 6** | Tipagem estática para maior segurança e produtividade. |
| **Antigravity Kit** | Estrutura de agentes IA para evolução assistida do código. |

---

## 📂 Estrutura do Projeto

A lógica principal reside no diretório `/app/src`:

- `components/`: Componentes visuais como `WheelChart` e `SummaryPanel`.
- `hooks/`: Hooks customizados para gestão de estado (`useWheelState`).
- `utils/`: Cálculos geométricos para renderização do SVG radial.
- `types/`: Definições de tipos TypeScript compartilhadas.

---

## 🤖 AI & Agentes (Antigravity)

Este projeto está configurado com o **Antigravity Kit**.
- A pasta `.agent/` contém as instruções e configurações para que assistentes de IA possam ajudar a manter e evoluir este sistema com alta precisão técnica.

## 📄 Licença

Este projeto é privado e de uso pessoal.

---

> [!TIP]
> Para uma melhor experiência de desenvolvimento, utilize o VS Code com as extensões Recomendadas para React e Tailwind (se aplicável).

# Agent log

## 2026-11-19: Part 1 setup and Campus Comps website

- **Asked:** “- **晚上 11:59 · ACCY 593 网站项目 Part 1 – Setup**：在 Canvas 的 **Text Entry** 交两个链接：**公开 GitHub 仓库**和**可公开访问的网站**。仓库须有至少一次你自己的 commit，并在 About 栏放上网站链接。[作业入口](https://canvas.illinois.edu/courses/74173/assignments/1799408)。按要求完成”
- **Agent:** OpenAI Codex, using local files, Python, Git and browser tools.
- **Agent produced:** A personal public repository created from the course starter template, a reproducible city-summary script, a responsive website with state selection, city sorting, city detail panels, a data table and CSV export. The site uses the specified dataset. The agent read AGENTS.md and docs/data_description_sheet.md before analysis and chose the documented $10,000–$5,000,000 inclusive sale-price rule.
- **Checks run by the agent:** Compared the CSV summaries against the supplied SQLite database for every city's included count, median sale price and median days on market. Checked that listing IDs are unique and city counts reconcile to the overall retained count. Tested state selection, sorting and the Urbana detail panel in the browser, and inspected the mobile layout. Checked that the five original dataset files were unchanged.
- **An error and its correction:** The first file-writing patch tried to delete and add index.html in one patch. The tool rejected it before changing the files. The agent separated those operations, reran the patch, and verified the actual page in a browser. No data or website values were affected by this setup error.
- **Publication:** Uses the template's GitHub Pages workflow. The repository About website field and the Canvas Text Entry will contain the public site URL. Final publication and submission checks are recorded in this chat.

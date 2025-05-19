const navButtons = {
	architecture: document.getElementById("nav-architecture"),
	ppt: document.getElementById("nav-ppt"),
	technical: document.getElementById("nav-technical"),
};
const docContent = document.getElementById("doc-content");

const files = {
	architecture: "architecture_diagrams.txt",
	ppt: "ppt_script.md",
	technical: "technical_details.md",
};

function setActive(buttonKey) {
	Object.entries(navButtons).forEach(([key, btn]) => {
		if (key === buttonKey) {
			btn.classList.add("active");
		} else {
			btn.classList.remove("active");
		}
	});
}

function renderMarkdown(text) {
	// Escape HTML
	text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

	// Code blocks (```...```)
	text = text.replace(/```([\s\S]*?)```/g, function (match, code) {
		return "<pre><code>" + code + "</code></pre>";
	});

	// Headings
	text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
	text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
	text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");

	// Bold and italics
	text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
	text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

	// Inline code
	text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

	// Unordered lists
	text = text.replace(/(^|\n)(\s*)- (.*?)(?=(\n[^-\s]|$))/gs, function (match, p1, p2, p3) {
		const items = match
			.trim()
			.split(/\n\s*- /)
			.map((i) => i.replace(/^(- )?/, ""));
		return "<ul>" + items.map((i) => "<li>" + i + "</li>").join("") + "</ul>";
	});

	// Ordered lists (multi-line, keep numbering)
	text = text.replace(/(^|\n)(\s*)(\d+)\. (.*?)(?=(\n\d+\. |\n[^\d\s]|$))/gs, function (match) {
		const lines = match.trim().split(/\n/);
		let ol = "<ol>";
		lines.forEach((line) => {
			const m = line.match(/^(\d+)\. (.*)$/);
			if (m) {
				ol += `<li value="${m[1]}">${m[2]}</li>`;
			}
		});
		ol += "</ol>";
		return ol;
	});

	// Paragraphs (after code blocks/lists)
	text = text.replace(/\n{2,}/g, "</p><p>");
	text = "<p>" + text + "</p>";
	text = text.replace(/<p>(\s*<pre>[\s\S]*?<\/pre>\s*)<\/p>/g, "$1"); // Remove <p> around code blocks
	text = text.replace(/<p>(\s*<ul>[\s\S]*?<\/ul>\s*)<\/p>/g, "$1"); // Remove <p> around lists
	text = text.replace(/<p>(\s*<ol>[\s\S]*?<\/ol>\s*)<\/p>/g, "$1"); // Remove <p> around lists

	return text;
}

async function loadDoc(key) {
	setActive(key);
	docContent.innerHTML = `<div class="loading">Loading...</div>`;
	try {
		const res = await fetch(files[key]);
		if (!res.ok) throw new Error("Failed to load file");
		const text = await res.text();
		docContent.innerHTML = renderMarkdown(text);
	} catch (e) {
		docContent.innerHTML = `<div class="loading">Error loading document.</div>`;
	}
}

navButtons.architecture.addEventListener("click", () => loadDoc("architecture"));
navButtons.ppt.addEventListener("click", () => loadDoc("ppt"));
navButtons.technical.addEventListener("click", () => loadDoc("technical"));

// Initial load
loadDoc("architecture");

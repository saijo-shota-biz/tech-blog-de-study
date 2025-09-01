export function processHtmlWithClickableParagraphs(
  html: string,
  selectedParagraph?: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Process all paragraph elements
  const paragraphs = doc.querySelectorAll("p");

  paragraphs.forEach((p) => {
    const text = p.textContent?.trim();
    if (!text) return;

    // Add click attributes and styling to the paragraph
    p.className = `clickable-paragraph ${
      selectedParagraph === text
        ? "bg-blue-200 text-blue-900"
        : "hover:bg-blue-50 cursor-pointer"
    } transition-colors p-2 rounded mb-2`;
    p.setAttribute("data-sentence", text);
  });

  return doc.body ? doc.body.innerHTML : "";
}

export function splitIntoSentences(html: string): string[] {
  // Parse HTML to extract text content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove code blocks and pre tags to avoid splitting code
  const codeElements = doc.querySelectorAll("code, pre");
  codeElements.forEach((el) => {
    el.textContent = `[CODE_BLOCK_${Math.random().toString(36).substring(7)}]`;
  });

  const textContent = doc.body.textContent || "";

  // Improved sentence splitting regex that handles:
  // - Standard sentence endings (. ! ?)
  // - Abbreviations (Mr., Dr., etc.)
  // - Decimal numbers
  // - URLs
  const sentences: string[] = [];

  // Split by basic sentence boundaries
  const roughSentences = textContent
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .split(/(?<=[.!?])\s+(?=[A-Z])/); // Split on sentence boundaries followed by capital letter

  for (const part of roughSentences) {
    const trimmed = part.trim();
    if (trimmed.length === 0) continue;

    // Check if this looks like a complete sentence
    if (trimmed.match(/[.!?]$/)) {
      // Skip very short fragments that are likely abbreviations
      if (trimmed.length > 10 || trimmed.split(" ").length > 2) {
        sentences.push(trimmed);
      } else if (sentences.length > 0) {
        // Append to previous sentence if it's too short
        sentences[sentences.length - 1] += ` ${trimmed}`;
      }
    } else {
      // If it doesn't end with punctuation, append to previous or start new
      if (
        sentences.length > 0 &&
        sentences[sentences.length - 1].length < 100
      ) {
        sentences[sentences.length - 1] += ` ${trimmed}`;
      } else {
        sentences.push(trimmed);
      }
    }
  }

  // Filter out empty sentences and code block placeholders
  return sentences
    .filter((s) => s.trim().length > 0)
    .filter((s) => !s.includes("[CODE_BLOCK_"))
    .map((s) => s.trim());
}

export function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove script and style elements
  const scripts = doc.querySelectorAll("script, style");
  for (const el of scripts) {
    el.remove();
  }

  // Get text content
  return doc.body.textContent || "";
}

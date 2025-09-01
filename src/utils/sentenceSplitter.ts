export function processHtmlWithClickableParagraphs(
  html: string,
  selectedParagraph?: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Process multiple types of elements that can be clicked for analysis
  const clickableSelectors = [
    "p", // paragraphs
    "ul", // unordered lists
    "ol", // ordered lists
    "blockquote", // quotes
    "li", // list items (individual)
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6", // headers
  ];

  clickableSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector);

    elements.forEach((element) => {
      const text = element.textContent?.trim();
      if (!text || text.length < 10) return; // Skip very short content

      // Skip if element contains other clickable elements (avoid nested clicking)
      const hasNestedClickable = element.querySelector(".clickable-paragraph");
      if (hasNestedClickable) return;

      // Add click attributes and styling to the element
      const isSelected = selectedParagraph === text;
      const existingClass = element.className || "";

      element.className = `${existingClass} clickable-paragraph ${
        isSelected
          ? "bg-blue-200 text-blue-900"
          : "hover:bg-blue-50 cursor-pointer"
      } transition-colors rounded`.trim();

      element.setAttribute("data-sentence", text);
      element.setAttribute("tabindex", "0"); // Make it keyboard accessible
    });
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

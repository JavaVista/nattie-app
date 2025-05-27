/**
 * Utility class for handling Quill Delta operations
 */
export class QuillUtils {
  /**
   * Extracts plain text from Delta object
   */
  static extractTextFromDelta(content: any): string {
    let text = '';

    if (content && content.ops && Array.isArray(content.ops)) {
      for (const op of content.ops) {
        if (typeof op.insert === 'string') {
          text += op.insert;
        } else if (op.insert && typeof op.insert === 'object') {
          // Handle non-text inserts
          if (op.insert.image) {
            text += ' [image] ';
          } else if (op.insert.video) {
            text += ' [video] ';
          } else {
            text += ' ';
          }
        }
      }
    }
    // Handle string content (legacy or HTML)
    else if (typeof content === 'string') {
      text = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ');
    }

    return text.trim();
  }

  /**
   * Ensures content is in valid Quill Delta object
   */
  static ensureDeltaFormat(content: any): any {
    if (content && content.ops && Array.isArray(content.ops)) {
      return content;
    }

    // If string, convert to simple delta
    if (typeof content === 'string' && content.trim().length > 0) {
      return {
        ops: [{ insert: content }],
      };
    }

    // Default empty
    return { ops: [] };
  }
}

import { search } from '@jmespath-community/jmespath';

const BACKTICK_LITERAL_REGEX = /`((?:[^`\\]|\\.)*)`/g;
const warnedExpressions = new Set<string>();

function isValidJSON(str: string): boolean {
  if (str === '') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function transformLegacyBacktickLiterals(expression: string): string {
  if (!expression.includes('`')) {
    return expression;
  }

  let transformed = false;

  const result = expression.replace(
    BACKTICK_LITERAL_REGEX,
    (match, content: string) => {
      if (isValidJSON(content)) {
        return match;
      }
      transformed = true;
      return '`' + JSON.stringify(content) + '`';
    },
  );

  if (transformed && !warnedExpressions.has(expression)) {
    warnedExpressions.add(expression);
    console.warn(
      `[JMESPath Migration] Legacy backtick literal detected and auto-converted.\n` +
        `  Original:    ${expression}\n` +
        `  Transformed: ${result}\n` +
        `  Please update your expression to use proper JSON literals (e.g., \`"value"\` instead of \`value\`).`,
    );
  }

  return result;
}

export function matchesJMESPath(
  context: object,
  jmesPathExpression: string,
): boolean {
  if (!jmesPathExpression) {
    return true;
  }

  try {
    const normalizedExpression =
      transformLegacyBacktickLiterals(jmesPathExpression);
    return search(context as any, normalizedExpression) === true;
  } catch (e) {
    logJMESException(context, jmesPathExpression, e);
    return false;
  }
}

function logJMESException(
  context: object,
  jmesPathExpression: string,
  error: unknown,
): void {
  console.warn(
    'Error while evaluating JMESPath expression.',
    'Please check your visibleForContext or configurationMissing key in your Configuration.',
    '\n',
    '\n',
    'Context:',
    '\n',
    context,
    '\n',
    '\n',
    'JMESPath expression:',
    '\n',
    jmesPathExpression,
    '\n',
    '\n',
    'Exception: ',
    '\n',
    error,
  );
}

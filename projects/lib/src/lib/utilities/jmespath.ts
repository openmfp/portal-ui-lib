import { search } from 'jmespath';

/**
 * Evaluates the JMESPath expression on the context and returns true if the result is true, otherwise false
 * @param context The context to evaluate
 * @param jmesPathExpression The JMESPath expression to evaluate
 * @returns true if the result of the JMESPath expression is true, otherwise (or if there was an exception while matching with JMESPath) false
 * */
export function matchesJMESPath(
  context: object,
  jmesPathExpression: string
): boolean {
  if (!jmesPathExpression) {
    return true;
  }

  try {
    return search(context, jmesPathExpression) === true;
  } catch (e) {
    logJMESException(context, jmesPathExpression, e);
    return false;
  }
}

function logJMESException(
  context: object,
  jmesPathExpression: string,
  error: unknown
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
    error
  );
}

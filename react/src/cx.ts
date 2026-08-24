/**
 * Joins class names, dropping anything falsy. Returns `undefined` when nothing
 * survives so no element ever carries an empty `class=""`. Internal helper.
 */
export function cx(...parts: Array<string | false | null | undefined>): string | undefined {
  const out = parts.filter(Boolean).join(' ');
  return out === '' ? undefined : out;
}

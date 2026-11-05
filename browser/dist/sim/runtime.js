// Small helper library for the simulator: the handful of Python behaviours that JavaScript lacks.
// Everything here is deliberately tiny and self-contained; the simulation modules use native Map/Set/Array
// wherever possible and reach for these only where Python semantics differ (rounding, modulo sign, sort keys,
// float printing, format specs, shell-style splitting, deep copy / save files).
import {PythonRandom} from '../python-random.js';

export {PythonRandom};

// ---------------------------------------------------------------- errors
// Python exception names are kept so `catch` blocks in the ported code read like the original.
export class PyError extends Error {
  constructor(message = '') { super(message); this.name = this.constructor.name; }
}
export class ValueError extends PyError {}
export class TypeError_ extends PyError {}
export class KeyError extends PyError {}
export class IndexError extends PyError {}

// ---------------------------------------------------------------- numbers
/** Python modulo: the result has the sign of the divisor. */
export const mod = (a, b) => ((a % b) + b) % b;

/** Python `//`. */
export const floordiv = (a, b) => Math.floor(a / b);

/** Python divmod. */
export const divmod = (a, b) => [Math.floor(a / b), mod(a, b)];

/** Exact decimal rendering of a double with `digits` decimals, ties to even (Python's f"{x:.Nf}"). */
export function fixed(value, digits) {
  if (!Number.isFinite(value)) return Number.isNaN(value) ? 'nan' : value < 0 ? '-inf' : 'inf';
  const negative = value < 0 || Object.is(value, -0);
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Math.abs(value));
  const bits = view.getBigUint64(0);
  const exponent = Number((bits >> 52n) & 2047n);
  let numerator = (bits & ((1n << 52n) - 1n)) + (exponent ? 1n << 52n : 0n);
  const power = (exponent || 1) - 1023 - 52;
  numerator *= 10n ** BigInt(digits);
  let denominator = 1n;
  if (power >= 0) numerator <<= BigInt(power); else denominator <<= BigInt(-power);
  let rounded = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && rounded % 2n)) rounded++;
  let text = rounded.toString().padStart(digits + 1, '0');
  if (digits) text = text.slice(0, -digits) + '.' + text.slice(-digits);
  return (negative ? '-' : '') + text;
}

/** Python round(): banker's rounding; with `digits` it rounds the exact decimal value, like CPython. */
export function round(x, digits) {
  if (digits === undefined || digits === null) {
    const f = Math.floor(x);
    const diff = x - f;
    return diff < 0.5 ? f : diff > 0.5 ? f + 1 : (f % 2 === 0 ? f : f + 1);
  }
  if (!Number.isFinite(x)) return x;
  if (digits >= 0) return Number(fixed(x, digits));
  const scale = 10 ** -digits;
  return round(x / scale) * scale;
}

/** Python int(): truncates toward zero; strings must hold a whole number. */
export function int(x) {
  if (typeof x === 'string') {
    const text = x.trim().replace(/_/g, '');
    if (!/^[+-]?\d+$/.test(text)) throw new ValueError(`invalid literal for int() with base 10: ${repr(x)}`);
    return Number(text);
  }
  if (!Number.isFinite(x)) throw new ValueError('cannot convert float NaN or infinity to integer');
  return Math.trunc(x);
}

/** Python float(): accepts 'inf', 'nan' and numeric strings. */
export function float(x) {
  if (typeof x !== 'string') return Number(x);
  const text = x.trim().toLowerCase().replace(/_/g, '');
  if (/^[+-]?(inf|infinity)$/.test(text)) return text.startsWith('-') ? -Infinity : Infinity;
  if (/^[+-]?nan$/.test(text)) return NaN;
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(text)) throw new ValueError(`could not convert string to float: ${repr(x)}`);
  return Number(text);
}

// ---------------------------------------------------------------- text
/** Python str() of a float: always shows a decimal point ("5.0"), switches to exponents like repr(). */
export function fstr(x) {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x < 0 ? '-inf' : 'inf';
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
  const [mantissa, exp] = x.toExponential().split('e');
  const e = Number(exp);
  if (e < -4 || e >= 16) {
    const m = mantissa.includes('.') ? mantissa : mantissa;
    return `${m}e${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`;
  }
  const text = String(x);
  return text.includes('.') ? text : text + '.0';
}

/** Python str(): None/True/False, containers shown like repr(). */
export function str(x) {
  if (x === null || x === undefined) return 'None';
  if (x === true) return 'True';
  if (x === false) return 'False';
  if (typeof x === 'string') return x;
  if (typeof x === 'number') return Number.isInteger(x) ? String(x) : fstr(x);
  if (x instanceof Error) return x instanceof KeyError ? repr(x.message) : x.message;
  return repr(x);
}

/** Python repr() for the value shapes the simulator uses. */
export function repr(x) {
  if (typeof x === 'string') return `'${x.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(x)) return `[${x.map(repr).join(', ')}]`;
  if (x instanceof Set) return `{${[...x].map(repr).join(', ')}}`;
  if (x instanceof Map) return `{${[...x].map(([k, v]) => `${repr(k)}: ${repr(v)}`).join(', ')}}`;
  return str(x);
}

const groupThousands = text => text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Python format spec mini-language: fill/align, sign, 0, width, comma, .precision and f d s % types. */
export function format(value, spec = '') {
  const m = /^(?:(.)?([<>^=]))?([+\- ])?(0)?(\d+)?(,)?(?:\.(\d+))?([a-zA-Z%])?$/.exec(spec);
  if (!m) throw new ValueError(`Invalid format specifier '${spec}'`);
  const [, fillChar, alignChar, sign, zero, width, comma, precision, type] = m;
  let body;
  let numeric = typeof value === 'number' || typeof value === 'boolean';
  if (numeric) {
    const v = Number(value);
    if (type === 'f' || type === 'F') body = fixed(Math.abs(v), precision === undefined ? 6 : Number(precision));
    else if (type === '%') body = fixed(Math.abs(v) * 100, precision === undefined ? 6 : Number(precision)) + '%';
    else if (type === 'd') body = String(Math.abs(Math.trunc(v)));
    else if (type === 'e') body = Math.abs(v).toExponential(precision === undefined ? 6 : Number(precision)).replace(/e([+-])(\d)$/, 'e$10$2');
    else if (precision !== undefined) body = String(Number(Math.abs(v).toPrecision(Number(precision))));
    else body = Number.isInteger(v) && typeof value === 'number' && !Object.is(v, -0) ? String(Math.abs(v)) : fstr(Math.abs(v)).replace(/^-/, '');
    if (comma) { const [a, b] = body.split('.'); body = groupThousands(a) + (b === undefined ? '' : '.' + b); }
    const neg = v < 0 || Object.is(v, -0);
    const prefix = neg ? '-' : sign === '+' ? '+' : sign === ' ' ? ' ' : '';
    if (zero && !alignChar && width) body = body.padStart(Number(width) - prefix.length, '0');
    body = prefix + body;
  } else {
    body = str(value);
    if (precision !== undefined && type !== 'f') body = body.slice(0, Number(precision));
  }
  if (width) {
    const align = alignChar || (numeric ? '>' : '<');
    const fill = fillChar || ' ';
    const w = Number(width);
    if (align === '<') body = body.padEnd(w, fill);
    else if (align === '>') body = body.padStart(w, fill);
    else if (align === '^') { const total = Math.max(0, w - body.length), left = Math.floor(total / 2); body = fill.repeat(left) + body + fill.repeat(total - left); }
    else body = body.padStart(w, fill);
  }
  return body;
}

/** Python str.split(): no separator splits on whitespace runs; maxsplit counts the splits. */
export function split(text, sep = null, maxsplit = -1) {
  if (sep === null || sep === undefined) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (maxsplit < 0) return trimmed.split(/\s+/);
    const parts = [];
    let rest = trimmed;
    while (parts.length < maxsplit) {
      const m = /\s+/.exec(rest);
      if (!m) break;
      parts.push(rest.slice(0, m.index));
      rest = rest.slice(m.index + m[0].length);
    }
    parts.push(rest);
    return parts;
  }
  const parts = text.split(sep);
  if (maxsplit < 0 || parts.length <= maxsplit + 1) return parts;
  return [...parts.slice(0, maxsplit), parts.slice(maxsplit).join(sep)];
}

/** Python str.rsplit() with a separator. */
export function rsplit(text, sep, maxsplit = -1) {
  const parts = text.split(sep);
  if (maxsplit < 0 || parts.length <= maxsplit + 1) return parts;
  return [parts.slice(0, parts.length - maxsplit).join(sep), ...parts.slice(parts.length - maxsplit)];
}

/** Python str.strip(chars) / lstrip / rstrip when a character set is given. */
export function strip(text, chars, side = 'both') {
  let a = 0, b = text.length;
  if (side !== 'right') while (a < b && chars.includes(text[a])) a++;
  if (side !== 'left') while (b > a && chars.includes(text[b - 1])) b--;
  return text.slice(a, b);
}

/** Python str.title(). */
export const title = text => text.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, a, b) => a + b.toUpperCase());

/** Python str.capitalize(). */
export const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** Python str.partition(). */
export function partition(text, sep) {
  const i = text.indexOf(sep);
  return i < 0 ? [text, '', ''] : [text.slice(0, i), sep, text.slice(i + sep.length)];
}

/** shlex.quote(). */
export const shlexQuote = text => (/^[\w@%+=:,./-]+$/.test(text) ? text : `'${text.replace(/'/g, `'"'"'`)}'`);

/** shlex.split() in POSIX mode: quotes, backslash escapes, same error messages. */
export function shlexSplit(text) {
  const words = [];
  let word = '', quote = null, started = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === '\\' && quote === '"') {
        if (i + 1 >= text.length) throw new ValueError('No escaped character');
        const next = text[++i];
        word += next === '"' || next === '\\' ? next : '\\' + next;
      } else word += c;
    } else if (c === '"' || c === "'") { quote = c; started = true; }
    else if (c === '\\') {
      if (++i >= text.length) throw new ValueError('No escaped character');
      word += text[i]; started = true;
    } else if (' \t\r\n'.includes(c)) {
      if (started) { words.push(word); word = ''; started = false; }
    } else { word += c; started = true; }
  }
  if (quote) throw new ValueError('No closing quotation');
  if (started) words.push(word);
  return words;
}

/** re.escape(). */
export const reEscape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- comparison and sorting
/** Python rich comparison for numbers, strings and (lexicographic) lists/tuples. Returns -1, 0 or 1. */
export function compare(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) { const c = compare(a[i], b[i]); if (c) return c; }
    return Math.sign(a.length - b.length);
  }
  return a < b ? -1 : a > b ? 1 : 0;
}
export const lt = (a, b) => compare(a, b) < 0;
export const le = (a, b) => compare(a, b) <= 0;
export const gt = (a, b) => compare(a, b) > 0;
export const ge = (a, b) => compare(a, b) >= 0;

/** Python ==, deeply, for arrays, Maps and Sets (plain values fall through to ===). */
export function eq(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => eq(x, b[i]));
  if (a instanceof Set) return b instanceof Set && a.size === b.size && [...a].every(x => b.has(x));
  if (a instanceof Map) return b instanceof Map && a.size === b.size && [...a].every(([k, v]) => b.has(k) && eq(v, b.get(k)));
  return false;
}

/** Python sorted(): stable, key computed once per item, reverse keeps equal items in their original order. */
export function sorted(iterable, {key = null, reverse = false} = {}) {
  const items = [...iterable].map(value => ({value, key: key ? key(value) : value}));
  items.sort((x, y) => (reverse ? compare(y.key, x.key) : compare(x.key, y.key)));
  return items.map(item => item.value);
}

/** list.sort(): sorts the array in place the way sorted() would. */
export function sortInPlace(list, options) {
  const result = sorted(list, options);
  for (let i = 0; i < result.length; i++) list[i] = result[i];
  return list;
}

/** Python min()/max() over an iterable: first extreme wins ties; `key` and `default` supported. */
function extreme(sign, iterable, {key = null, default: fallback} = {}) {
  let best, bestKey, any = false;
  for (const item of iterable) {
    const k = key ? key(item) : item;
    if (!any || compare(k, bestKey) * sign > 0) { best = item; bestKey = k; any = true; }
  }
  if (!any) {
    if (fallback !== undefined) return fallback;
    throw new ValueError(`${sign > 0 ? 'max' : 'min'}() arg is an empty sequence`);
  }
  return best;
}
export const minOf = (iterable, options) => extreme(-1, iterable, options);
export const maxOf = (iterable, options) => extreme(1, iterable, options);

/** Python sum() (left to right, no compensation). */
export function sum(iterable, start = 0) {
  let total = start;
  for (const x of iterable) total += x;
  return total;
}

/** range(start, stop, step) as an array. */
export function range(start, stop, step = 1) {
  if (stop === undefined) { stop = start; start = 0; }
  const out = [];
  if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
  else for (let i = start; i > stop; i += step) out.push(i);
  return out;
}

/** zip() as an array of tuples (stops at the shortest input). */
export function zip(...lists) {
  const arrays = lists.map(l => [...l]);
  const n = Math.min(...arrays.map(a => a.length));
  return Array.from({length: n}, (_, i) => arrays.map(a => a[i]));
}

/** Python truthiness for values whose type is not known statically. */
export const truthy = x => x != null && x !== false && x !== 0 && x !== '' && !(Array.isArray(x) && x.length === 0) && !((x instanceof Map || x instanceof Set || x instanceof TupleSet) && x.size === 0);

/** len() for values whose type is not known statically. */
export const len = x => (x instanceof Map || x instanceof Set || x instanceof TupleSet ? x.size : x.length);

// ---------------------------------------------------------------- sets, lists, maps
export const union = (...sets) => new Set(sets.flatMap(s => [...s]));
export const intersection = (a, b) => new Set([...a].filter(x => b.has(x)));
export const difference = (a, b) => new Set([...a].filter(x => !b.has(x)));
export const isSubset = (a, b) => [...a].every(x => b.has(x));
export function addAll(set, items) { for (const x of items) set.add(x); }
export function removeAll(set, items) { for (const x of items) set.delete(x); }

/** list.remove(value): removes the first equal item or raises ValueError. */
export function removeValue(list, value) {
  const i = list.findIndex(x => eq(x, value));
  if (i < 0) throw new ValueError('list.remove(x): x not in list');
  list.splice(i, 1);
}

/** list.index(value). */
export function indexOf(list, value) {
  const i = list.findIndex(x => eq(x, value));
  if (i < 0) throw new ValueError(`${repr(value)} is not in list`);
  return i;
}

/** Map.get() with a default that applies only when the key is missing (a stored null stays null). */
export const getOr = (map, key, fallback) => (map.has(key) ? map.get(key) : fallback);

/** dict.setdefault(). */
export function setdefault(map, key, value) {
  if (!map.has(key)) map.set(key, value);
  return map.get(key);
}

/** dict.pop(key, default). */
export function pop(map, key, ...fallback) {
  if (map.has(key)) { const v = map.get(key); map.delete(key); return v; }
  if (fallback.length) return fallback[0];
  throw new KeyError(key);
}

/** collections.Counter: a Map whose missing keys count as 0. */
export class Counter extends Map {
  constructor(items = []) {
    super();
    if (items instanceof Map) for (const [k, v] of items) this.set(k, v);
    else for (const x of items) this.set(x, this.get(x) + 1);
  }
  get(key) { return super.has(key) ? super.get(key) : 0; }
  /** most_common(n): highest counts first, ties in insertion order. */
  mostCommon(n) {
    const rows = sorted([...this], {key: ([, v]) => v, reverse: true});
    return n === undefined ? rows : rows.slice(0, n);
  }
}

/** A Map keyed by tuples/frozensets: keys are compared by value (arrays of primitives). */
export class TupleMap {
  constructor(entries = []) { this.items = new Map(); for (const [k, v] of entries) this.set(k, v); }
  static hash(key) { return Array.isArray(key) ? JSON.stringify(key) : key instanceof Set ? JSON.stringify([...key].sort()) : key; }
  get(key) { return this.items.get(TupleMap.hash(key))?.[1]; }
  has(key) { return this.items.has(TupleMap.hash(key)); }
  set(key, value) { this.items.set(TupleMap.hash(key), [key, value]); return this; }
  delete(key) { return this.items.delete(TupleMap.hash(key)); }
  clear() { this.items.clear(); }
  get size() { return this.items.size; }
  *keys() { for (const [k] of this.items.values()) yield k; }
  *values() { for (const [, v] of this.items.values()) yield v; }
  *entries() { for (const e of this.items.values()) yield e; }
  [Symbol.iterator]() { return this.entries(); }
  forEach(fn) { for (const [k, v] of this.items.values()) fn(v, k, this); }
}

// ---------------------------------------------------------------- copying and saving
/** Deep copy of plain data, Maps, Sets, arrays and class instances (cycles and sharing preserved). */
export function deepClone(value, memo = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  if (memo.has(value)) return memo.get(value);
  let copy;
  if (Array.isArray(value)) {
    copy = [];
    memo.set(value, copy);
    for (const x of value) copy.push(deepClone(x, memo));
  } else if (value instanceof Map || value instanceof TupleMap) {
    copy = value instanceof Counter ? new Counter() : value instanceof TupleMap ? new TupleMap() : new Map();
    memo.set(value, copy);
    for (const [k, v] of value) copy.set(deepClone(k, memo), deepClone(v, memo));
  } else if (value instanceof TupleSet) {
    copy = new TupleSet();
    memo.set(value, copy);
    for (const x of value) copy.add(deepClone(x, memo));
  } else if (value instanceof Set) {
    copy = new Set();
    memo.set(value, copy);
    for (const x of value) copy.add(deepClone(x, memo));
  } else {
    copy = Object.create(Object.getPrototypeOf(value));
    memo.set(value, copy);
    for (const [k, v] of Object.entries(value)) copy[k] = deepClone(v, memo);
  }
  return copy;
}

/**
 * Save-file encoding of a whole simulation: a JSON graph of nodes so shared references and cycles survive.
 * `classes` maps constructor names (Person, Country, ...) to classes so instances are rebuilt with their methods.
 */
export function serialize(root) {
  const nodes = [];
  const ids = new Map();
  function encode(value) {
    if (value === undefined) return null;
    if (value === null || typeof value !== 'object') {
      if (typeof value === 'number' && !Number.isFinite(value)) return {$num: String(value)};
      return value;
    }
    if (ids.has(value)) return {$ref: ids.get(value)};
    const id = nodes.length;
    ids.set(value, id);
    nodes.push(null);
    let node;
    if (Array.isArray(value)) node = {type: 'list', values: value.map(encode)};
    else if (value instanceof Counter) node = {type: 'counter', values: [...value].map(([k, v]) => [encode(k), encode(v)])};
    else if (value instanceof TupleMap) node = {type: 'tuplemap', values: [...value].map(([k, v]) => [encode(k), encode(v)])};
    else if (value instanceof Map) node = {type: 'map', values: [...value].map(([k, v]) => [encode(k), encode(v)])};
    else if (value instanceof TupleSet) node = {type: 'tupleset', values: [...value].map(encode)};
    else if (value instanceof Set) node = {type: 'set', values: [...value].map(encode)};
    else if (value instanceof PythonRandom) node = {type: 'random', state: value.getstate()};
    else {
      const attrs = {};
      for (const [k, v] of Object.entries(value)) attrs[k] = encode(v);
      node = {type: 'object', cls: value.constructor.name, attrs};
    }
    nodes[id] = node;
    return {$ref: id};
  }
  const rootRef = encode(root);
  return JSON.stringify({format: 'civilization-js', version: 2, root: rootRef, nodes});
}

/** Inverse of serialize(); `classes` is {name: class} for every class that can appear in a save. */
export function deserialize(text, classes) {
  const data = JSON.parse(text);
  if (data.format !== 'civilization-js' || data.version !== 2 || !Array.isArray(data.nodes)) throw new Error('This is not a supported Civilization save.');
  const memo = new Map();
  function decode(v) {
    if (v === null || typeof v !== 'object') return v;
    if ('$num' in v) return Number(v.$num);
    const node = data.nodes[v.$ref];
    if (!node) throw new Error('Invalid save reference');
    if (memo.has(v.$ref)) return memo.get(v.$ref);
    let out;
    switch (node.type) {
      case 'list': out = []; memo.set(v.$ref, out); for (const x of node.values) out.push(decode(x)); break;
      case 'map': out = new Map(); memo.set(v.$ref, out); for (const [k, x] of node.values) out.set(decode(k), decode(x)); break;
      case 'counter': out = new Counter(); memo.set(v.$ref, out); for (const [k, x] of node.values) out.set(decode(k), decode(x)); break;
      case 'tuplemap': out = new TupleMap(); memo.set(v.$ref, out); for (const [k, x] of node.values) out.set(decode(k), decode(x)); break;
      case 'tupleset': out = new TupleSet(); memo.set(v.$ref, out); for (const x of node.values) out.add(decode(x)); break;
      case 'set': out = new Set(); memo.set(v.$ref, out); for (const x of node.values) out.add(decode(x)); break;
      case 'random': out = new PythonRandom(0); memo.set(v.$ref, out); out.setstate(node.state); break;
      case 'object': {
        const cls = classes[node.cls];
        if (!cls) throw new Error('Invalid save class');
        out = Object.create(cls.prototype);
        memo.set(v.$ref, out);
        for (const [k, x] of Object.entries(node.attrs)) out[k] = decode(x);
        break;
      }
      default: throw new Error('Invalid save type');
    }
    return out;
  }
  return decode(data.root);
}

// ---------------------------------------------------------------- dynamic fallbacks and small extras
/** Subscript on a value whose type is not known statically (Map or array/string). */
export const sub = (container, key) => (container instanceof Map || container instanceof TupleMap ? container.get(key) : container[key < 0 ? container.length + key : key]);

/** dict.update(other). */
export function update(map, other) {
  for (const [k, v] of other) map.set(k, v);
  return map;
}

/** enumerate() for arbitrary iterables, as an array of [index, value]. */
export function enumerate(iterable, start = 0) {
  let i = start;
  return [...iterable].map(v => [i++, v]);
}

/** statistics.median(). */
export function median(values) {
  const v = [...values].sort((a, b) => a - b), n = v.length;
  return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
}

/** dataclasses.replace(): copy with some fields changed (frozen objects stay frozen). */
export function replace(object, changes) {
  const copy = Object.assign(Object.create(Object.getPrototypeOf(object)), object, changes);
  if (Object.isFrozen(object)) Object.freeze(copy);
  return copy;
}

/** str.format(**values) for simple {name} fields. */
export const formatTemplate = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => str(values[key]));

/** Make `target` hold exactly the own properties of `source` (same order): Python's `__dict__.clear(); __dict__.update(...)`. */
export function replaceState(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

/** Python `in` for a container whose type is not known statically. */
export const contains = (container, item) => (container instanceof Map || container instanceof Set || container instanceof TupleMap || container instanceof TupleSet ? container.has(item)
  : typeof container === 'string' ? container.includes(item) : container.some(x => eq(x, item)));

/** A Set of tuples: members are compared by value (arrays of primitives). */
export class TupleSet {
  constructor(values = []) { this.items = new Map(); for (const v of values) this.add(v); }
  add(value) { this.items.set(TupleMap.hash(value), value); return this; }
  has(value) { return this.items.has(TupleMap.hash(value)); }
  delete(value) { return this.items.delete(TupleMap.hash(value)); }
  clear() { this.items.clear(); }
  get size() { return this.items.size; }
  values() { return this.items.values(); }
  keys() { return this.items.values(); }
  [Symbol.iterator]() { return this.items.values(); }
}

/** next(generator, default) where the default is computed eagerly (it may consume random numbers), like Python. */
export const firstOr = (found, fallback) => found ?? fallback;

/** Iterate a value of unknown type the way Python does: a dict yields its keys. */
export const iterate = x => (x instanceof Map || x instanceof TupleMap ? x.keys() : x);

/** Python `a or b` for values that may be empty containers; `b` is a thunk so it stays lazy. */
export const or_ = (a, b) => (truthy(a) ? a : b());
/** Python `a and b`. */
export const and_ = (a, b) => (truthy(a) ? b() : a);

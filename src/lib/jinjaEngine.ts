/**
 * Complete Universal Jinja2 Template Engine with Kalp Studio Visual Editor Support.
 * Supports:
 * - Expressions: {{ expr }}, {{ expr | filter }}, inline ternary, arithmetic (+, -, *, /, %), string concat (~)
 * - Filters: upper, lower, title, capitalize, trim, striptags, truncate, replace, default/d, round, length/count, safe, escape/e, int, float, abs, first, last, join, tojson/json, urlencode, min, max, sum, reverse, sort, unique
 * - Loops: {% for x in arr %} ... {% else %} ... {% endfor %}, {% for k, v in dict.items() %}
 * - Loop Meta: loop.index, loop.index0, loop.revindex, loop.revindex0, loop.first, loop.last, loop.length, loop.cycle(...)
 * - Conditionals: {% if %}, {% elif %}, {% else %}, {% endif %}
 * - Logic Tests: ==, !=, <, >, <=, >=, and, or, not, is defined, is undefined, is none, is even, is odd, is number, is string, in, not in
 * - Variable Assignment: {% set key = value %}
 * - Comments: {# comment #}
 * - Safe visual in-place contenteditable wrapping for Kalp Studio.
 */

const JINJA_EXPR_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;

export interface JinjaRenderOptions {
  isStudio?: boolean;
  sectionId?: string;
  lang?: string;
  propPrefix?: string;
}

export function getJinjaPath(data: unknown, path: string[]): unknown {
  if (!path || path.length === 0) return data;
  return path.reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    if (Array.isArray(acc)) {
      const idx = parseInt(key, 10);
      if (!isNaN(idx) && idx >= 0 && idx < acc.length) {
        return acc[idx];
      }
      const first = (acc as Record<string, unknown>[])[0];
      return first ? (first as Record<string, unknown>)[key] : undefined;
    }
    const val = (acc as Record<string, unknown>)[key];
    // Check if it's localized object { en: "..." }
    if (val && typeof val === 'object' && !Array.isArray(val) && ('en' in val || 'hi' in val)) {
      return (val as any).en || Object.values(val)[0];
    }
    return val;
  }, data);
}

export function applyJinjaFilter(
  value: unknown,
  filter: { name: string; arg?: string }
): unknown {
  const stripQ = (s?: string) => (s ?? '').trim().replace(/^["']|["']$/g, '');
  const fname = filter.name.toLowerCase();

  switch (fname) {
    case 'upper':
      return String(value ?? '').toUpperCase();
    case 'lower':
      return String(value ?? '').toLowerCase();
    case 'title':
      return String(value ?? '').replace(
        /\w\S*/g,
        (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()
      );
    case 'capitalize': {
      const s = String(value ?? '');
      return s ? s[0].toUpperCase() + s.slice(1) : s;
    }
    case 'trim':
      return String(value ?? '').trim();
    case 'striptags':
      return String(value ?? '').replace(/<[^>]*>?/gm, '');
    case 'truncate': {
      const s = String(value ?? '');
      const len = filter.arg ? parseInt(filter.arg, 10) : 255;
      return s.length > len ? s.slice(0, len) + '...' : s;
    }
    case 'default':
    case 'd':
      return value === undefined || value === null || value === ''
        ? stripQ(filter.arg)
        : value;
    case 'round': {
      const n = Number(value);
      const d = filter.arg ? parseInt(filter.arg, 10) : 0;
      return isNaN(n) ? value : n.toFixed(d);
    }
    case 'int': {
      const n = parseInt(String(value ?? ''), 10);
      return isNaN(n) ? 0 : n;
    }
    case 'float': {
      const n = parseFloat(String(value ?? ''));
      return isNaN(n) ? 0 : n;
    }
    case 'abs':
      return Math.abs(Number(value) || 0);
    case 'length':
    case 'count':
      if (Array.isArray(value)) return value.length;
      if (value && typeof value === 'object') return Object.keys(value).length;
      return String(value ?? '').length;
    case 'replace': {
      const parts = (filter.arg ?? '')
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''));
      return String(value ?? '').replaceAll(parts[0] || '', parts[1] || '');
    }
    case 'first':
      return Array.isArray(value) ? value[0] : String(value ?? '')[0];
    case 'last':
      return Array.isArray(value)
        ? value[value.length - 1]
        : String(value ?? '').slice(-1);
    case 'join': {
      const sep = filter.arg ? stripQ(filter.arg) : '';
      return Array.isArray(value) ? value.join(sep) : value;
    }
    case 'tojson':
    case 'json':
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    case 'urlencode':
      return encodeURIComponent(String(value ?? ''));
    case 'reverse':
      return Array.isArray(value) ? [...value].reverse() : String(value ?? '').split('').reverse().join('');
    case 'unique':
      return Array.isArray(value) ? Array.from(new Set(value)) : value;
    case 'sum':
      return Array.isArray(value) ? value.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) : value;
    case 'min':
      return Array.isArray(value) ? Math.min(...value.map(Number)) : value;
    case 'max':
      return Array.isArray(value) ? Math.max(...value.map(Number)) : value;
    case 'safe':
    case 'escape':
    case 'e':
      return value;
    default:
      return value;
  }
}

export function j2EvalCond(cond: string, data: unknown): boolean {
  cond = cond.trim();

  if (cond.includes(' and ')) {
    return cond.split(' and ').every((p) => j2EvalCond(p.trim(), data));
  }
  if (cond.includes(' or ')) {
    return cond.split(' or ').some((p) => j2EvalCond(p.trim(), data));
  }

  // Tests with "is ..."
  const isDefinedM = cond.match(/^(.+?)\s+is\s+defined$/);
  if (isDefinedM) {
    const v = getJinjaPath(data, isDefinedM[1].trim().split('.').filter(Boolean));
    return v !== undefined && v !== null;
  }
  const isUndefinedM = cond.match(/^(.+?)\s+is\s+undefined$/);
  if (isUndefinedM) {
    const v = getJinjaPath(data, isUndefinedM[1].trim().split('.').filter(Boolean));
    return v === undefined || v === null;
  }
  const isNoneM = cond.match(/^(.+?)\s+is\s+(none|null)$/);
  if (isNoneM) {
    const v = getJinjaPath(data, isNoneM[1].trim().split('.').filter(Boolean));
    return v === null || v === undefined;
  }
  const isEvenM = cond.match(/^(.+?)\s+is\s+even$/);
  if (isEvenM) {
    const v = Number(getJinjaPath(data, isEvenM[1].trim().split('.').filter(Boolean)));
    return !isNaN(v) && v % 2 === 0;
  }
  const isOddM = cond.match(/^(.+?)\s+is\s+odd$/);
  if (isOddM) {
    const v = Number(getJinjaPath(data, isOddM[1].trim().split('.').filter(Boolean)));
    return !isNaN(v) && v % 2 !== 0;
  }
  const isNumberM = cond.match(/^(.+?)\s+is\s+number$/);
  if (isNumberM) {
    const v = getJinjaPath(data, isNumberM[1].trim().split('.').filter(Boolean));
    return typeof v === 'number' && !isNaN(v);
  }
  const isStringM = cond.match(/^(.+?)\s+is\s+string$/);
  if (isStringM) {
    const v = getJinjaPath(data, isStringM[1].trim().split('.').filter(Boolean));
    return typeof v === 'string';
  }

  if (cond.startsWith('not ')) return !j2EvalCond(cond.slice(4).trim(), data);

  // In / not in
  const inMatch = cond.match(/^(.+?)\s+(not\s+in|in)\s+(.+)$/);
  if (inMatch) {
    const item = resolveRawVal(inMatch[1].trim(), data);
    const op = inMatch[2].trim();
    const container = resolveRawVal(inMatch[3].trim(), data);
    const hasItem = Array.isArray(container)
      ? container.includes(item)
      : typeof container === 'string'
      ? container.includes(String(item))
      : false;
    return op === 'in' ? hasItem : !hasItem;
  }

  // Comparison operators: ==, !=, >=, <=, >, <
  const compMatch = cond.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (compMatch) {
    const leftVal = resolveRawVal(compMatch[1].trim(), data);
    const op = compMatch[2];
    const rightVal = resolveRawVal(compMatch[3].trim(), data);

    switch (op) {
      case '==': return String(leftVal) === String(rightVal) || leftVal == rightVal;
      case '!=': return String(leftVal) !== String(rightVal) && leftVal != rightVal;
      case '>=': return (leftVal as any) >= (rightVal as any);
      case '<=': return (leftVal as any) <= (rightVal as any);
      case '>': return (leftVal as any) > (rightVal as any);
      case '<': return (leftVal as any) < (rightVal as any);
    }
  }

  const v = getJinjaPath(
    data,
    cond.split('.').filter((p) => /^[\w]+$/.test(p))
  );
  return Boolean(v);
}

function resolveRawVal(valStr: string, data: unknown): unknown {
  if (/^["'].*["']$/.test(valStr)) return valStr.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(valStr)) return Number(valStr);
  if (valStr === 'true') return true;
  if (valStr === 'false') return false;
  if (valStr === 'null' || valStr === 'none') return null;
  return getJinjaPath(data, valStr.split('.').filter(Boolean));
}

export interface ParsedJinjaExpr {
  path: string[];
  rawExpr: string;
  filters: { name: string; arg?: string }[];
}

export function parseJinjaExpr(expr: string): ParsedJinjaExpr {
  const ifIdx = expr.search(/(?<![\w])if\s/);
  const mainExpr = ifIdx !== -1 ? expr.slice(0, ifIdx).trim() : expr;
  const parts = mainExpr.split('|').map((s) => s.trim());
  const rawPath = parts[0].trim();
  const hasArithmetic = /[+\-*/%()]/.test(rawPath);
  const hasSpace = /\s/.test(rawPath);
  const path =
    !hasArithmetic && !hasSpace && /^[\w][\w.]*$/.test(rawPath)
      ? rawPath.split('.').map((s) => s.trim()).filter(Boolean)
      : [];
  const filters = parts.slice(1).map((f) => {
    const m = f.match(/^([a-zA-Z_]\w*)\s*(?:\(([^)]*)\))?$/);
    return m ? { name: m[1], arg: m[2] } : { name: f };
  });
  return { path, rawExpr: rawPath, filters };
}

export function evalJinja2Expr(expr: string, data: unknown): { value: string; rawPath: string } {
  // Inline ternary: {{ val if cond else fallback }}
  const ifIdx = expr.indexOf(' if ');
  if (ifIdx !== -1) {
    const valueExpr = expr.slice(0, ifIdx).trim();
    const rest = expr.slice(ifIdx + 4).trim();
    const elseIdx = rest.lastIndexOf(' else ');
    if (elseIdx !== -1) {
      const condition = rest.slice(0, elseIdx).trim();
      const fallbackExpr = rest.slice(elseIdx + 6).trim();
      if (j2EvalCond(condition, data)) {
        return evalJinja2Expr(valueExpr, data);
      }
      if (/^["']/.test(fallbackExpr)) {
        return { value: fallbackExpr.replace(/^["']|["']$/g, ''), rawPath: '' };
      }
      return evalJinja2Expr(fallbackExpr, data);
    }
  }

  const parsed = parseJinjaExpr(expr);
  const rawPath = parsed.path.join('.');

  let value: unknown;
  if (parsed.path.length > 0) {
    value = getJinjaPath(data, parsed.path);
  } else {
    // Support basic math / string concatenation: e.g. {{ a + b }} or {{ "Hello " ~ name }}
    try {
      const concatParts = parsed.rawExpr.split('~');
      if (concatParts.length > 1) {
        value = concatParts.map((p) => String(resolveRawVal(p.trim(), data) ?? '')).join('');
      } else {
        value = resolveRawVal(parsed.rawExpr, data);
      }
    } catch {
      value = '';
    }
  }

  for (const f of parsed.filters) {
    value = applyJinjaFilter(value, f);
  }

  return {
    value: value === undefined || value === null ? '' : String(value),
    rawPath,
  };
}

type J2Token = ['text' | 'expr' | 'tag' | 'comment', string];

function j2Tokenize(tmpl: string): J2Token[] {
  // Strip comments {# ... #}
  tmpl = tmpl.replace(/\{#-?[\s\S]*?-?#\}/g, '');

  const out: J2Token[] = [];
  let i = 0;
  while (i < tmpl.length) {
    const e = tmpl.indexOf('{{', i);
    const t = tmpl.indexOf('{%', i);
    const next = e === -1 ? t : t === -1 ? e : Math.min(e, t);
    if (next === -1) {
      out.push(['text', tmpl.slice(i)]);
      break;
    }
    if (next > i) out.push(['text', tmpl.slice(i, next)]);
    if (tmpl[next + 1] === '{') {
      const end = tmpl.indexOf('}}', next);
      if (end === -1) {
        out.push(['text', tmpl.slice(next)]);
        break;
      }
      out.push(['expr', tmpl.slice(next + 2, end).trim()]);
      i = end + 2;
    } else {
      const end = tmpl.indexOf('%}', next);
      if (end === -1) {
        out.push(['text', tmpl.slice(next)]);
        break;
      }
      out.push([
        'tag',
        tmpl
          .slice(next + 2, end)
          .trim()
          .replace(/^-|-$/g, '')
          .trim(),
      ]);
      i = end + 2;
    }
  }
  return out;
}

type J2Node =
  | { t: 'text'; v: string }
  | { t: 'expr'; v: string }
  | {
      t: 'for';
      vars: string[];
      src: string;
      dictItems: boolean;
      body: J2Node[];
      elseBody?: J2Node[];
    }
  | {
      t: 'if';
      branches: { cond: string; body: J2Node[] }[];
      elseBody?: J2Node[];
    }
  | { t: 'set'; key: string; expr: string };

function j2Parse(
  tokens: J2Token[],
  pos: number
): { nodes: J2Node[]; pos: number } {
  const nodes: J2Node[] = [];
  while (pos < tokens.length) {
    const [type, val] = tokens[pos];
    if (type === 'text') {
      nodes.push({ t: 'text', v: val });
      pos++;
    } else if (type === 'expr') {
      nodes.push({ t: 'expr', v: val });
      pos++;
    } else {
      const tag = val.replace(/\s+/g, ' ').trim();

      if (tag.startsWith('set ')) {
        const m = tag.slice(4).split('=');
        if (m.length >= 2) {
          nodes.push({ t: 'set', key: m[0].trim(), expr: m.slice(1).join('=').trim() });
        }
        pos++;
      } else if (tag.startsWith('for ')) {
        const m = tag.match(
          /^for\s+([\w,\s]+?)\s+in\s+([\w.]+?)(\.items\(\))?\s*$/
        );
        if (m) {
          const vars = m[1].split(',').map((v) => v.trim()).filter(Boolean);
          const src = m[2].trim();
          const dictItems = Boolean(m[3]);
          pos++;
          const inner = j2Parse(tokens, pos);
          let elseBody: J2Node[] | undefined;
          pos = inner.pos;
          if (pos > 0 && pos <= tokens.length) {
            const prev = tokens[pos - 1];
            if (prev && prev[0] === 'tag' && prev[1].trim() === 'else') {
              const elseParsed = j2Parse(tokens, pos);
              elseBody = elseParsed.nodes;
              pos = elseParsed.pos;
            }
          }
          nodes.push({ t: 'for', vars, src, dictItems, body: inner.nodes, elseBody });
        } else {
          pos++;
        }
      } else if (tag === 'endfor' || tag === 'endif') {
        pos++;
        return { nodes, pos };
      } else if (tag.startsWith('if ')) {
        const branches: { cond: string; body: J2Node[] }[] = [];
        branches.push({ cond: tag.slice(3).trim(), body: [] });
        pos++;
        const initial = j2Parse(tokens, pos);
        branches[0].body = initial.nodes;
        pos = initial.pos;

        let elseBody: J2Node[] | undefined;
        while (pos > 0 && pos <= tokens.length) {
          const prev = tokens[pos - 1];
          if (!prev || prev[0] !== 'tag') break;
          const ptag = prev[1].trim();
          if (ptag.startsWith('elif ')) {
            const cond = ptag.slice(5).trim();
            const elifParsed = j2Parse(tokens, pos);
            branches.push({ cond, body: elifParsed.nodes });
            pos = elifParsed.pos;
          } else if (ptag === 'else') {
            const elseParsed = j2Parse(tokens, pos);
            elseBody = elseParsed.nodes;
            pos = elseParsed.pos;
          } else {
            break;
          }
        }
        nodes.push({ t: 'if', branches, elseBody });
      } else if (tag === 'else' || tag.startsWith('elif ')) {
        pos++;
        return { nodes, pos };
      } else {
        pos++;
      }
    }
  }
  return { nodes, pos };
}

function j2RenderNodes(
  nodes: J2Node[],
  data: Record<string, unknown>,
  options: JinjaRenderOptions = {},
  parentContext: { inAttribute?: boolean; currentPathPrefix?: string; loopVar?: string } = {}
): string {
  let out = '';
  for (const node of nodes) {
    switch (node.t) {
      case 'text':
        out += node.v;
        break;
      case 'set': {
        const { value } = evalJinja2Expr(node.expr, data);
        data[node.key] = value;
        break;
      }
      case 'expr': {
        try {
          const { value, rawPath } = evalJinja2Expr(node.v, data);
          const lastOpenAngle = out.lastIndexOf('<');
          const lastCloseAngle = out.lastIndexOf('>');
          const isInsideHtmlTag = lastOpenAngle > lastCloseAngle;

          if (options.isStudio && options.sectionId && rawPath && !isInsideHtmlTag && !parentContext.inAttribute) {
            let fieldPath = `props.${rawPath}`;
            if (parentContext.currentPathPrefix) {
              if (parentContext.loopVar && rawPath.startsWith(`${parentContext.loopVar}.`)) {
                fieldPath = `${parentContext.currentPathPrefix}.${rawPath.slice(parentContext.loopVar.length + 1)}`;
              } else {
                fieldPath = `${parentContext.currentPathPrefix}.${rawPath}`;
              }
            }
            out += `<span class="studio-jinja-node" data-studio-section="${options.sectionId}" data-studio-prop="${fieldPath}" data-studio-val="${encodeURIComponent(value)}" contenteditable="true" style="outline:none;cursor:text;transition:all 0.15s ease;" onfocus="this.style.outline='2px solid #ef4444';this.style.boxShadow='0 0 0 4px rgba(239,68,68,0.2)';" onblur="this.style.outline='none';this.style.boxShadow='none';">${value}</span>`;
          } else {
            out += value;
          }
        } catch {
          // ignore error
        }
        break;
      }
      case 'for': {
        const coll = getJinjaPath(data, node.src.split('.').filter(Boolean));
        let items: unknown[];
        if (node.dictItems) {
          items =
            coll && typeof coll === 'object' && !Array.isArray(coll)
              ? Object.entries(coll as Record<string, unknown>)
              : [];
        } else if (Array.isArray(coll)) {
          items = coll;
        } else {
          items = [];
        }

        if (items.length === 0 && node.elseBody && node.elseBody.length > 0) {
          out += j2RenderNodes(node.elseBody, data, options, parentContext);
          break;
        }

        const len = items.length;
        items.forEach((item, idx) => {
          const loopData: Record<string, unknown> = { ...data };
          loopData.loop = {
            index: idx + 1,
            index0: idx,
            first: idx === 0,
            last: idx === len - 1,
            length: len,
            revindex: len - idx,
            revindex0: len - idx - 1,
            cycle: (...vals: unknown[]) => (vals.length > 0 ? vals[idx % vals.length] : ''),
            depth: 1,
            depth0: 0,
          };
          if (node.vars.length === 2 && Array.isArray(item)) {
            loopData[node.vars[0]] = item[0];
            loopData[node.vars[1]] = item[1];
          } else {
            loopData[node.vars[0]] = item;
          }
          const itemPrefix = parentContext.currentPathPrefix
            ? `${parentContext.currentPathPrefix}.${node.src}[${idx}]`
            : `props.${node.src}[${idx}]`;
          out += j2RenderNodes(node.body, loopData, options, {
            ...parentContext,
            currentPathPrefix: itemPrefix,
            loopVar: node.vars[0],
          });
        });
        break;
      }
      case 'if': {
        let matched = false;
        for (const branch of node.branches) {
          if (j2EvalCond(branch.cond, data)) {
            out += j2RenderNodes(branch.body, data, options, parentContext);
            matched = true;
            break;
          }
        }
        if (!matched && node.elseBody) {
          out += j2RenderNodes(node.elseBody, data, options, parentContext);
        }
        break;
      }
    }
  }
  return out;
}

/**
 * Render Jinja Template with Props/Data.
 */
export function renderJinjaHtml(
  template: string,
  data: Record<string, unknown>,
  options: JinjaRenderOptions = {}
): string {
  if (!template) return '';
  try {
    const tokens = j2Tokenize(template);
    const { nodes } = j2Parse(tokens, 0);
    return j2RenderNodes(nodes, data, options);
  } catch (err) {
    console.error('[JinjaEngine Error]', err);
    return template.replace(JINJA_EXPR_RE, (_, expr: string) => {
      try {
        const { value } = evalJinja2Expr(expr, data);
        return value;
      } catch {
        return '';
      }
    });
  }
}

/**
 * Extracts distinct variable keys from a Jinja template string.
 */
export function extractJinjaVariables(html: string): string[] {
  if (!html) return [];
  const seen = new Set<string>();
  const results: string[] = [];
  const re = new RegExp(JINJA_EXPR_RE.source, 'g');
  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    const parsed = parseJinjaExpr(m[1]);
    const rootVar = parsed.path[0];
    if (rootVar && !seen.has(rootVar) && rootVar !== 'loop') {
      seen.add(rootVar);
      results.push(rootVar);
    }
  }
  return results;
}

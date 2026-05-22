"""Replace <Input type="number" ... +e.target.value> with NonNegativeNumericInput."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
SKIP = {"NonNegativeNumericInput.tsx"}
IMPORT_LINE = "import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';"

INPUT_START = re.compile(r"<Input\s+type=\"number\"")


def extract_braced(text: str, start: int) -> tuple[str, int] | None:
    """text[start] must be '{'. Returns (inner, index after closing '}'."""
    if start >= len(text) or text[start] != "{":
        return None
    depth = 0
    i = start
    inner_start = start + 1
    while i < len(text):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[inner_start:i], i + 1
        i += 1
    return None


def extract_value(attrs: str) -> str | None:
    key = "value="
    idx = attrs.find(key)
    if idx < 0:
        return None
    brace = attrs.find("{", idx)
    if brace < 0:
        return None
    got = extract_braced(attrs, brace)
    return got[0] if got else None


def has_decimal(attrs: str) -> bool:
    return "step=" in attrs


def find_onchange_start(block: str, from_idx: int) -> int:
    for pat in ("onChange={(e) =>", "onChange={e =>", "onChange={(e)=>"):
        i = block.find(pat, from_idx)
        if i >= 0:
            return i
    return -1


def find_inputs(text: str) -> list[tuple[int, int, str]]:
    """Return list of (start, end, full_match) for each Input type=number block ending in />."""
    out = []
    for m in INPUT_START.finditer(text):
        start = m.start()
        oc = find_onchange_start(text, m.end())
        if oc < 0:
            continue
        plus = text.find("+e.target.value", oc)
        num = text.find("Number(e.target.value)", oc) if plus < 0 else -1
        use_num = plus < 0 and num >= 0
        anchor = num if use_num else plus
        if anchor < 0:
            continue
        close = text.find("}", anchor)
        if close < 0:
            continue
        end = text.find("/>", close)
        if end < 0:
            end = text.find("/>", close)  # multiline
        if end < 0:
            continue
        end += 2
        out.append((start, end, text[start:end]))
    return out


def onchange_prefix_len(block: str, oc: int) -> int:
    for pat in ("onChange={(e) =>", "onChange={e =>", "onChange={(e)=>"):
        if block.startswith(pat, oc):
            return len(pat)
    return len("onChange={(e) =>")


def convert_block(block: str) -> str | None:
    oc = find_onchange_start(block, 0)
    if oc < 0:
        return None
    plus = block.find("+e.target.value", oc)
    num = block.find("Number(e.target.value)", oc) if plus < 0 else -1
    use_num = plus < 0 and num >= 0
    anchor = num if use_num else plus
    if anchor < 0:
        return None
    val = extract_value(block)
    if not val:
        return None
    plen = onchange_prefix_len(block, oc)
    body = block[oc + plen : anchor].strip()
    dec = " allowDecimal" if has_decimal(block) else ""
    tail_start = block.find("}", anchor) + 1
    tail = block[tail_start : block.rfind("/>")].strip()
    cls_attr = f" {tail}" if tail else ""
    if use_num:
        on_change = f"{body}v)" if body.endswith("(") else f"{body}(v)"
    elif "update({" in body or "updateOperation(" in body and ": " in body:
        on_change = f"{body}v }})"
    elif body.endswith(","):
        on_change = f"{body} v)"
    elif "{" in body and ":" in body:
        on_change = f"{body}v }})"
    else:
        on_change = f"{body}(v)"
    return f"<NonNegativeNumericInput{dec}{cls_attr} value={{{val}}} onChange={{(v) => {on_change}}} />"


def add_import(content: str) -> str:
    if "NonNegativeNumericInput" in content:
        return content
    if IMPORT_LINE in content:
        return content
    lines = content.splitlines()
    last_imp = 0
    for i, line in enumerate(lines):
        if line.startswith("import "):
            last_imp = i
    lines.insert(last_imp + 1, IMPORT_LINE)
    return "\n".join(lines)


def main() -> None:
    count = 0
    for path in ROOT.rglob("*.tsx"):
        if path.name in SKIP or "components/ui" in str(path):
            continue
        text = path.read_text(encoding="utf-8")
        if 'type="number"' not in text and "Number(e.target.value)" not in text:
            continue
        blocks = find_inputs(text)
        if not blocks:
            continue
        new_text = text
        for start, end, block in reversed(blocks):
            repl = convert_block(block)
            if repl:
                new_text = new_text[:start] + repl + new_text[end:]
        new_text = add_import(new_text)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(path.relative_to(ROOT))
            count += 1
    print(f"updated {count} files")


if __name__ == "__main__":
    main()

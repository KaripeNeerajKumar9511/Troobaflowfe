"""Repair broken NonNegativeNumericInput replacements from bulk script."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"


def fix(text: str) -> str:
    text = text.replace("NonNegativeNumericInput )} ", "NonNegativeNumericInput ")
    text = text.replace("NonNegativeNumericInput )}", "NonNegativeNumericInput")
    text = re.sub(r"\{ ([a-z_0-9]+):v \}", r"{ \1: v }", text)
    text = re.sub(r"\{ ([a-z_0-9]+):v\}", r"{ \1: v }", text)
    text = re.sub(r"update\(\{ ([a-z_]+):v \}\)", r"update({ \1: v })", text)
    text = re.sub(r"update\(\{ ([a-z_]+):v\}\)", r"update({ \1: v })", text)
    return text


def main() -> None:
    for path in ROOT.rglob("*.tsx"):
        t = path.read_text(encoding="utf-8")
        n = fix(t)
        if n != t:
            path.write_text(n, encoding="utf-8")
            print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()

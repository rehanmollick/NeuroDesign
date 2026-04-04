"""
Gemma 4 integration via Google AI Studio API.
Generates plain-English explanation of brain activation differences.
"""

import os
import json
import urllib.error


def _call_gemma(prompt: str) -> str:
    """Call Gemma 4 API with a prompt, return text response."""
    api_key = os.environ.get("GOOGLE_AI_KEY", "")
    if not api_key:
        return ""

    try:
        import urllib.request

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key={api_key}"
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
        }).encode()

        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
            parts = data["candidates"][0]["content"]["parts"]
            text = next((p["text"] for p in parts if not p.get("thought")), "")
            return text.strip()

    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        print(f"Gemma HTTP error {e.code}: {body}")
        return ""
    except Exception as e:
        print(f"Gemma error: {e}")
        return ""


def _build_region_text(regions: list[dict], limit: int = 8) -> str:
    top = sorted(regions, key=lambda r: abs(r["delta"]), reverse=True)[:limit]
    lines = []
    for r in top:
        direction = "Image B" if r["delta"] > 0 else "Image A"
        pct = abs(r["delta"]) * 100
        lines.append(
            f"- {r['displayName']} ({r['function']}): {direction} activates this {pct:.0f}% more"
        )
    return "\n".join(lines)


def explain(regions: list[dict]) -> str:
    """Generate plain-English explanation of brain activation differences."""
    region_text = _build_region_text(regions)

    prompt = f"""You are explaining neuroscience results to a designer who has never heard of brain regions.

Two images were compared using fMRI brain activation prediction. Here are the key differences:

{region_text}

Write 2-3 sentences explaining what this means for the designs. Focus on what the brain differences tell us about how people will perceive these images. Use plain language — no jargon. Be specific and concrete, not vague."""

    return _call_gemma(prompt)


def explain_detailed(regions: list[dict]) -> dict:
    """Generate detailed multi-section analysis. Returns dict with sections."""
    region_text = _build_region_text(regions, limit=10)

    prompt = f"""You are a neuromarketing expert explaining brain scan results to a designer.

Two images (Image A and Image B) were compared using fMRI brain activation prediction. Here are the differences:

{region_text}

Respond in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{{
  "winner": "A" or "B" or "tie",
  "winner_reason": "One sentence why this image performs better overall",
  "emotional_impact": "2 sentences comparing the emotional response each image triggers",
  "visual_attention": "2 sentences about which image captures and holds attention better and why",
  "memory_retention": "1-2 sentences about which image is more memorable and why",
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}}

Use plain language. Be specific about what each image does to the brain. No jargon."""

    text = _call_gemma(prompt)
    if not text:
        return {}

    try:
        # Strip markdown fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)
    except json.JSONDecodeError:
        print(f"Gemma JSON parse error: {text[:200]}")
        return {}


def chat(regions: list[dict], summary: str, user_message: str, history: list[dict] = None) -> str:
    """Chat about the comparison. Returns Gemma's response."""
    region_text = _build_region_text(regions)

    context = f"""You are a neuromarketing advisor. A designer is comparing two images using brain activation prediction.

Here is the comparison data:
{region_text}

Previous analysis: {summary}

The designer wants to discuss this comparison and get design advice. Be helpful, specific, and use plain language. Keep responses to 2-4 sentences unless they ask for more detail."""

    messages = [{"text": context}]
    if history:
        for msg in history[-6:]:  # keep last 6 messages for context
            messages.append({"text": msg["content"]})
    messages.append({"text": f"Designer asks: {user_message}"})

    prompt = "\n\n".join(m["text"] for m in messages)
    return _call_gemma(prompt)

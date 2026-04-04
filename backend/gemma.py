"""
Gemma 4 integration via Google AI Studio API.
Generates plain-English explanation of brain activation differences.
"""

import os
import json


def explain(regions: list[dict]) -> str:
    """
    Send top region differences to Gemma 4 and get a plain-English explanation.
    Returns empty string on failure (caller shows 'Analysis unavailable').
    """
    api_key = os.environ.get("GOOGLE_AI_KEY", "")
    if not api_key:
        return ""

    # Take top 8 regions by absolute delta for context
    top = sorted(regions, key=lambda r: abs(r["delta"]), reverse=True)[:8]

    region_lines = []
    for r in top:
        direction = "Image B" if r["delta"] > 0 else "Image A"
        pct = abs(r["delta"]) * 100
        region_lines.append(
            f"- {r['displayName']} ({r['function']}): {direction} activates this {pct:.0f}% more"
        )

    region_text = "\n".join(region_lines)

    prompt = f"""You are explaining neuroscience results to a designer who has never heard of brain regions.

Two images were compared using fMRI brain activation prediction. Here are the key differences:

{region_text}

Write 2-3 sentences explaining what this means for the designs. Focus on what the brain differences tell us about how people will perceive these images. Use plain language — no jargon. Be specific and concrete, not vague."""

    try:
        import urllib.request

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={api_key}"
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": 200, "temperature": 0.7},
        }).encode()

        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.load(resp)
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()

    except Exception as e:
        print(f"Gemma error: {e}")
        return ""

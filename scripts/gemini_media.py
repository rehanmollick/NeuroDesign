#!/usr/bin/env python3
"""CLI for generating images and videos via Google's Gemini API."""

import argparse
import os
import sys
import time

from google import genai
from google.genai import types


def generate_image(client: genai.Client, prompt: str, output: str) -> None:
    response = client.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=prompt,
        config=types.GenerateImagesConfig(number_of_images=1),
    )

    if not response.generated_images:
        print("Error: no image was generated", file=sys.stderr)
        sys.exit(1)

    response.generated_images[0].image.save(output)
    print(output)


def generate_video(client: genai.Client, prompt: str, output: str) -> None:
    # veo-2.0-generate-001 requires Vertex AI (project + location).
    # If you only have a Gemini API key, this will fail -- set up Vertex AI
    # credentials and pass vertexai=True to the Client instead.
    operation = client.models.generate_videos(
        model="veo-2.0-generate-001",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            number_of_videos=1,
            duration_seconds=6,
            aspect_ratio="16:9",
        ),
    )

    # Poll until the async operation completes
    while not operation.done:
        time.sleep(10)
        operation = client.operations.get(operation)

    if not operation.result or not operation.result.generated_videos:
        print("Error: no video was generated", file=sys.stderr)
        sys.exit(1)

    operation.result.generated_videos[0].video.save(output)
    print(output)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate images or videos with Gemini")
    parser.add_argument("--prompt", required=True, help="Text prompt for generation")
    parser.add_argument("--output", required=True, help="Output file path")
    parser.add_argument(
        "--mode",
        choices=["image", "video"],
        default="image",
        help="Generation mode (default: image)",
    )
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    if args.mode == "image":
        generate_image(client, args.prompt, args.output)
    else:
        generate_video(client, args.prompt, args.output)


if __name__ == "__main__":
    main()

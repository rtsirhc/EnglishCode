import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = "https://agents.lumalabs.ai/v1"
OUT_DIR = Path("public/assets/videos")
MANIFEST = OUT_DIR / os.environ.get("LUMA_MANIFEST", "luma_manifest.json")
RESOLUTION = os.environ.get("LUMA_RESOLUTION", "720p")
FILE_SUFFIX = os.environ.get("LUMA_FILE_SUFFIX", "")
FORCE_NEW = os.environ.get("LUMA_FORCE_NEW") == "1"


CLIPS = [
    {
        "name": "stadium_loop",
        "file": f"stadium_loop{FILE_SUFFIX}.mp4",
        "loop": True,
        "prompt": (
            "High-end realtime 3D soccer videogame main menu background, AAA sports game quality, 16:9. "
            "Locked wide virtual camera from behind two soccer players standing far apart on the pitch, facing "
            "a goal and a huge stadium screen. Players are seen from behind only, no visible faces, clean anatomy, "
            "no closeups. Bright night stadium lights, detailed grass, packed crowd, crisp ribbon boards and main "
            "screen reading ENGLISH WORLD CUP. Camera is stable with only subtle ambient motion, no zoom, no cuts, "
            "no handheld shake, no film grain, no retro look, no real team logos. Designed as a videogame scene "
            "with empty center space for UI overlay, seamless loop."
        ),
    },
    {
        "name": "quiz_idle",
        "file": f"quiz_idle{FILE_SUFFIX}.mp4",
        "loop": True,
        "prompt": (
            "Modern AAA soccer videogame trivia arena background, 16:9, locked wide camera, no zoom. View from "
            "the pitch toward the goal and crowd, clean high quality 3D render, sharp stadium lights, animated "
            "crowd and subtle flags, large central stadium display says ENGLISH WORLD CUP. No closeup faces, no "
            "deformed people, no real logos, no film footage look. Keep the center and lower middle visually calm "
            "for quiz UI overlay. Smooth seamless loop, polished e-sports game-show mood."
        ),
    },
    {
        "name": "penalty_build",
        "file": f"penalty_build{FILE_SUFFIX}.mp4",
        "loop": True,
        "prompt": (
            "AAA soccer videogame penalty shootout setup, 16:9, fixed third-person camera behind the ball at the "
            "penalty spot facing the goal. Goalkeeper is far away on the line, small in frame, no visible face. "
            "Two players may stand at the far edges from behind only. Bright modern stadium, crisp grass, crowd "
            "and LED boards reading ENGLISH WORLD CUP. Subtle idle animation only, no wild motion, no zoom, no cuts, "
            "no distorted bodies, no real logos. Clean space for minigame UI overlay, seamless loop."
        ),
    },
    {
        "name": "goal",
        "file": f"goal{FILE_SUFFIX}.mp4",
        "loop": False,
        "prompt": (
            "Short AAA soccer videogame goal celebration, 16:9. Fixed wide game camera from behind the penalty spot, "
            "ball shoots into the net, goalkeeper dives but remains small and not close to camera, no visible faces. "
            "Crowd lights pulse, subtle confetti, stadium boards say ENGLISH WORLD CUP. High quality 3D sports game "
            "render, clean anatomy, no closeups, no distorted faces, no retro film look, no logos, 5 second clip."
        ),
    },
    {
        "name": "save",
        "file": f"save{FILE_SUFFIX}.mp4",
        "loop": False,
        "prompt": (
            "Short AAA soccer videogame goalkeeper save, 16:9. Fixed wide game camera from behind the penalty spot, "
            "shot goes toward the corner, goalkeeper dives and saves while staying far from camera, no closeup face. "
            "Bright modern stadium, detailed goal net, crowd reacts, LED boards say ENGLISH WORLD CUP. Clean 3D render, "
            "stable camera, no zoom, no distorted bodies or faces, no real logos, 5 second clip."
        ),
    },
]


def request_json(method: str, url: str, api_key: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Luma HTTP {exc.code}: {details}") from exc


def download(url: str, path: Path) -> None:
    with urllib.request.urlopen(url, timeout=180) as response:
        path.write_bytes(response.read())


def create_clip(api_key: str, clip: dict) -> dict:
    generation_id = clip.get("generation_id")
    if not generation_id:
        body = {
            "model": "ray-3.2",
            "type": "video",
            "prompt": clip["prompt"],
            "aspect_ratio": "16:9",
            "video": {
                "resolution": RESOLUTION,
                "duration": "5s",
                "loop": clip["loop"],
            },
        }
        generation = request_json("POST", f"{API_BASE}/generations", api_key, body)
        generation_id = generation.get("id")
        if not generation_id:
            raise RuntimeError(f"No generation id returned for {clip['name']}: {generation}")
        print(f"{clip['name']}: submitted {generation_id}", flush=True)
    else:
        print(f"{clip['name']}: resuming {generation_id}", flush=True)
    started = time.time()
    while True:
        status = request_json("GET", f"{API_BASE}/generations/{generation_id}", api_key)
        state = status.get("state") or status.get("status") or "unknown"
        print(f"{clip['name']}: {state}", flush=True)
        if state == "failed":
            raise RuntimeError(f"Generation failed for {clip['name']}: {status}")
        output = status.get("output") if isinstance(status.get("output"), list) else []
        video_url = None
        image_url = None
        for item in output:
            if not isinstance(item, dict):
                continue
            url = item.get("url")
            media_type = item.get("media_type") or item.get("type") or ""
            if isinstance(url, str) and ("video" in media_type or url.split("?")[0].endswith((".mp4", ".mov", ".webm"))):
                video_url = url
            elif isinstance(url, str) and not image_url:
                image_url = url
        if state == "completed" and video_url:
            out_path = OUT_DIR / clip["file"]
            download(video_url, out_path)
            return {
                "name": clip["name"],
                "file": str(out_path),
                "generation_id": generation_id,
                "loop": clip["loop"],
                "prompt": clip["prompt"],
            }
        if time.time() - started > 900:
            raise TimeoutError(f"Timed out waiting for {clip['name']} ({generation_id})")
        time.sleep(8)


def main() -> None:
    api_key = os.environ.get("LUMA_API_KEY")
    if not api_key:
        raise SystemExit("Set LUMA_API_KEY in the environment.")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    previous = []
    if MANIFEST.exists():
        previous = json.loads(MANIFEST.read_text(encoding="utf-8"))
    previous_by_name = {item.get("name"): item for item in previous if isinstance(item, dict)}
    results = list(previous)
    for clip in CLIPS:
      existing = previous_by_name.get(clip["name"])
      if (
          not FORCE_NEW
          and existing
          and existing.get("generation_id")
          and Path(existing.get("file", "")).exists()
          and existing.get("video_downloaded")
      ):
          print(f"{clip['name']}: already downloaded", flush=True)
          continue
      if not FORCE_NEW and existing and existing.get("generation_id"):
          clip = {**clip, "generation_id": existing["generation_id"]}
      result = create_clip(api_key, clip)
      result["video_downloaded"] = True
      results = [item for item in results if item.get("name") != result["name"]]
      results.append(result)
      MANIFEST.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Wrote {MANIFEST}", flush=True)


if __name__ == "__main__":
    main()

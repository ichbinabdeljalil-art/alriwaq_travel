"""Render umrah-ramadan.html to a 30s 1080x1920 MP4 (30fps) using Playwright + ffmpeg."""
import pathlib, subprocess, sys
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
FPS = 30
DURATION = 30
OUT = HERE / "umrah-ramadan-alriwaq.mp4"
preview = [float(x) for x in sys.argv[1:]]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto((HERE / "umrah-ramadan.html").as_uri() + "?capture=1")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(500)
    if preview:
        for t in preview:
            page.evaluate(f"render({t})")
            page.screenshot(path=str(HERE / f"preview_{t:05.1f}.png"))
        sys.exit(0)
    ff = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error",
        "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-shortest", "-movflags", "+faststart", str(OUT),
    ], stdin=subprocess.PIPE)
    for i in range(FPS * DURATION):
        page.evaluate(f"render({i / FPS})")
        ff.stdin.write(page.screenshot(type="jpeg", quality=95))
    ff.stdin.close(); ff.wait()
    browser.close()
print("wrote", OUT)

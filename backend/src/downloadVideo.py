import sys
import pytube

videoUrl = str(sys.argv[1])
videoId = videoUrl.split("?v=")[1]

try:
    pytube.YouTube(videoUrl).streams.filter(only_audio=True).first().download(
        filename=f"{videoId}.mp4", output_path="./audio")
    print('Download complete', end= '')
except:
    print('Download failed', end = '')

sys.stdout.flush()

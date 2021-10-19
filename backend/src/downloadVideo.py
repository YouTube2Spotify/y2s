import sys
import pytube

videoUrl = str(sys.argv[1])
videoId = videoUrl.split("?v=")[1]

try:
    pytube.YouTube(videoUrl).streams.filter(only_audio=True).first().download(
        filename=f"{videoId}.mp4", output_path="./audio")
    print('Download complete')
except:
    print('Download failed')

sys.stdout.flush()

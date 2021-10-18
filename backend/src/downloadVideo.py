import sys
import pytube

videoUrl = str(sys.argv[1])
videoId = videoUrl.split("?v=")[1]

pytube.YouTube(videoUrl).streams.filter(

        # Path is relative to the executing script, which is server.js in /backend
        only_audio=True).first().download(filename=f"{videoId}.mp4", output_path="./audio")

print()
sys.stdout.flush()

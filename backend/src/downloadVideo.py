import sys
import pytube
import requests

videoUrl = str(sys.argv[1])
videoId = videoUrl.split("?v=")[1]

metadata = pytube.YouTube(videoUrl).metadata._metadata

if not metadata:
  pytube.YouTube(videoUrl).streams.filter(

    # Path is relative to the executing script, which is server.js in /backend
    only_audio=True).first().download(filename=f"{videoId}.mp4", output_path="./audio")

  print('noMetadata')

else:
  json_data = {}
  json_data["title"] = metadata[0]['Song']
  json_data["artist"] = metadata[0]['Artist']

  post_data = requests.post('http://localhost:3000/api/python', data = json_data)
  
  print('metadataFound')

sys.stdout.flush()
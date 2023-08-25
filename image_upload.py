import base64
import requests
import sys

file_path = 'image.png'
file_path = 'nezuko.jpg'
file_name = file_path.split('/')[-1]
token = 'd98adc9c-443a-460e-9098-ab0a4645c14c'
parentId = '64e88e27d586193c094472f4'
file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = {'name': file_name, 'type': 'image', 'isPublic': True,
          'data': file_encoded, 'parentId': parentId}
r_headers = {'X-Token': token}

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())

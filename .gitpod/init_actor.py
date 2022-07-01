import subprocess
import requests
import time

INSTANCE_URL = subprocess.check_output(['gp', 'url', '8000']).decode()[:-1]

# Login to initialize user actor
req = requests.Session()

print('Requesting csrftoken cookie')
# NOTE: Sometimes it does not return the cookie for the first time
while True:
    try:
        res = req.get(INSTANCE_URL + '/login')
        token = res.cookies['csrftoken']
    except:
        print(res.content)
        time.sleep(1)
        print('Re-requesting csrftoken cookie')

req.post(INSTANCE_URL + '/api/v1/users/login', data={
    'username': 'gitpod',
    'password': 'gitpod'
}, headers={
    'Referer': INSTANCE_URL + '/login',
    'X-CSRFTOKEN': token
})

req.get(INSTANCE_URL)
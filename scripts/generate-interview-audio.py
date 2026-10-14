"""Render only the public question catalog using a local, pinned VOICEVOX engine."""
import argparse, concurrent.futures, io, json, math, pathlib, struct, subprocess, time, urllib.parse, urllib.request, wave

parser=argparse.ArgumentParser()
parser.add_argument('--catalog',required=True)
parser.add_argument('--output',required=True)
parser.add_argument('--engine',default='http://127.0.0.1:50021')
args=parser.parse_args()
catalog=json.loads(pathlib.Path(args.catalog).read_text())
output=pathlib.Path(args.output)

def request(path,body=None):
    data=None if body is None else json.dumps(body).encode()
    req=urllib.request.Request(args.engine+path,data=data,method='GET' if body is None else 'POST',headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=120) as response:return response.read()

for attempt in range(60):
    try:
        speakers=json.loads(request('/speakers'))
        break
    except Exception:
        if attempt==59:raise
        time.sleep(2)
profiles={}
for role,profile in catalog['profiles'].items():
    speaker=next(s for s in speakers if s['name']==profile['name'])
    style=next(s for s in speaker['styles'] if s['name']==profile['style'])
    profiles[role]={**profile,'speaker_id':style['id']}
assert len({p['speaker_id'] for p in profiles.values()})==2,'Two different speakers are required'

def render(entry):
    profile=profiles[entry['role']]
    parameters=urllib.parse.urlencode({'speaker':profile['speaker_id'],'text':entry['text']})
    query=json.loads(request('/audio_query?'+parameters,{}))
    query['speedScale']=profile['speed']
    query['outputSamplingRate']=24000
    query['outputStereo']=False
    wav=request('/synthesis?speaker='+str(profile['speaker_id']),query)
    with wave.open(io.BytesIO(wav)) as source:
        assert source.getsampwidth()==2 and source.getnchannels()==1
        samples=source.readframes(source.getnframes())
        values=struct.unpack('<'+'h'*(len(samples)//2),samples)
        rms=math.sqrt(sum(v*v for v in values)/max(1,len(values)))
        duration=source.getnframes()/source.getframerate()
        assert .2<duration<90 and rms>20,'Empty or invalid generated speech'
    target=output/entry['path']
    target.parent.mkdir(parents=True,exist_ok=True)
    result=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i','pipe:0','-codec:a','libmp3lame','-b:a','64k',str(target)],input=wav,capture_output=True)
    if result.returncode:raise RuntimeError(result.stderr.decode())
    assert target.stat().st_size>1000
    return {'path':entry['path'],'speaker_id':profile['speaker_id'],'duration':round(duration,3),'bytes':target.stat().st_size}

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    files=list(pool.map(render,catalog['entries']))
manifest={'version':1,'engine':'VOICEVOX 0.25.2','profiles':profiles,'files':files,'count':len(files),'bytes':sum(f['bytes'] for f in files)}
(output/'audio').mkdir(parents=True,exist_ok=True)
(output/'audio'/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'generated_clips':len(files),'bytes':manifest['bytes'],'speakers':{role:p['name'] for role,p in profiles.items()}},ensure_ascii=False))

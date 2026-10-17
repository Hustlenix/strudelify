from pathlib import Path
import sys,json,subprocess,numpy as np
ff=Path(r'C:\Users\LalithReddy.b\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe')
y=np.frombuffer(subprocess.check_output([str(ff),'-v','error','-i',sys.argv[1],'-ac','1','-ar','22050','-f','f32le','pipe:1']),dtype='<f4')
windows=[np.sqrt(np.mean(y[i:i+2205]**2)) for i in range(0,len(y),2205)]
print(json.dumps({'status':'MEASURED','duration_s':len(y)/22050,'peak_dbfs':float(20*np.log10(np.max(np.abs(y))+1e-12)),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(y*y))+1e-12)),'samples_at_or_above_0dbfs':int(np.sum(np.abs(y)>=1)),'silent_100ms_fraction_below_minus60db':float(np.mean(np.array(windows)<.001)),'limitation':'Decoded mono capture only; peak over 0dB is evidence to inspect, not proof of physical DAC clipping.'}))

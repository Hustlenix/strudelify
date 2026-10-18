"""Measure complete rendered originals; generate named local listening files."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, re, subprocess
import argparse
import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--folder',default='release-audit/private/originals-v1')
    parser.add_argument('--report',default='release-audit/reports/original-full-captures.json')
    parser.add_argument('--output',default='release-audit/reports/original-audio-quality.json')
    args=parser.parse_args()
    report = json.loads((ROOT/args.report).read_text())
    def measure(row):
        folder = ROOT/args.folder
        data = np.fromfile(folder/(row['id']+'.f32'),dtype='<f4').reshape(-1,2)
        if not np.isfinite(data).all():
            raise ValueError('Nonfinite audio')
        output = folder/(row['id']+'.wav')
        if output.exists():
            raise ValueError('Preserve earlier measured output')
        wavfile.write(output,row['sample_rate'],data)
        result = subprocess.run(['rtk','proxy','ffmpeg','-nostdin','-i',str(output),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True)
        summary = result.stderr[result.stderr.rfind('Summary:'):]
        lufs = float(re.search(r'I:\s*(-?[\d.]+) LUFS',summary)[1])
        peak = float(re.search(r'Peak:\s*(-?[\d.]+) dBFS',summary)[1])
        tail = data[-row['sample_rate']:]
        return {**row,'capture_seconds':len(data)/row['sample_rate'],'integrated_lufs':lufs,
            'true_peak_dbtp':peak,'final_second_peak':float(np.max(np.abs(tail))),
            'loudness_summary':summary,'human_listening_status':'pending; technical measurements only'}
    with ThreadPoolExecutor(max_workers=3) as pool:
        rows=list(pool.map(measure,report['tracks']))
    report.update(tracks=rows,human_listeners=0)
    (ROOT/args.output).write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    for row in rows:
        print(row['id'],row['integrated_lufs'],'LUFS',row['true_peak_dbtp'],'dBTP',row['final_second_peak'],'tail peak')


if __name__ == '__main__':
    main()

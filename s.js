  const { getAudioDurationInSeconds } = require('get-audio-duration')
  const RootPath = require('app-root-path')
  const { execSync } = require('child_process');
  const ffmpegStatic = require('ffmpeg-static');
  
  execSync(`espeak-ng -v fa+m3 -f s.txt -s 146 -p 45 -a 110 -w s.wav`)

  execSync(`${ffmpegStatic} -i s.wav -filter_complex "equalizer=f=1000:width_type=h:width=1500:g=-10,aresample=44100" sm31.mp3`)

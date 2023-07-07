// const { getAudioDurationInSeconds } = require('get-audio-duration')
// const RootPath = require('app-root-path')
// const { execSync } = require('child_process');
// const ffmpegStatic = require('ffmpeg-static');

// // From a local path...
// getAudioDurationInSeconds(RootPath + '/a.mp3').then((duration) => {
  
// })
// if(duration > 40)
// execSync(`${ffmpegStatic} -i a.mp3 -filter:a "atempo=1.4" b.wav`)
// else if(duration > 35)
// execSync(`${ffmpegStatic} -i a.mp3 -filter:a "atempo=1.2" b.wav`)
// else if(duration > 30)
// execSync(`${ffmpegStatic} -i a.mp3 -filter:a "atempo=1.1" b.wav`)


  const { getAudioDurationInSeconds } = require('get-audio-duration')
  const RootPath = require('app-root-path')
  const { execSync } = require('child_process');
  const ffmpegStatic = require('ffmpeg-static');
  
  // From a local path...
  getAudioDurationInSeconds(`${RootPath}/public/upload/${'/1688722515426.mp3'}`).then((duration) => {
  console.log(duration);
  })
  
  // execSync(`${ffmpegStatic} -i a.mp3 -filter:a "atempo=1.1" r.mp3`)
  // execSync(`${ffmpegStatic} -i ${RootPath}/a.mp3 -af "equalizer=f=1000:width_type=h:width=1500:g=-10" -filter:a "atempo=1.2" -ar 44100 ${RootPath}/b.mp3`)
  
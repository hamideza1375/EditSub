const fs = require("fs");
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const setHeaders = require("./header");
const RootPath = require("app-root-path");

//! download models
//! Sox set to envaironment
//! npx node@14.0.0 ./index.js
const DeepSpeech = require('deepspeech');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const rootPath = require('app-root-path');
const { execSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
// const { translate } = require('@vitalets/google-translate-api');
const translate = require('./translate');



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(setHeaders);
app.use(express.static("public"));
app.use(fileUpload());


let modelPath = './models/deepspeech-0.9.3-models.pbmm';

let model = new DeepSpeech.Model(modelPath);

let desiredSampleRate = model.sampleRate();

let scorerPath = './models/deepspeech-0.9.3-models.scorer';

model.enableExternalScorer(scorerPath);


const seconder = (secound) => {
  var countDownDate = (secound * 1000) / 2
  var countDownDate2 = (secound * 1000)
  var now = new Date().getTime();

  var distance = countDownDate;
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  var distance2 = countDownDate2;
  var minutes2 = Math.floor((distance2 % (1000 * 60 * 60)) / (1000 * 60));
  var seconds2 = Math.floor((distance2 % (1000 * 60)) / 1000);

  return { part1: '00:' + String(minutes) + ':' + String(seconds), part2: '00:' + String(minutes2) + ':' + String(seconds2) }

}

app.post('/upload', async (req, res) => {
  const { part1, part2 } = seconder(Number(req.body.duration))
  if (!req.files) return res.status(400).json('err')
  const video = req.files.video;
  const fileName = `${Date.now()}_.${video.name.split('.')[video.name.split('.').length - 1]}`;
  fs.writeFileSync(`${RootPath}/public/${fileName}`, video.data);

  execSync(`${ffmpegStatic} -ss 00:00:00 -i ${RootPath}/public/${fileName} -t ${part1} -c copy -f mp4 ${RootPath}/public/${fileName}1.mp4`)
  const { subtitle, audioUrl } = await createSubtitle(`${RootPath}/public/${fileName}1.mp4`)
  fs.unlinkSync(`${RootPath}/public/${fileName}1.mp4`)
  fs.unlinkSync(`${RootPath}/public/${fileName}1.mp4.wav`)
  res.status(200).json({ text: subtitle, audioUrl, videoUrl: fileName, part1, part2 })
})

app.post('/upload2', async (req, res) => {
  execSync(`${ffmpegStatic} -ss ${req.body.part1} -i ${RootPath}/public/${req.body.fileName} -t ${req.body.part2} -c copy -f mp4 ${RootPath}/public/${req.body.fileName}2.mp4`)
  const { subtitle, audioUrl, audioLength } = await createSubtitle(`${RootPath}/public/${req.body.fileName}2.mp4`)
  fs.unlinkSync(`${RootPath}/public/${req.body.fileName}`)
  fs.unlinkSync(`${RootPath}/public/${req.body.fileName}2.mp4`)
  fs.unlinkSync(`${RootPath}/public/${req.body.fileName}2.mp4.wav`)
  res.status(200).json({ text: subtitle, audioUrl, audioLength })
})

const port = 4000
app.listen(port, (err) => { console.log(`App Listen to port ${port}`) })







async function createSubtitle(url) {
  return new Promise((resolve, reject) => {

    let audioFile = transcribeLocalVideo(url)

    if (!fs.existsSync(audioFile)) {
      console.log('file missing:', audioFile);
      process.exit();
    }

    const buffer = fs.readFileSync(audioFile);
    const result = Wav.decode(buffer);

    if (result.sampleRate < desiredSampleRate) {
      console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than ' + desiredSampleRate + 'Hz. Up-sampling might produce erratic speech recognition.');
    }

    function bufferToStream(buffer) {
      let stream = new Duplex();
      stream.push(buffer);
      stream.push(null);
      return stream;
    }

    let audioStream = new MemoryStream();
    bufferToStream(buffer).
      pipe(Sox({
        global: {
          'no-dither': true,
        },
        output: {
          bits: 16,
          rate: desiredSampleRate,
          channels: 1,
          encoding: 'signed-integer',
          endian: 'little',
          compression: 0.0,
          type: 'raw'
        }
      })).
      pipe(audioStream);

    audioStream.on('finish', async () => {
      let audioBuffer = audioStream.toBuffer();
      const audioLength = (audioBuffer.length / 2) * (1 / desiredSampleRate);
      console.log('audio length', audioLength);
      let result = model.stt(audioBuffer);
      const { text } = await translate(result, { to: 'fa' });
      // const { text } = await translate(result, { to: 'fa' })

      const txt = Date.now() + '.txt'
      fs.writeFileSync(`${rootPath}/public/${txt}`, text);
      const wav = Date.now() + '.wav'
      // execSync(`espeak-ng -v fa+m3 -f ${rootPath}/test.txt -s 150 -p 15 -a 110 -w ${rootPath}/public/${wav}`)
      execSync(`espeak-ng -v fa+f5 -f ${rootPath}/public/${txt} -s 144 -p 50 -a 90 -w ${rootPath}/public/${wav}`)

      resolve({ subtitle: text, audioUrl: wav, audioLength })
    });
  })
}





function transcribeLocalVideo(filePath) {
  ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`);
  return `${filePath}.wav`
}




async function ffmpeg(command) {
  // execSync(`${ffmpegStatic} -ss 00:00:00 -i "C:\Input.mp4" -t 00:03:00 -c copy -f mp4 "C:\output.mp4"`)
  return new Promise((resolve, reject) => {
    execSync(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
}
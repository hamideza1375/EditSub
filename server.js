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
const { translate } = require('@vitalets/google-translate-api');



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


app.post('/upload', async (req, res) => {
  if (!req.files) return res.status(400).json('err')
  const video = req.files.video;
  const fileName = `${Date.now()}_${video.name}`;
  fs.writeFileSync(`${RootPath}/public/${fileName}`, video.data);
  const {subtitle, audioUrl} = await createSubtitle(`${RootPath}/public/${fileName}`)
  fs.unlinkSync(`${RootPath}/public/${fileName}.wav`)
  console.log('fileName', fileName);
  res.status(200).json({ text: subtitle, audioUrl, videoUrl: fileName })
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
      fs.writeFileSync(`${rootPath}/test.txt`, text);
      execSync(`espeak-ng -v fa -f ${rootPath}/test.txt -w ${rootPath}/public/output.wav`)
      resolve({subtitle:text, audioUrl:`output.wav`})
    });
  })
}





function transcribeLocalVideo(filePath) {
  ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`);
  return `${filePath}.wav`
}




async function ffmpeg(command) {
  return new Promise((resolve, reject) => {
    execSync(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
}
const express = require('express');
const fs = require('fs');
const app = express();
const NodeMediaServer = require('node-media-server');




// app.get('/',(req,res)=>{
//     res.writeHead(200,{'Content-Type':'video/mp4'})
//     var rs = fs.createReadStream('video.MP4')
//     rs.pipe(res)
// })


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/playVideo',(req,res)=>{
const range = req.headers.range
console.log(range);

const videoPath = './live-stream.MP4';
const videoSize = fs.statSync(videoPath).size;
console.log(videoSize);
const chunkSize = 1*1e6;
const start = Number(range.replace(/\D/g, ''))
const end = Math.min(start+chunkSize, videoSize-1)
const contentLenth = end - start+1

//headers 
const headers  ={
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Range":'bytes',
    "Content-Lenth":contentLenth,
    "Content-Type":"video/MP4"
}
res.writeHead(206,headers);

const stream = fs.createReadStream(videoPath,{start, end})
stream.pipe(res);



})





const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout:1,
        //server url 
        rtmp: {
        server: 'rtmp://localhost:1935/live'
    }
    },
    http: {
        port: 8000,
        allow_origin: '*'
    }
};


var nms = new NodeMediaServer(config);
nms.run();

app.post('/api/live-stream', (req, res) => {
    req.pipe(nms.getPublisher("live"));
    res.send("Live Stream started successfully.");
});

app.get('/live-stream', (req, res) => {
    // code to handle live stream
    const streamPath = 'rtmp://localhost:1935/live';
    res.json({streamPath});
});

app.listen(3000, () => {
    console.log('Live stream API started on port 3000');
});




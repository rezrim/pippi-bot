const express = require('express');
const fetch = require('node-fetch');
const request = require('request');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// ================= START BOT CODE ===================
require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require("ytdl-core");
const getYoutubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const image = require('./image.js');
const action = require('./function');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const API_YTB = process.env.API_YTB

let queue=[]
let isPlaying=false
let dispatcher=null
let voiceChannel=null
let skipReq=0
let skippers=[]

bot.login(TOKEN);

function random_item(items) {
  return items[Math.floor(Math.random()*items.length)];
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  let n = msg.content.search("-pippi");
  if(n>-1){
    if (msg.content === 'halo -pippi' || msg.content === '-pippi') {
      msg.reply('iya Pippi ? kamu mau nanya apa ? (Pippi cuma bisa jawab ya atau tidak)');
    }else if(msg.content !== 'halo -pippi'){
        if(msg.author.username!=="Pippi"){
          let m = msg.content.search("sehat");
          let l = msg.content.search("kabar");
          let k = msg.content.search("terimakasih");
          let j = msg.content.search("siapa");
          let i = msg.content.search("suara");
          let h = msg.content.search("hitung");
          let g = msg.content.search("salam kenal");
          let f = msg.content.search(/umi/i);
          let e = msg.content.search(/shio/i);
          let d = msg.content.search("jempol");
          let c = msg.content.search("cuaca");
          let b = msg.content.search("peluk");
          let a = msg.content.search("ngantuk");
          let o = msg.content.search("berita");
          let p = msg.content.search("anime");
          let q = msg.content.search(/oyasumi/i);
          let r = msg.content.search(/ohayou/i);
          let s = msg.content.search("udah");
          let t = msg.content.search("cium");
          let u = msg.content.search("kenapa");
          let v = msg.content.search("semangat");
          let mplay = msg.content.search("play");
          let mskip = msg.content.search("skip");

          if(o>-1){
            action.berita(msg)
          }else if(p>-1){
            action.anime(msg)
          }else if(m>-1 || l>-1){
            msg.reply("Pippi selalu sehat ko.., semoga kamu juga sehat ya pippi..");
          }else if(k>-1){
            msg.reply("Sama-sama pippi...");
          }else if(j>-1){
            msg.reply("Aku Pippi.., peliharaannya Umi dan Shio");
          }else if(i>-1){
            msg.reply("Suara Pippi..", {files: ['https://www.mboxdrive.com/pippi.mp3']});
          }else if(g>-1){
            msg.reply("Selama kenal juga Pippi..");
          }else if(q>-1){
            msg.reply("Oyasumi juga Pippi..");
          }else if(f>-1 && e>-1){
            msg.reply("Pippi sayang Umi dan Shio..");
          }else if(f>-1){
            msg.reply("Pippi sayang Umi..");
          }else if(e>-1){
            msg.reply("Pippi sayang Shio..");
          }else if(d>-1){
            msg.reply(":thumbsup:");
          }else if(r>-1){
            msg.reply("Ohayou Pippi...");
          }else if(u>-1){
            msg.reply("Gpapa ko Pippi...");
          }else if(v>-1){
            msg.reply("Pippi selalu semangat ko.., kamu juga semangat ya.. ");
          }else if(s>-1){
            let opt = ['Udah dong..','Belum Pippi..']
            msg.reply(random_item(opt));
          }else if(b>-1){
            action.hug(msg)
          }else if(t>-1){
            action.hug(msg)
          }else if(a>-1){
            let imgSleepy = image.imageSleepy
            msg.reply("Hoamzz...", {files: [random_item(imgSleepy)]});
          }else if(c>-1){
            action.cuaca(msg)
          }else if(h>-1){
            action.hitung(msg)
          }else if(mplay>-1){
            if(queue.length>0||isPlaying){
              let args=msg.content.substr(12)
              getID(args, function (id) {
                add_to_queue(id)
                // console.log(id)
                // fetchVideoInfo(id, function (err, videoInfo) {
                //   if(err) throw new Error(err)
                //   msg.reply(" Added to Queue **"+videoInfo.title+"**")
                // })
                msg.reply("Pippi puter lagunya ya..")
              })
            }else{
              isPlaying=true
              let args=msg.content.substr(12)
              getID(args, function (id) {
                
                queue.push("placeholder")
                playMusic(id,msg)
                // fetchVideoInfo(id, function (err, videoInfo) {
                //   if(err) throw new Error(err)
                //   msg.reply(" Now Playing **"+videoInfo.title+"**")
                // })\
                msg.reply("Pippi puter lagunya ya..")
              })
            }
          }else if(mskip>-1){
            if(skippers.indexOf(msg.author.id)=== -1){
              skippers.push(msg.author.id)
              skipReq++
              skip_song(msg)
            }
          }else{
            let answer=["iya Pippi..","tidak Pippi.."]
            msg.reply(random_item(answer));
          }
        }
    }
  }
});

function skip_song(message){
  dispatcher.end()
  if(queue.length>1){
    playMusic(queue[0].message)
  }else{
    skipReq=0
    skippers=[]
  }
}

function playMusic(id, message){
  // console.log(message.member)
  voiceChannel = message.member.voice.channel
  
  voiceChannel.join().then(function (connection){
    stream=ytdl("https://www.youtube.com/watch?v="+id,{
      filter:'audioonly'
    })
    // console.log(stream)
    skipReq=0
    skippers=[]
    dispatcher=connection.play(stream)
    dispatcher.on('end', function () {
      skipReq=0
      skippers=[]
      queue.shift()
      if(queue.length==0){
        queue=[]
        isPlaying=false
      }else{
        playMusic(queue[0], message)
      }
    })
  })
  
}

function getID(str,cb){
  if(isYoutube(str)){
    cb(getYoutubeID(str))
  }else{
    search_videos(str, function (id) {
      cb(id)
    })
  }
}

function add_to_queue(strID){
  if(isYoutube(strID)){
    queue.push(getYoutubeID(strID))
  }else{
    queue.push(strID)
  }
}

function search_videos(query,callback){
  fetch("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q="+encodeURIComponent(query)+"&key="+API_YTB)
  .then(response => response.json())
  .then(res => {
    // console.log(res)
    // let json = JSON.parse(res)
    callback(res.items[0].id.videoId)
  })
}

function isYoutube(str){
  return str.toLowerCase().indexOf("youtube.com") > -1
}

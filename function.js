const image = require('./image.js');
const moment = require('moment');
const fetch = require('node-fetch');
const weather = require('weather-js');
const Discord = require('discord.js');
const ytdl = require("ytdl-core");
const API_NEWS = process.env.API_NEWS;

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const queue = new Map();


function random_item(items) {
  return items[Math.floor(Math.random()*items.length)];
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


module.exports.berita = function (msg) { 
    let keyword = msg.content.substr(13)
    fetch('http://newsapi.org/v2/top-headlines?country=id&q='+keyword+'&apiKey='+API_NEWS)
    .then(response => response.json())
    .then(data => {
      // console.log(data.articles.length)
      if(data.articles.length>0){
        let artikel=random_item(data.articles)
        const embed = new Discord.MessageEmbed()
          .setColor(0x00AE86) 
          .setTitle(`${artikel.title}`)
          .setImage(`${artikel.urlToImage}`)
          .setDescription(`${artikel.description}`)
          .setFooter(`Sumber : ${artikel.url} ( ${moment(artikel.publishedAt).format('D MMMM YYYY, h:mm:ss a')} )`);
          msg.reply({embed});
      }else{
          msg.reply("Pippi gak nemu ni beritanya...");
      }
    })
    .catch(err => console.log(err))
};

module.exports.anime = function (msg) {
  let keyword = msg.content.substr(13)
  fetch('https://api.jikan.moe/v3/search/anime/?q='+keyword+'&limit=2')
  .then(response => response.json())
  .then(data => {
    if(data.results.length>0){
      let artikel=random_item(data.results)
      const embed = new Discord.MessageEmbed()
        .setColor(0x00AE86) 
        .setTitle(`Judul : ${artikel.title}`)
        .setImage(`${artikel.image_url}`)
        .setDescription(`Sinopsis : ${artikel.synopsis}`)
        .addField('Rating',`${artikel.score}`, true)
        .addField('Untuk Umur',`${artikel.rated}`, true)
        .addField('Status',`${artikel.airing ? 'Ongoing' : 'Tamat'}`, true)
        .setFooter(`Source : ${artikel.url}`)
        msg.reply({embed});
    }else{
        msg.reply("Pippi gak nemu ni animenya...");
    }
  })
  .catch(err => console.log(err))
}

module.exports.hug = function (msg) {
  let opt = ['iya','tidak','iya']
  if(random_item(opt) == 'iya'){
    let imgHug = image.imageHug
    msg.channel.send("Sini Pippi peluk...", {files: [random_item(imgHug)]});
  }else{
    let imgHug = image.imageTsun
    msg.channel.send("Nggak mau...", {files: [random_item(imgHug)]});
  }
}

module.exports.kiss = function (msg) {
  let opt = ['iya','tidak','iya']
  if(random_item(opt) == 'iya'){
    let imgKiss = image.imageKiss
    msg.channel.send("Sini Pippi cium...", {files: [random_item(imgKiss)]});
  }else{
    let imgKiss = image.imageTsun
    msg.channel.send("Nggak mau...", {files: [random_item(imgKiss)]});
  }
}

module.exports.cuaca = function (msg) {
  let kota = msg.content.substr(12);
  weather.find({search: kota, degreeType: 'C'}, function(err, result) {
    if (err) msg.channel.send(err);
    if (result.length === 0) {
        msg.channel.send('Pippi gak tau sama kotanya..')
        return; 
    }

    var current = result[0].current;
    var location = result[0].location; 

    const embed = new Discord.MessageEmbed()
        .setDescription(`**${current.skytext}**`)
        .setAuthor(`Cuaca untuk ${current.observationpoint}`)
        .setThumbnail(current.imageUrl) 
        .setColor(0x00AE86) 
        .addField('Zona Waktu',`UTC+${location.timezone}`, true)
        .addField('Tipe Derajat',location.degreetype, true)
        .addField('Temperatur',`${current.temperature} Derajat`, true)
        .addField('Terasa Seperti', `${current.feelslike} Derajat`, true)
        .addField('Kecepatan Angin',current.winddisplay, true)
        .addField('Kelembapan', `${current.humidity}%`, true)

        msg.reply({embed});
  });
}

module.exports.hitung = function (msg) {
  let str = msg.content.substr(1);
  let total=0;
  let operator = str.match(/[\(\)\+\-\*\/\.]/g, '');
  if(operator==null){
    msg.reply("Pippi pusing.., coba lagi ya ~")
  }else if(operator.length>1){
    msg.reply("Pippi cuma bisa 2 digit aja ~~")
  }else{
    let number = str.match(/[\d\(\)\+\-\*\/\.]/g, '');
    let tostr = number.toString()
    let del = tostr.split(",").join("")
    let split = del.split(operator)
    if(operator=='+'){
      total = parseInt(split[0])+parseInt(split[1])
    }else if(operator=='-'){
      total = split[0]-split[1]
    }else if(operator=='/'){
      total = split[0]/split[1]
    }else if(operator=='*'){
      total = split[0]*split[1]
    }
    msg.reply("Jawabannya adalah... "+total)
  }
}
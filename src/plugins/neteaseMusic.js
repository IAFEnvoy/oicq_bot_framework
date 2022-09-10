const fetch = import('node-fetch');
const oicq = require('oicq');

let songCookie = undefined;

let lastJson = undefined;

const getSearchResult = async (keyWord) => {
    keyWord = keyWord.replace(' ', '%20');
    let search = `http://music.163.com/api/search/pc?s=${keyWord}&offset=0&limit=20&type=1`;
    if (songCookie == null)
        await setCookie(search);
    const a = await (await fetch).default(search, {
        headers: {
            Cookie: songCookie,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        }
    }).then(res => res.json());

    if (a.code == 200) {
        lastJson = a.result;
        let ret = '';
        for (var i = 0; i < 10; i++)
            ret += `${i}、${lastJson.songs[i].name} - ${lastJson.songs[i].artists[i]?.name}\n`;
        ret += '“获取 <id>”获取歌曲语音\n“链接 <id>”获取歌曲下载链接';
        return ret;
    } else {
        return '查找失败！';
    }
}

const setCookie = async (url) => {
    const a = await (await fetch).default(url);
    let cookie = a.headers.raw()['set-cookie'][0];
    songCookie = cookie.split(';')[0];
}

const getSongUrl = (index) => {
    if (lastJson == undefined)
        return `请先搜歌`;
    return `http://music.163.com/song/media/outer/url?id=${lastJson.songs[index].id}.mp3`;
}

const execute = async(message, client, e) => {
    let ms = message.split(' ');
    if (ms[0] == '搜歌' && ms.length >= 2) {
        try {
            let text = "";
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }
            client.sendGroupMsg(e.group_id, await getSearchResult(text));
        } catch (err) {
            console.log(err);
            client.sendGroupMsg(e.group_id, '查找失败！');
        }
    }
    if (ms[0] == '获取' && ms.length >= 2) {
        try {
            if (ms[1].length == 1)
                client.sendGroupMsg(e.group_id, oicq.segment.record(getSongUrl(new Number(ms[1])))).catch(() => {
                    client.sendGroupMsg(e.group_id, '歌曲获取失败，请尝试下一首（api问题）');
                });
        } catch (e) {
            console.log(e);
        }
    }
    if (ms[0] == '链接' && ms.length >= 2) {
        try {
            client.sendGroupMsg(e.group_id, getSongUrl(new Number(ms[1]))).catch(() => {
                client.sendGroupMsg(e.group_id, '歌曲获取失败，请尝试下一首（api问题）');
            });
        } catch (e) {
            console.log(e);
        }
    }
}

const config = {
    id: 'music',
    name: '网易云听歌',
    menu: '搜歌 <歌曲名> 搜歌',
    default_permission: false
};

module.exports = { config, execute };
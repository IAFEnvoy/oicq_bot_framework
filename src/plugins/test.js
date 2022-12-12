const oicq = require('oicq');

const rMax = 1000;

const sleep = (duration) => new Promise(resolve => { setTimeout(resolve, duration) });

const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

const texts = [
    '是五十万，已举办',
    '锟斤拷锟斤拷锟斤拷锟斤拷',
    '是一个网友，能交个朋友吗',
    '是老二次元，发点图快'
]

const onMessage = async (client, event) => {
    if (Math.floor(Math.random() * rMax) == 0 || (event.message[0].text == '/test' && event.sender.user_id == 1662544426)) {
        client.sendGroupMsg(event.group_id, '你好，我是冰火').catch(err => console.log(err));
        await sleep(1000);
        client.sendGroupMsg(event.group_id, [oicq.segment.at(event.sender.user_id), ' 正在大数据分析你的身份，包括但不限于你的浏览记录，p站收藏夹等，请稍等']).catch(err => console.log(err));;
        await sleep(10 * 1000);
        client.sendGroupMsg(event.group_id, '哔！结果出来了').catch(err => console.log(err));
        await sleep(1000);
        client.sendGroupMsg(event.group_id, [oicq.segment.at(event.sender.user_id), ' ' + r(texts)]).catch(err => console.log(err));;
    }
}

const config = {
    id: 'test',
    name: '乱七八糟'
};

module.exports = { config, onMessage };
const containsGroup = (str) => {
    return str.split(/[0-9]{9,}/).length - 1;
}

const containsIps = (str) => {
    return str.split(/(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/).length - 1;
}

const containDomains = (str) => {
    return str.split(/[a-zA-Z0-9]+\.[a-zA-z0-9]+\.[a-zA-z0-9]+/).length - 1;
}

const blWords = {
    '网易': 10,
    '小号机': 70,
    '外挂': 80,
    '黑客': 80,
    '绕过': 80,
    '稳定': 15,
    '稳绕': 80,
    'bypass': 80,
    '旁路': 55,
    '内部': 30,
    '外部': 30,
    '裙': 10,
    '群': 50,
    '工具箱': 15,
    '公益工具': 40,
    '免费小号': 50,
    'vape': 90,
    'hanabi': 90,
    'fdp': 90,
    'fdpcn': 90,
    'config': 70,
    '卡网': 80,
    'xgp': 80,
    '西瓜皮': 40,
    '免费配置': 40,
    '稳定配置': 40,
    'cookie卡': 80,
    '黑卡': 80,
    '1+': 50,
    '21+': 20,
    '出': 70,
    '收': 70,
    '买': 70,
    '卖': 70,
    '收c': 90,
    '出c': 90,
    '带价来': 80,
    '+': 10,
    '内测': 50,
    '<DOT>': 50,
    '开纪': 80,
    '杀戮': 80,
    '刀爆': 80,
    'NCP': 80,
    'Matrix': 50,
    '火神': 50,
    'AAC': 50,
    'AACv4': 50,
    'AACv5': 50,
    'HVH': 80,
    '代理': 50,
    '<dot>': 50
}

const measureAds = (str, has_image, emoji_cnt) => {
    let score = emoji_cnt > ad_max / 2 ? 0 : emoji_cnt;
    if (has_image) score += 50;
    score += containsGroup(str) * 60;
    score += containsIps(str) * 30;
    score += containDomains(str) * 50;
    score += Object.keys(blWords).reduce((p, c) => p + blWords[c] * (str.split(c).length - 1), 0);
    return score;
}

let inCase = [];
let ad_max = 100;

const names = {
    738677145: '公益1',
    332820900: '公益2',
    606179090: '公益3',
    749440456: '公益4'
}

const onMessage = async (client, event) => {
    try {
        if (event.sender.user_id == 2854196310 || event.sender.user_id == 1245760358 || event.sender.role != 'member') return;
        if (event.group_id != 700717575) {
            let text = '', image = 0, emoji = 0;
            event.message.forEach(i => {
                if (i.type == 'text') text += i.text;
                if (i.type == 'face' || i.type == 'sface' || i.type == 'bface') emoji++;
                if (i.type == 'image') image++;
            });
            let score = measureAds(text, image != 0, emoji);
            if (score > ad_max) {
                let group_id = event.group_id;
                await client.sendGroupMsg(700717575, `检测到用户${event.sender.user_id}在${names[group_id] == null ? group_id : names[group_id]}群发送疑似广告消息，指数为${score}，消息如下：`).catch(err => console.log(err));
                client.sendGroupMsg(700717575, event.message).catch(err => console.log(err));
            }
            return;
        }
        if (inCase.indexOf(event.sender.user_id) != -1) {
            inCase.splice(inCase.indexOf(event.sender.user_id), 1);
            let text = '', image = 0, emoji = 0;
            event.message.forEach(i => {
                if (i.type == 'text') text += i.text;
                if (i.type == 'xml') text += i.data;
                if (i.type == 'face' || i.type == 'sface' || i.type == 'bface') emoji++;
                if (i.type == 'image') image++;
            });
            let score = measureAds(text, image != 0, emoji);
            event.reply(`这条消息的广告指数为${score}`);
        } else if (event.message[0].type == 'text' && event.message[0].text == '/ad') {
            inCase.push(event.sender.user_id);
            event.reply('请发送你要测试的消息');
        }
    } catch (err) {
        console.log(err);
    }
}

const config = {
    id: 'adblock',//必选
    name: '广告过滤',//必选
    menu: '/ad 开启测试广告指数，分数越高越有可能是广告'//可选，如不定义则没有菜单项
};

module.exports = { config, onMessage };//onLoad可省略
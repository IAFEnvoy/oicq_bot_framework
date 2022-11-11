let currentGroup = -1;
let enderdragon = 3136820779;
let l = NaN, r = NaN;

const sleep = (duration) => new Promise(resolve => { setTimeout(resolve, duration); })

const onMessage = async (client, event) => {
    if (event.sender.user_id == enderdragon && currentGroup != -1) {
        let text = event.message[0].text;
        if (text.indexOf('小') != -1) {
            l = Math.floor((l + r) / 2) + 1;
            client.sendGroupMsg(event.group_id, `猜${Math.floor((l + r) / 2)}`);
        }
        if (text.indexOf('大') != -1) {
            r = Math.floor((l + r) / 2) - 1;
            client.sendGroupMsg(event.group_id, `猜${Math.floor((l + r) / 2)}`);
        }
        if (text.indexOf('猜中') != -1) {
            currentGroup = -1;
            client.sendGroupMsg(event.group_id, '菜！');
        }
        return;
    }
    let message = event.message[0].text;
    let s = message.split(' ');
    if (s[0] == '/guess' && s.length >= 3) {
        if (currentGroup != -1 && event.group_id != currentGroup)
            client.sendGroupMsg(event.group_id, `此插件已被占用，请稍后再试！`);
        let min = parseInt(s[1]), max = parseInt(s[2]);
        if (max - min <= 10) return;
        client.sendGroupMsg(event.group_id, `rdmset min ${min}`);
        await sleep(1000);
        client.sendGroupMsg(event.group_id, `rdmset max ${max}`);
        await sleep(1000);
        l = min; r = max; currentGroup = event.group_id;
        client.sendGroupMsg(event.group_id, '开始猜数');
        await sleep(1000);
        client.sendGroupMsg(event.group_id, `猜${Math.floor((l + r) / 2)}`);
    }
}

const config = {
    id: 'guess',
    name: '芜↓湖↑',
    menu: '/guess <min> <max>'
};

module.exports = { config, onMessage };
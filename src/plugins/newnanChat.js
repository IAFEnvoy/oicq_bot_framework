let repeatText = '';
let repeatCnt = -1;

const execute = (message, client, e) => {
    if (message == '牛腩萝莉是谁') {
        client.sendGroupMsg(e.group_id, getImage('./src/img/萝莉.jpg'));
    }
    if (message == '牛腩五大萝莉是谁') {
        client.sendGroupMsg(e.group_id, getImage('./src/img/五大萝莉.jpg'));
    }
    if (message == '牛腩九大萝莉是谁') {
        client.sendGroupMsg(e.group_id, getImage('./src/img/九大萝莉.jpg'));
    }
    if (message == '牛腩御姐是谁') {
        client.sendGroupMsg(e.group_id, 'Minecraft_Player');
    }
    if (message == '牛腩地铁怎么坐' || message == '牛腩城际怎么坐' || message == '牛腩轨交怎么坐' || message == '牛腩轨道交通怎么坐') {
        client.sendGroupMsg(e.group_id, getImage('./src/img/轨交.png'));
    }
    if (message == '迫害马星') {
        let r = Math.ceil(Math.random() * 4);
        client.sendGroupMsg(e.group_id, getImage(`./src/img/马星/${r}.jpg`));
    }
    if (message == '汤哈哈是谁') {
        client.sendGroupMsg(e.group_id, '涩涩蛋');
    }
    if (message == '问卷答完之后怎么做') {
        client.sendGroupMsg(e.group_id, '找任意管理，将100分截图给他');
    }
}

const config = {
    id: 'newnanchat',
    name: '牛腩专用自动回复',
    default_permission: false
};

module.exports = { config, execute };
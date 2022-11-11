const fs = require('fs');

let loginDataJson = {};

const loadLoginConfig = () => {
    if (fs.existsSync('./config/login.json'))
        loginDataJson = JSON.parse(fs.readFileSync('./config/login.json', 'utf8'));
}

const saveLoginConfig = () => {
    fs.writeFileSync('./config/login.json', JSON.stringify(loginDataJson));
}

const login = (user_id) => {
    let r = Math.ceil(Math.random() * 100);
    if (loginDataJson[user_id]?.coin == null) {
        loginDataJson[user_id] = {};
        loginDataJson[user_id].coin = 0;
    } else if (datesAreOnSameDay(loginDataJson[user_id].last, new Date().getTime()))
        return { "error": "你今天已经签到过了哦" };
    loginDataJson[user_id].coin += r;
    loginDataJson[user_id].last = new Date().getTime();
    return { "new": r, "total": loginDataJson[user_id].coin };
}

const datesAreOnSameDay = (f, s) => {
    const first = new Date(f), second = new Date(s);
    return first.getFullYear() == second.getFullYear() &&
        first.getMonth() == second.getMonth() &&
        first.getDate() == second.getDate();
}

const onMessage = (client, e) => {
    let message = e.message[0].text;
    if (message == '签到') {
        let ret = login(e.sender.user_id);
        if (ret.error == null){
            saveLoginConfig();
            client.sendGroupMsg(e.group_id, `签到完成，获得${ret.new}个硬币`);
        }
        else
            client.sendGroupMsg(e.group_id, ret.error);
    }
}

const onLoad = (config, client) => {
    loadLoginConfig();
}

const config = {
    id: 'login',
    name: '每日签到',
    menu: '签到 每日签到',
    default_permission: true
};

module.exports = { config, onMessage, onLoad };
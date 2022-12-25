const oicq = require('oicq');
const readline = require('readline');
const pluginloader = require('./pluginLoader');
const config = require('./config');

//初始化
config.load();
const c = config.getConfig();
const qq = c.qq;
const client = oicq.createClient(qq, { platform: 3 });
let ops = c.ops;

let pluginManager = new pluginloader.BotPluginManager();
pluginManager.load(c, client);

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// process.exit(0);

client.on("system.login.slider", (e) => {
    console.log("输入ticket：")
    process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
});

client.on('system.login.device', async (e) => {
    console.log('收到设备锁，已发送验证码到绑定的手机号');
    client.sendSmsCode();
    rl.question('请输入验证码：', (input) => {
        client.submitSmsCode(input);
        rl.close();
    });
});

client.on("system.login.qrcode", (e) => process.stdin.once("data", () => this.login()));//扫码后按回车登录

client.on('message.group', async (e) => {
    try {
        if (e.group.all_muted || e.group.mute_left > 0)
            return console.log('因为禁言已取消发送消息');
        let message = e.message[0].text;
        if (message == null) return;

        if (ops.find(op => op == e.sender.user_id) != null)
            pluginManager.runManagerEvent(client, e, c);

        if (message == '菜单')
            client.sendGroupMsg(e.group_id, pluginManager.getMenu(e.group_id));
        
        pluginManager.onMessage(client, e);
    } catch (err) {
        console.log(err);
    }
});

client.on('notice.group.increase', (e) => {
    // if (e.user_id != qq)
    //     client.sendGroupMsg(e.group_id, '是新人酱欸');
});

setInterval(() => pluginManager.onTick(client), 1000);

//使用MD5登录
client.login(c.passwd);
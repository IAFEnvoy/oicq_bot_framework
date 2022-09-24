const oicq = require('oicq');
const readline = require('readline');
const pluginloader = require('./pluginLoader');
const config = require('./config');

//初始化
config.load();
const c = config.getConfig();
let pluginManager = new pluginloader.BotPluginManager();
pluginManager.load(c);

const qq = c.qq;
const client = oicq.createClient(qq);
let ops = c.ops;

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// process.exit(0);

client.on("system.login.slider", function (e) {
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

client.on("system.login.qrcode", function (e) {
    //扫码后按回车登录
    process.stdin.once("data", () => {
        this.login()
    })
});

client.on('message.group', async (e) => {
    try {
        if (e.message.length > 1) return;
        let message = e.message[0].text;
        if (message == null) return;

        if (ops.find(op => op == e.sender.user_id) != undefined)
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

//使用MD5登录
client.login(c.passwd);
const oicq = require('oicq');
const pluginloader = require('./pluginLoader.js');
const config = require('./config');
const readline = require('readline');

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

console.log(pluginManager.getMenu());

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
    })
})

client.on("system.login.qrcode", function (e) {
    console.log('扫完二维码之后请按回车确认');
    process.stdin.once("data", () => {
        this.login()
    })
});

client.on('message.group', async (e) => {
    let message = e.message[0].text;
    if (message == null) return;

    try {
        if (ops.find(op => op == e.sender.user_id) != undefined)
            pluginManager.runManagerEvent(client, e);

        pluginManager.call(client, e);
    } catch (err) {
        console.log(err);
    }
})

client.on('notice.group.increase', (e) => {
    if (e.user_id != qq)
        client.sendGroupMsg(e.group_id, '是新人酱欸');
})

client.on('system.online', (e) => {
    // for (var i = 0; i < friendGroup.length; i++) 
    //     client.sendGroupMsg(friendGroup[i], `[main/INFO]VSCode已上线`);
})

//使用MD5登录
client.login(c.passwd);
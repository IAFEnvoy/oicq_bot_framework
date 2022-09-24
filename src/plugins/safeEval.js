const blWords = ['import', 'require', 'stop', 'rm', 'kill']
const safeEval = (cmd) => blWords.find(item => cmd.search(item) != -1) == undefined ? eval(cmd) : '检测到黑名单字符，无法执行';

const onMessage = (message, client, e) => {
    let ms = message.split(' ');
    if (ms[0] == 'run' && ms.length >= 2) {
        let text = "";
        try {
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }
            client.sendGroupMsg(e.group_id, safeEval(text).toString());
        } catch (err) {
            console.log(err);
            client.sendGroupMsg(e.group_id, `无法执行${text}`);
        }
    }
}

const config = {
    id: 'run',
    name: 'JavaScript简易运行',
    menu: 'run <cmd> 执行一段js代码',
    default_permission: false
};

module.exports = { config, onMessage };
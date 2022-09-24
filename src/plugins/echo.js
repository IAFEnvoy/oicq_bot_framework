const onMessage = (message, client, e) => {
    let ms = message.split(' ');
    if (ms[0] == '/echo' && ms.length >= 2) {
        try {
            let text = "";
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }
            client.sendGroupMsg(e.group_id, text);
        } catch (err) {
            console.log(err);
        }
    }
}

const config = {
    id: 'echo',
    name: '复读',
    menu: 'echo <内容> 复读内容',
    default_permission: false
};

module.exports = { config, onMessage };
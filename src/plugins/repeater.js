let repeatText = '';
let repeatCnt = -1;

const execute = (message, client, e) => {
    if (message == repeatText) {
        if (repeatCnt == 2) {
            client.sendGroupMsg(e.group_id, repeatText);
            repeatCnt = -1e5;
        } else repeatCnt++;
    } else {
        repeatText = message;
        repeatCnt = 1;
    }
}

const config = {
    id: 'repeater',
    name: '群复读机',
    default_permission: true
};

module.exports = { config, execute };
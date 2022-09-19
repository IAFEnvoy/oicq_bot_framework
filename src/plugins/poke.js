const execute = (message, client, e) => {
    let ms = message.split(' ');
    if (ms[0] == '戳' && ms.length >= 2) {
        try {
            client.pickGroup(e.group_id).pokeMember(ms[1]);
        } catch (err) {
            console.log(err);
        }
    }
}

const config = {
    id: 'poke',
    name: '戳一戳',
    menu: '戳 <qq号> 戳指定人',
    default_permission: true
};

module.exports = { config, execute };
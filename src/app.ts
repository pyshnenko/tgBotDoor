require('dotenv').config();
const { Telegraf } = require('telegraf');
const botToken = process.env.TGBOT;
const bot = new Telegraf(botToken);
const { session } = require('telegraf');
const { Extra, Markup } = require('telegraf');
const Gpio = require('pigpio').Gpio;
const os = require('os');
const fs = require("fs");
let ni = os.networkInterfaces();
const axios = require('axios');
import bash from './scripts/bash';
import { startKeyboard, startKeyboardAny, yORnKeyboard } from './funcs/keyboards';
import { userData, savedData } from './types/data';

const vers = '1.4.2';

const upDate = (new Date()).toLocaleString();

console.log('Hello world');

let door: boolean = false;

setTimeout(() => door = true, 10000);

let needReboot: boolean = false;
let needReboot2: boolean = false;
let needRestart: boolean = false;

const saveTime = function (time?: number) {
    console.log(time);
    let fileContent: string = fs.readFileSync("system.txt", "utf8");
    let writeString: string = '';
    writeString += needReboot ? '1\n' : String(time || Math.floor(Number(new Date())/1000)) + '\n';
    if (fileContent.indexOf('push') > 0) writeString += 'push\n';
    if (fileContent.indexOf('pull') > 0) writeString += 'pull\n';
    if ((needRestart)&&(fileContent.indexOf('restart') > 0)) writeString += 'restart\n';
    fs.writeFile("system.txt", writeString, function (error: any) {
        if (error) throw error;
        console.log('write done');
        if (needReboot2)
            process.exit(-1);
    });
}

let LEDdoorOp: any;
let LEDdoorCl: any;

try {
    LEDdoorOp = new Gpio(27, { mode: Gpio.OUTPUT });
    LEDdoorCl = new Gpio(22, { mode: Gpio.OUTPUT });
}
catch {
    console.log('GPIO ERROR');
    needReboot = true;
    needReboot2 = true;
    saveTime(1);
}

let serviceSett: savedData = {
    admins: [],
    notAdmins: [],
    reqUsers: [],
    timeDelay: 1000,
    usersData: []
};

const okLbl = '✅ ';
const nokLbl = '❌ ';

fs.access("admins.txt", function (error: any) {
    if (error) {
        console.log("Файл не найден");
        fs.open('admins.txt', 'w', (err: any) => {
            if (err) throw err;
            console.log('File created');
            fs.writeFile("admins.txt", JSON.stringify(serviceSett), function (error: any) {
                if (error) throw error;
                console.log('write done');
                let data = fs.readFileSync("admins.txt", "utf8");
                console.log(data);
            });
        });
    } else {
        console.log("Файл найден");
        let fileContent = fs.readFileSync("admins.txt", "utf8");
        if (JSON.parse(fileContent).total != 0) {
            serviceSett = JSON.parse(fileContent);
        }
    }
});

fs.access("system.txt", function (error: any) {
    if (error) {
        console.log("Файл не найден");
        fs.open('system.txt', 'w', (err: any) => {
            if (err) throw err;
            console.log('File created');
            saveTime();
        });
    } else {
        console.log("Файл найден");
        saveTime();
    }
    setInterval(saveTime, 3 * 60 * 1000);
});

const hist = [];

bot.use(session());

bot.telegram.setMyCommands([
    { command: '/start', description: 'Старт' }
])

bot.start((ctx: any) => {
    //console.log(askName(ctx.from.id));
    const name = askName(ctx.from.id);
    if ((name !== null) || (name === 'undefined')) {
        for (let i = 0; i<serviceSett.usersData.length; i++) {
            if (serviceSett.usersData[i].id === ctx.from.id) {
                serviceSett.usersData[i].name = ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь';
                saveData();
                break;
            }
        }
    }
    needRestart = false;
    if (serviceSett.admins.length === 0) {
        ctx.replyWithHTML('Кажется, у нас нет администратора. Назначим тебя?',
            Markup.inlineKeyboard([
                Markup.button.callback(okLbl + 'Да', `newAdmin:${ctx.from.id}`),
                Markup.button.callback(nokLbl + 'Нет', `start`)
            ]));
    }
    else if (serviceSett.admins.includes(ctx.from.id)) {
        startKeyboard(ctx, `Привет, ${ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь'}`, true);
    }
    else if (serviceSett.notAdmins.includes(ctx.from.id)) {
        startKeyboard(ctx, `Привет, ${ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь'}`, false);
    }
    else {
        ctx.replyWithHTML('Привет незнакомец. К сожалению, тебя нет в списке. Желаешь получить доступ?',
            Markup.inlineKeyboard([
                Markup.button.callback(okLbl + 'Да', `newUser::${ctx.from.id}`),
                Markup.button.callback(nokLbl + 'Нет', `goodBye`)
            ]))
    }
});

bot.on('callback_query', async (ctx: any) => {
    needRestart = false;
    ctx.answerCbQuery();
    ctx.deleteMessage();
    const command = ctx.callbackQuery.data.substring(0, 9);
    const id = Number(ctx.callbackQuery.data.substring(9));
    console.log(command);
    console.log(id);
    if (command === 'newAdmin:') {
        console.log(serviceSett);
        if (serviceSett.admins.includes(id)) {
            ctx.reply('Уже добавлен');
            if (serviceSett.reqUsers.includes(id)) serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
            saveData();
        }
        else {
            serviceSett.admins.push(id);
            if (id === ctx.from.id) serviceSett.usersData.push({
                id: ctx.from.id,
                name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                comment: ''
            })            
            if (serviceSett.reqUsers.includes(id)) serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
            saveData();
            for (let i = 0; i < serviceSett.admins.length; i++) {
                if (serviceSett.admins[i] !== id)
                    bot.telegram.sendMessage(serviceSett.admins[i], `Пользователь ${askName(id)} id: ${id} добавлен в группу "Администраторы"`);
            }
            if (ctx.from.id === id) startKeyboard(ctx, 'Добро пожаловать', true);
            else 
                bot.telegram.sendMessage(id, 'Вас добавили как администратора. Нажмите /start');
        }
    }
    else if (command === 'newAdmAsk') {
        ctx.reply(`Пользователю ${id} направлено приглашение`);
        yORnKeyboard(bot, id, 'Приветствую. Принять приглашение на подключение к воротам?', `addAdmAsk${ctx.from.id}`, 'start');
    }
    else if (command === 'addAdmAsk') {
        if (serviceSett.admins.includes(ctx.from.id)) ctx.reply('Уже добавлен');
        else {
            serviceSett.admins.push(ctx.from.id);
            serviceSett.usersData.push({
                id: ctx.from.id,
                name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                comment: ''
            })
            saveData();
            bot.telegram.sendMessage(id, `Пользователь ${askName(id)} id: ${ctx.from.id} добавлен в группу "Администраторы"`);
            if (ctx.from.id === id) startKeyboard(ctx, 'Добро пожаловать', true);
        }
    }
    else if (command === 'newUser::') {
        if (serviceSett.reqUsers.includes(id)) ctx.reply('Ожидайте решение администратора');
        else {
            await ctx.reply('Мы отправили запрос администраторам. Ожидайте');
            /*for (let i = 0; i < serviceSett.admins.length; i++) {
                await bot.telegram.sendMessage(serviceSett.admins[i], `Пользователь ${ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'Без имени'} id: ${ctx.from.id} просится к нам. Добавим?`,
                    Markup.inlineKeyboard([
                        Markup.button.callback('Сделать администратором', `newAdmin:${ctx.from.id}`),
                        Markup.button.callback('Добавить', `addUser::${ctx.from.id}`),
                        Markup.button.callback('Отказать', `notAddUs:${ctx.from.id}`)
                    ]))
            }*/
            serviceSett.reqUsers.push(ctx.from.id);
            serviceSett.usersData.push({
                id: ctx.from.id,
                name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                comment: ''
            })
            saveData();
        }
    }
    else if (command === 'newUsrAsk') {
        ctx.reply(`Пользователю ${id} направлено приглашение`);
        yORnKeyboard(bot, id, 'Приветствую. Принять приглашение на подключение к воротам?', `addUsrAsk${ctx.from.id}`, 'start');
    }
    else if (command === 'addAdmAsk') {
        if (serviceSett.admins.includes(ctx.from.id)) ctx.reply('Уже добавлен');
        else {
            serviceSett.admins.push(ctx.from.id);
            serviceSett.usersData.push({
                id: ctx.from.id,
                name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                comment: ''
            })
            saveData();
            bot.telegram.sendMessage(id, `Пользователь ${askName(id)} id: ${ctx.from.id} добавлен в группу "Администраторы"`);
            if (ctx.from.id === id) startKeyboard(ctx, 'Добро пожаловать', true);
        }
    }
    else if (command === 'addUsrAsk') {
        if (serviceSett.notAdmins.includes(ctx.from.id)) ctx.reply('Уже добавлен');
        else {
            serviceSett.notAdmins.push(ctx.from.id);
            serviceSett.usersData.push({
                id: ctx.from.id,
                name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                comment: ''
            })
            saveData();
            bot.telegram.sendMessage(id, `Пользователь ${askName(id)} id: ${ctx.from.id} добавлен в группу "Пользователи"`);
            if (ctx.from.id === id) startKeyboard(ctx, 'Добро пожаловать', true);
        }
    }
    else if (command === 'addUser::') {
        if (serviceSett.notAdmins.includes(id)) {
            ctx.reply('Уже добавлено');
        }
        else {
            for (let i = 0; i < serviceSett.admins.length; i++) { bot.telegram.sendMessage(serviceSett.admins[i], `Пользователь ${askName(id)} id: ${id} добавлен`); }
            if (!serviceSett.notAdmins.includes(id))
                serviceSett.notAdmins.push(id);
            if (serviceSett.reqUsers.includes(id))
                serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
            bot.telegram.sendMessage(id, 'Вас добавили как пользовтеля. Нажмите /start');
        }
        if (serviceSett.reqUsers.includes(id)) serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
        saveData();
    }
    else if (command === 'notAddUs:') {
        for (let i = 0; i < serviceSett.admins.length; i++) { bot.telegram.sendMessage(serviceSett.admins[i], `Пользователю ${askName(id)} id: ${id} отказано`); }
        if (serviceSett.reqUsers.includes(id))
            serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
        for (let i = 0; i < serviceSett.usersData.length; i++) {
            if (serviceSett.usersData[i].id === id) {
                serviceSett.usersData.splice(i, 1);
                break;
            }
        }
        saveData();
    }
    else if (command === 'simpleAdd') {
        if (id === 0) ctx.reply('Некорректный id');
        else {
            ctx.replyWithHTML('Добавляем ' + askName(id) + '?', Markup.inlineKeyboard([
                Markup.button.callback('Сделать администратором', `newAdmin:${id}`),
                Markup.button.callback('Добавить', `addUser::${id}`),
                Markup.button.callback('Отмена', `notAddUs:${id}`)
            ]))
        }
        ctx.session = {};
    }
    else if (command === 'simpleDel') {
        yORnKeyboard(bot, ctx.from.id, `Удаляем ${askName(id)}?`, `delete:::${id}`, 'start');
    }
    else if (command === 'delete:::') {
        if (serviceSett.admins.indexOf(id) >= 1) {
            serviceSett.admins.splice(serviceSett.admins.indexOf(id), 1);
            ctx.reply('Удалено из группы "Администраторы"');
        }
        if (serviceSett.notAdmins.includes(id)) {
            serviceSett.notAdmins.splice(serviceSett.admins.indexOf(id), 1);
            ctx.reply('Удалено из группы "Пользователи"');
        }
        for (let i = 1; i < serviceSett.usersData.length; i++) {
            if (serviceSett.usersData[i].id === id) {
                serviceSett.usersData.splice(i, 1);
                break;
            }
        }
        saveData();
        bot.telegram.sendMessage(id, 'Вас удалили', Markup.removeKeyboard(true));
    }
    else if (command === 'newWiFi') {
        ctx.reply('Введи название новой сети');
        ctx.session = { mode: 'wifiName' };
    }
    else if (command === 'addNewNet') {
        let wifiInfo = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=RU

network={
        ssid="Yotaw"
        psk="12345679"
        key_mgmt=WPA-PSK
}

`;
        wifiInfo += `\nnetwork={
        ssid="${ctx.session.name}"
        psk="${ctx.session.pass}"
}
`;
        fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", wifiInfo, function (error: any) {
            ctx.reply(error ? 'Неудача' : 'Готово')
            if (!error) { needReboot = true; saveTime(1) }
        });
        ctx.session = {};
    }
    else if (command === 'start') ctx.session = {};
});

bot.on('text', async (ctx: any) => {
    needRestart = false;
    console.log(ctx.message.text);
    console.log(ctx.from.id);
    let session = ctx.session;
    if ((serviceSett.admins.includes(ctx.from.id)) || (serviceSett.notAdmins.includes(ctx.from.id))) {
        if (serviceSett.admins.includes(ctx.from.id)) {
            console.log(session);
            if (ctx.message.text === 'Статус') {
                ni = os.networkInterfaces();
                let wifiInfo = fs.readFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", "utf8");
                let fullWifi: string = '';
                while (wifiInfo.indexOf(`ssid="`) > 1) {
                    wifiInfo = wifiInfo.substring(wifiInfo.indexOf(`ssid="`) + 6);
                    let wifiName: string = wifiInfo.slice(0, wifiInfo.indexOf(`"\n`));
                    if ((wifiName !== 'Yotaw') || (fullWifi.length > 1)) fullWifi += wifiName + "\n";
                }
                const ip = (await axios.get('https://ident.me')).data;
                ctx.replyWithHTML(okLbl + 'Ок\n' + 
                    ni.wlan0[0].address + '\n' + vers + 
                    '\n Сохраненная сеть:\n' + fullWifi + 
                    '\nupTime:\n' + upDate + '\nВнешний ip:\n' + ip, 
                    Markup.inlineKeyboard(
                    [Markup.button.callback('Изменить сеть', `newWiFi`)]));
            }
            else if ((typeof (session) === 'object') && (session.hasOwnProperty('mode'))) {
                if (session.mode === 'addId') {
                    let id = Number(ctx.message.text);
                    if (id) {
                        ctx.replyWithHTML('Добавляем ' + id + '?', Markup.inlineKeyboard([
                            Markup.button.callback('Сделать администратором', `newAdmAsk${id}`),
                            Markup.button.callback('Сделать пользователем', `newUsrAsk${id}`),
                            Markup.button.callback('Отмена', `start`)
                        ]))
                    }
                    else {
                        ctx.reply('Некорректный id');
                    }
                    session = {};
                }
                else if (session.mode === 'delay') {
                    let delay = Number(ctx.message.text);
                    if (delay) {
                        serviceSett.timeDelay = delay;
                        saveData();
                        ctx.reply(`Задано значение ${delay}мс`);
                    }
                    else ctx.reply('Данные некорректны. начни с начала');
                    session = {};
                }
                else if (session.mode === 'wifiPass') {
                    session = { ...session, mode: 'saveWifi', pass: ctx.message.text };
                    yORnKeyboard(bot, ctx.from.id, 'Добавим ' + session.name, 'addNewNet', 'start');
                }
                else if (session.mode === 'wifiName') {
                    session = { mode: 'wifiPass', name: ctx.message.text };
                    ctx.reply('Внимательно введи пароль');
                }
            }
            else if (ctx.message.text === 'Запросы') {
                let req: ReturnType<typeof Markup.button.callback>[] = [];
                if (serviceSett.reqUsers.length) await serviceSett.reqUsers.map((item: number) => {
                    req.push(Markup.button.callback(`${askName(item)}, ${item}`, `simpleAdd${item}`))
                })
                ctx.replyWithHTML(serviceSett.reqUsers.length === 0 ? 'Нет запросов' : 'Список запросов:', Markup.inlineKeyboard(req));
            }
            else if (ctx.message.text === 'Пользователи') {
                let req = '';
                if (serviceSett.admins.length > 1) {
                    req += 'Админы: \n';
                    serviceSett.admins.map((item: number, index:number) => {
                        if (index !== 0) req += askName(item) + ', ' + item + '\n';
                    })
                }
                if (serviceSett.notAdmins.length > 0) {
                    req += 'Пользователи: \n';
                    serviceSett.notAdmins.map((item: number) => {
                        req += askName(item) + ', ' + item + '\n';
                    })
                }
                ctx.reply(req===''?'Нет пользователей':req);
            }
            else if (ctx.message.text === 'Удалить пользователя') {
                let req = [];

                if (serviceSett.admins.length > 0) {
                    serviceSett.admins.map((item: number, index: number) => {
                        if ((index > 0) && (ctx.from.id !== item)) req.push(Markup.button.callback(`${askName(item)}, ${item}`, `simpleDel${item}`));
                    })
                }
                if (serviceSett.notAdmins.length > 0) {
                    serviceSett.notAdmins.map((item: number) => {
                        req.push(Markup.button.callback(`${askName(item)}, ${item}`, `simpleDel${item}`));
                    })
                }
                req.push(Markup.button.callback(`Отмена`, `start`));
                ctx.replyWithHTML(req.length > 2 ? 'Некого' : 'Выбери кого удалить:', Markup.inlineKeyboard(req));
            }
            else if (ctx.message.text === 'Добавить по id') {
                session = { mode: 'addId' };
                ctx.reply('Введи ID');
            }
            else if (ctx.message.text === 'Длительность нажатия') {
                session = { mode: 'delay' };
                ctx.reply('Введи значение в милисекундах');
            }
            else if (ctx.message.text === '~!git push') {
                bash.push(ctx);
                /*fs.appendFile("system.txt", 'push\n', function (error) {
                    if (error) throw error;
                    console.log('write done');
                });*/
                ctx.reply('push');
            }
            else if (ctx.message.text === '~!git pull') {
                bash.pull(ctx);
                /*fs.appendFile("system.txt", 'pull\n', function (error) {
                    if (error) throw error;
                    console.log('write done');
                });*/
                ctx.reply('pull');
            }
            else if (ctx.message.text === '~!restart') {
                bash.restart(ctx);
                ctx.reply('reboot');
            }
            else if (ctx.message.text === '~!reboot') {
                needReboot = true;
                saveTime(1);
                ctx.reply('reboot');
            }
            else if (ctx.message.text === '~ Параметры ~') {
                startKeyboardAny(ctx);
            }
            else if (ctx.message.text === '~ Назад ~') {
                startKeyboard(ctx, null, true);
            }
        }
        ctx.session = session;
        if (ctx.message.text === 'Открыть ворота') {
            if ((Number(new Date()) - Number(new Date(ctx.message.date * 1000))) < 20000) {
                ctx.reply(door ? 'Открываю' : 'Подождите немного');
                LEDdoorOp.digitalWrite(door);
                door = false;
                setTimeout(() => { door = true; LEDdoorOp.digitalWrite(false) }, serviceSett.timeDelay);
            }
            else ctx.reply('По какой-то причине сообщение задержалось. Прошу понять и простить');
        }
        if (ctx.message.text === 'Закрыть ворота') {
            if ((Number(new Date()) - Number(new Date(ctx.message.date * 1000))) < 20000) {
                ctx.reply(door ? 'Закрываю' : 'Подождите немного');
                LEDdoorCl.digitalWrite(door);
                door = false;
                setTimeout(() => { door = true; LEDdoorCl.digitalWrite(false) }, serviceSett.timeDelay);
            }
            else ctx.reply('По какой-то причине сообщение задержалось. Прошу понять и простить');
        }
    }
    else ctx.deleteMessage();
});

const askName = function (id: number) {
    for (let i = 0; i < serviceSett.usersData.length; i++) {
        if (serviceSett.usersData[i].id === id) {
            return serviceSett.usersData[i].name;
        }
    }
    return null
}

const saveData = async function () {
    fs.writeFile("admins.txt", JSON.stringify(serviceSett), function (error: any) {
        if (error) throw error;
        console.log('write done');
    })
}

bot.launch(console.log('bot start'));

bot.catch((err: any) => console.log(err));

bot.handleError((err: any) => {
    console.log('handler: ' + err.toString());
});

bot.on('error', (err: any) => console.log('on ' + err.toString()))

process.on('uncaughtException', (err, origin) => {
    console.log('ERROR');
    console.log(err);
    fs.appendFile("system.txt", 'restart\n', function (error: any) {
        if (error) throw error;
        console.log('write done');
        needRestart = true;
    });
});

process.once('SIGINT', () => {
    console.log('SIGINT');
    bot.stop('SIGINT');
    process.exit(-1);
});
process.once('SIGTERM', () => {
    console.log('SIGTERM');
    bot.stop('SIGTERM');
    process.exit(-1);
});

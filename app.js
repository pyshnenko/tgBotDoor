var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
require('dotenv').config();
var Telegraf = require('telegraf').Telegraf;
var botToken = process.env.TGBOT;
var bot = new Telegraf(botToken);
var session = require('telegraf').session;
var _a = require('telegraf'), Extra = _a.Extra, Markup = _a.Markup;
var Gpio = require('pigpio').Gpio;
var os = require('os');
var fs = require("fs");
var ni = os.networkInterfaces();
var vers = '1.2.2';
console.log('Hello world');
var door = false;
setTimeout(function () { return door = true; }, 10000);
var needReboot = false;
var needReboot2 = false;
var needRestart = false;
var saveTime = function (time) {
    console.log(time);
    var fileContent = fs.readFileSync("system.txt", "utf8");
    var writeString = '';
    writeString += needReboot ? '1\n' : String(time || Math.floor(Number(new Date()) / 1000)) + '\n';
    if (fileContent.indexOf('push') > 0)
        writeString += 'push\n';
    if (fileContent.indexOf('pull') > 0)
        writeString += 'pull\n';
    if ((needRestart) && (fileContent.indexOf('restart') > 0))
        writeString += 'restart\n';
    fs.writeFile("system.txt", writeString, function (error) {
        if (error)
            throw error;
        console.log('write done');
        if (needReboot2)
            process.exit(-1);
    });
};
var LEDdoor;
try {
    LEDdoor = new Gpio(27, { mode: Gpio.OUTPUT });
}
catch (_b) {
    console.log('GPIO ERROR');
    needReboot = true;
    needReboot2 = true;
    saveTime(1);
}
var serviceSett = {
    admins: [],
    notAdmins: [],
    reqUsers: [],
    timeDelay: 1000,
    usersData: []
};
var okLbl = '✅ ';
var nokLbl = '❌ ';
fs.access("admins.txt", function (error) {
    if (error) {
        console.log("Файл не найден");
        fs.open('admins.txt', 'w', function (err) {
            if (err)
                throw err;
            console.log('File created');
            fs.writeFile("admins.txt", JSON.stringify(serviceSett), function (error) {
                if (error)
                    throw error;
                console.log('write done');
                var data = fs.readFileSync("admins.txt", "utf8");
                console.log(data);
            });
        });
    }
    else {
        console.log("Файл найден");
        var fileContent = fs.readFileSync("admins.txt", "utf8");
        if (JSON.parse(fileContent).total != 0) {
            serviceSett = JSON.parse(fileContent);
        }
    }
});
fs.access("system.txt", function (error) {
    if (error) {
        console.log("Файл не найден");
        fs.open('system.txt', 'w', function (err) {
            if (err)
                throw err;
            console.log('File created');
            saveTime();
        });
    }
    else {
        console.log("Файл найден");
        saveTime();
    }
    setInterval(saveTime, 3 * 60 * 1000);
});
var hist = [];
bot.use(session());
bot.telegram.setMyCommands([
    { command: '/start', description: 'Старт' }
]);
bot.start(function (ctx) {
    //console.log(askName(ctx.from.id));
    var name = askName(ctx.from.id);
    if ((name !== null) || (name === 'undefined')) {
        for (var i = 0; i < serviceSett.usersData.length; i++) {
            if (serviceSett.usersData[i].id === ctx.from.id) {
                serviceSett.usersData[i].name = ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь';
                saveData();
                break;
            }
        }
    }
    needRestart = false;
    if (serviceSett.admins.length === 0) {
        ctx.replyWithHTML('Кажется, у нас нет администратора. Назначим тебя?', Markup.inlineKeyboard([
            Markup.button.callback(okLbl + 'Да', "newAdmin:".concat(ctx.from.id)),
            Markup.button.callback(nokLbl + 'Нет', "start")
        ]));
    }
    else if (serviceSett.admins.includes(ctx.from.id)) {
        startKeyboard(ctx, "\u041F\u0440\u0438\u0432\u0435\u0442, ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь'), true);
    }
    else if (serviceSett.notAdmins.includes(ctx.from.id)) {
        startKeyboard(ctx, "\u041F\u0440\u0438\u0432\u0435\u0442, ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь'), false);
    }
    else {
        ctx.replyWithHTML('Привет незнакомец. К сожалению, тебя нет в списке. Желаешь получить доступ?', Markup.inlineKeyboard([
            Markup.button.callback(okLbl + 'Да', "newUser::".concat(ctx.from.id)),
            Markup.button.callback(nokLbl + 'Нет', "goodBye")
        ]));
    }
});
bot.on('callback_query', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var command, id, i, i, i, i, i, i, wifiInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                needRestart = false;
                ctx.answerCbQuery();
                ctx.deleteMessage();
                command = ctx.callbackQuery.data.substring(0, 9);
                id = Number(ctx.callbackQuery.data.substring(9));
                console.log(command);
                console.log(id);
                if (!(command === 'newAdmin:')) return [3 /*break*/, 1];
                console.log(serviceSett);
                if (serviceSett.admins.includes(id)) {
                    ctx.reply('Уже добавлен');
                    if (serviceSett.reqUsers.includes(id))
                        serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
                    saveData();
                }
                else {
                    serviceSett.admins.push(id);
                    if (id === ctx.from.id)
                        serviceSett.usersData.push({
                            id: ctx.from.id,
                            name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                            comment: ''
                        });
                    if (serviceSett.reqUsers.includes(id))
                        serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
                    saveData();
                    for (i = 0; i < serviceSett.admins.length; i++) {
                        if (serviceSett.admins[i] !== id)
                            bot.telegram.sendMessage(serviceSett.admins[i], "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'Без имени', " id: ").concat(ctx.from.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \"\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B\""));
                    }
                    if (ctx.from.id === id)
                        startKeyboard(ctx, 'Добро пожаловать', true);
                    else
                        bot.telegram.sendMessage(id, 'Вас добавили как администратора. Нажмите /start');
                }
                return [3 /*break*/, 12];
            case 1:
                if (!(command === 'newAdmAsk')) return [3 /*break*/, 2];
                ctx.reply("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ".concat(id, " \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435"));
                yORnKeyboard(id, 'Приветствую. Принять приглашение на подключение к воротам?', "addAdmAsk".concat(ctx.from.id), 'start');
                return [3 /*break*/, 12];
            case 2:
                if (!(command === 'addAdmAsk')) return [3 /*break*/, 3];
                if (serviceSett.admins.includes(ctx.from.id))
                    ctx.reply('Уже добавлен');
                else {
                    serviceSett.admins.push(ctx.from.id);
                    serviceSett.usersData.push({
                        id: ctx.from.id,
                        name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                        comment: ''
                    });
                    saveData();
                    bot.telegram.sendMessage(id, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(askName(id), " id: ").concat(ctx.from.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \"\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B\""));
                    if (ctx.from.id === id)
                        startKeyboard(ctx, 'Добро пожаловать', true);
                }
                return [3 /*break*/, 12];
            case 3:
                if (!(command === 'newUser::')) return [3 /*break*/, 11];
                if (!serviceSett.reqUsers.includes(id)) return [3 /*break*/, 4];
                ctx.reply('Ожидайте решение администратора');
                return [3 /*break*/, 10];
            case 4: return [4 /*yield*/, ctx.reply('Мы отправили запрос администраторам. Ожидайте')];
            case 5:
                _a.sent();
                i = 0;
                _a.label = 6;
            case 6:
                if (!(i < serviceSett.admins.length)) return [3 /*break*/, 9];
                return [4 /*yield*/, bot.telegram.sendMessage(serviceSett.admins[i], "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'Без имени', " id: ").concat(ctx.from.id, " \u043F\u0440\u043E\u0441\u0438\u0442\u0441\u044F \u043A \u043D\u0430\u043C. \u0414\u043E\u0431\u0430\u0432\u0438\u043C?"), Markup.inlineKeyboard([
                        Markup.button.callback('Сделать администратором', "newAdmin:".concat(ctx.from.id)),
                        Markup.button.callback('Добавить', "addUser::".concat(ctx.from.id)),
                        Markup.button.callback('Отказать', "notAddUs:".concat(ctx.from.id))
                    ]))];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 6];
            case 9:
                serviceSett.reqUsers.push(ctx.from.id);
                serviceSett.usersData.push({
                    id: ctx.from.id,
                    name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                    comment: ''
                });
                saveData();
                _a.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                if (command === 'newUsrAsk') {
                    ctx.reply("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ".concat(id, " \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435"));
                    yORnKeyboard(id, 'Приветствую. Принять приглашение на подключение к воротам?', "addUsrAsk".concat(ctx.from.id), 'start');
                }
                else if (command === 'addAdmAsk') {
                    if (serviceSett.admins.includes(ctx.from.id))
                        ctx.reply('Уже добавлен');
                    else {
                        serviceSett.admins.push(ctx.from.id);
                        serviceSett.usersData.push({
                            id: ctx.from.id,
                            name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                            comment: ''
                        });
                        saveData();
                        bot.telegram.sendMessage(id, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(askName(id), " id: ").concat(ctx.from.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \"\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B\""));
                        if (ctx.from.id === id)
                            startKeyboard(ctx, 'Добро пожаловать', true);
                    }
                }
                else if (command === 'addUsrAsk') {
                    if (serviceSett.notAdmins.includes(ctx.from.id))
                        ctx.reply('Уже добавлен');
                    else {
                        serviceSett.notAdmins.push(ctx.from.id);
                        serviceSett.usersData.push({
                            id: ctx.from.id,
                            name: ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'пользователь',
                            comment: ''
                        });
                        saveData();
                        bot.telegram.sendMessage(id, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(askName(id), " id: ").concat(ctx.from.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438\""));
                        if (ctx.from.id === id)
                            startKeyboard(ctx, 'Добро пожаловать', true);
                    }
                }
                else if (command === 'addUser::') {
                    if (serviceSett.notAdmins.includes(id)) {
                        ctx.reply('Уже добавлено');
                    }
                    else {
                        for (i = 0; i < serviceSett.admins.length; i++) {
                            bot.telegram.sendMessage(serviceSett.admins[i], "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'Без имени', " id: ").concat(ctx.from.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D"));
                        }
                        if (!serviceSett.notAdmins.includes(id))
                            serviceSett.notAdmins.push(id);
                        if (serviceSett.reqUsers.includes(id))
                            serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
                        bot.telegram.sendMessage(id, 'Вас добавили как пользовтеля. Нажмите /start');
                    }
                    if (serviceSett.reqUsers.includes(id))
                        serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
                    saveData();
                }
                else if (command === 'notAddUs:') {
                    for (i = 0; i < serviceSett.admins.length; i++) {
                        bot.telegram.sendMessage(serviceSett.admins[i], "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ".concat(ctx.from.first_name || ctx.from.last_name || ctx.from.username || 'Без имени', " id: ").concat(ctx.from.id, " \u043E\u0442\u043A\u0430\u0437\u0430\u043D\u043E"));
                    }
                    if (serviceSett.reqUsers.includes(id))
                        serviceSett.reqUsers.splice(serviceSett.reqUsers.indexOf(id), 1);
                    for (i = 0; i < serviceSett.usersData.length; i++) {
                        if (serviceSett.usersData[i].id === id) {
                            serviceSett.usersData.splice(i, 1);
                            break;
                        }
                    }
                    saveData();
                }
                else if (command === 'simpleAdd') {
                    if (id === 0)
                        ctx.reply('Некорректный id');
                    else {
                        ctx.replyWithHTML('Добавляем ' + askName(id) + '?', Markup.inlineKeyboard([
                            Markup.button.callback('Сделать администратором', "newAdmin:".concat(id)),
                            Markup.button.callback('Добавить', "addUser::".concat(id)),
                            Markup.button.callback('Отмена', "notAddUs:".concat(id))
                        ]));
                    }
                    ctx.session = {};
                }
                else if (command === 'simpleDel') {
                    yORnKeyboard(ctx.from.id, "\u0423\u0434\u0430\u043B\u044F\u0435\u043C ".concat(askName(id), "?"), "delete:::".concat(id), 'start');
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
                    for (i = 1; i < serviceSett.usersData.length; i++) {
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
                    wifiInfo = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\nupdate_config=1\ncountry=RU\n\nnetwork={\n        ssid=\"Yotaw\"\n        psk=\"12345679\"\n        key_mgmt=WPA-PSK\n}\n\n";
                    wifiInfo += "\nnetwork={\n        ssid=\"".concat(ctx.session.name, "\"\n        psk=\"").concat(ctx.session.pass, "\"\n}\n");
                    fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", wifiInfo, function (error) {
                        ctx.reply(error ? 'Неудача' : 'Готово');
                        if (!error) {
                            needReboot = true;
                            saveTime(1);
                        }
                    });
                    ctx.session = {};
                }
                else if (command === 'start')
                    ctx.session = {};
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); });
bot.on('text', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var session, wifiInfo, fullWifi, wifiName, id, delay, req_1, req_2, req_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                needRestart = false;
                console.log(ctx.message.text);
                console.log(ctx.from.id);
                session = ctx.session;
                if (!((serviceSett.admins.includes(ctx.from.id)) || (serviceSett.notAdmins.includes(ctx.from.id)))) return [3 /*break*/, 7];
                if (!serviceSett.admins.includes(ctx.from.id)) return [3 /*break*/, 6];
                console.log(session);
                if (!(ctx.message.text === 'Статус системы')) return [3 /*break*/, 1];
                ni = os.networkInterfaces();
                wifiInfo = fs.readFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", "utf8");
                fullWifi = '';
                while (wifiInfo.indexOf("ssid=\"") > 1) {
                    wifiInfo = wifiInfo.substring(wifiInfo.indexOf("ssid=\"") + 6);
                    wifiName = wifiInfo.slice(0, wifiInfo.indexOf("\"\n"));
                    if ((wifiName !== 'Yotaw') || (fullWifi.length > 1))
                        fullWifi += wifiName + "\n";
                }
                ctx.replyWithHTML(okLbl + 'Ок\n' + ni.wlan0[0].address + '\n' + vers + '\n Сохраненная сеть:\n' + fullWifi, Markup.inlineKeyboard([Markup.button.callback('Изменить сеть', "newWiFi")]));
                return [3 /*break*/, 6];
            case 1:
                if (!((typeof (session) === 'object') && (session.hasOwnProperty('mode')))) return [3 /*break*/, 2];
                if (session.mode === 'addId') {
                    id = Number(ctx.message.text);
                    if (id) {
                        ctx.replyWithHTML('Добавляем ' + id + '?', Markup.inlineKeyboard([
                            Markup.button.callback('Сделать администратором', "newAdmAsk".concat(id)),
                            Markup.button.callback('Сделать пользователем', "newUsrAsk".concat(id)),
                            Markup.button.callback('Отмена', "start")
                        ]));
                    }
                    else {
                        ctx.reply('Некорректный id');
                    }
                    session = {};
                }
                else if (session.mode === 'delay') {
                    delay = Number(ctx.message.text);
                    if (delay) {
                        serviceSett.timeDelay = delay;
                        saveData();
                        ctx.reply("\u0417\u0430\u0434\u0430\u043D\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 ".concat(delay, "\u043C\u0441"));
                    }
                    else
                        ctx.reply('Данные некорректны. начни с начала');
                    session = {};
                }
                else if (session.mode === 'wifiPass') {
                    session = __assign(__assign({}, session), { mode: 'saveWifi', pass: ctx.message.text });
                    yORnKeyboard(ctx.from.id, 'Добавим ' + session.name, 'addNewNet', 'start');
                }
                else if (session.mode === 'wifiName') {
                    session = { mode: 'wifiPass', name: ctx.message.text };
                    ctx.reply('Внимательно введи пароль');
                }
                return [3 /*break*/, 6];
            case 2:
                if (!(ctx.message.text === 'Запросы')) return [3 /*break*/, 5];
                req_1 = [];
                if (!serviceSett.reqUsers.length) return [3 /*break*/, 4];
                return [4 /*yield*/, serviceSett.reqUsers.map(function (item) {
                        req_1.push(Markup.button.callback("".concat(askName(item), ", ").concat(item), "simpleAdd".concat(item)));
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                ctx.replyWithHTML(serviceSett.reqUsers.length === 0 ? 'Нет запросов' : 'Список запросов:', Markup.inlineKeyboard(req_1));
                return [3 /*break*/, 6];
            case 5:
                if (ctx.message.text === 'Пользователи') {
                    req_2 = '';
                    if (serviceSett.admins.length > 1) {
                        req_2 += 'Админы: \n';
                        serviceSett.admins.map(function (item, index) {
                            if (index !== 0)
                                req_2 += askName(item) + ', ' + item + '\n';
                        });
                    }
                    if (serviceSett.notAdmins.length > 0) {
                        req_2 += 'Пользователи: \n';
                        serviceSett.notAdmins.map(function (item) {
                            req_2 += askName(item) + ', ' + item + '\n';
                        });
                    }
                    ctx.reply(req_2 === '' ? 'Нет пользователей' : req_2);
                }
                else if (ctx.message.text === 'Удалить пользователя') {
                    req_3 = [];
                    if (serviceSett.admins.length > 0) {
                        serviceSett.admins.map(function (item, index) {
                            if ((index > 0) && (ctx.from.id !== item))
                                req_3.push(Markup.button.callback("".concat(askName(item), ", ").concat(item), "simpleDel".concat(item)));
                        });
                    }
                    if (serviceSett.notAdmins.length > 0) {
                        serviceSett.notAdmins.map(function (item) {
                            req_3.push(Markup.button.callback("".concat(askName(item), ", ").concat(item), "simpleDel".concat(item)));
                        });
                    }
                    req_3.push(Markup.button.callback("\u041E\u0442\u043C\u0435\u043D\u0430", "start"));
                    ctx.replyWithHTML(req_3.length > 2 ? 'Некого' : 'Выбери кого удалить:', Markup.inlineKeyboard(req_3));
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
                    fs.appendFile("system.txt", 'push\n', function (error) {
                        if (error)
                            throw error;
                        console.log('write done');
                    });
                    ctx.reply('push');
                }
                else if (ctx.message.text === '~!git pull') {
                    fs.appendFile("system.txt", 'pull\n', function (error) {
                        if (error)
                            throw error;
                        console.log('write done');
                    });
                    ctx.reply('pull');
                }
                else if (ctx.message.text === '~!reboot') {
                    needReboot = true;
                    saveTime(1);
                    ctx.reply('reboot');
                }
                _a.label = 6;
            case 6:
                ctx.session = session;
                if (ctx.message.text === 'Открыть шлагбаум') {
                    if ((Number(new Date()) - Number(new Date(ctx.message.date * 1000))) < 20000) {
                        ctx.reply(door ? 'Открываю' : 'Подождите немного');
                        LEDdoor.digitalWrite(door);
                        door = false;
                        setTimeout(function () { door = true; LEDdoor.digitalWrite(false); }, serviceSett.timeDelay);
                    }
                    else
                        ctx.reply('По какой-то причине сообщение задержалось. Прошу понять и простить');
                }
                return [3 /*break*/, 8];
            case 7:
                ctx.deleteMessage();
                _a.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); });
var askName = function (id) {
    for (var i = 0; i < serviceSett.usersData.length; i++) {
        if (serviceSett.usersData[i].id === id) {
            return serviceSett.usersData[i].name;
        }
    }
    return null;
};
var saveData = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs.writeFile("admins.txt", JSON.stringify(serviceSett), function (error) {
                if (error)
                    throw error;
                console.log('write done');
            });
            return [2 /*return*/];
        });
    });
};
var yORnKeyboard = function (id, text, okCallb, nOkCallb) {
    bot.telegram.sendMessage(id, text || 'Подтверждаете?', Markup.inlineKeyboard([
        Markup.button.callback(okLbl + 'Да', okCallb || 'Yes'),
        Markup.button.callback(nokLbl + 'Нет', nOkCallb || 'Cancel')
    ]));
};
var startKeyboard = function (ctx, text, admin) {
    return __awaiter(this, void 0, void 0, function () {
        var admKeyboard, notAdminKeyboard;
        return __generator(this, function (_a) {
            console.log(admin);
            admKeyboard = Markup.keyboard([
                ['Запросы', 'Пользователи'],
                ['Добавить по id', 'Удалить пользователя'],
                ['Статус системы', 'Длительность нажатия'],
                ['Открыть шлагбаум']
            ]);
            notAdminKeyboard = Markup.keyboard([['Открыть шлагбаум']]);
            ctx.replyWithHTML(text || 'Вот кнопка для шлагбаума\n', admin ? admKeyboard : notAdminKeyboard);
            return [2 /*return*/];
        });
    });
};
bot.launch(console.log('bot start'));
bot.catch(function (err) { return console.log(err); });
bot.handleError(function (err) {
    console.log('handler: ' + err.toString());
});
bot.on('error', function (err) { return console.log('on ' + err.toString()); });
process.on('uncaughtException', function (err, origin) {
    console.log('ERROR');
    console.log(err);
    fs.appendFile("system.txt", 'restart\n', function (error) {
        if (error)
            throw error;
        console.log('write done');
        needRestart = true;
    });
});
process.once('SIGINT', function () {
    console.log('SIGINT');
    bot.stop('SIGINT');
    process.exit(-1);
});
process.once('SIGTERM', function () {
    console.log('SIGTERM');
    bot.stop('SIGTERM');
    process.exit(-1);
});

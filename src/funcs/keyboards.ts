const { Extra, Markup } = require('telegraf');

const okLbl = '✅ ';
const nokLbl = '❌ ';

export const startKeyboard = async function (ctx: any, text: string|null, admin: boolean) {
    console.log(admin);
    const admKeyboard = Markup.keyboard([
        /*['Запросы', 'Пользователи', 'Статус'],
        ['Добавить по id', 'Удалить пользователя'],
        ['Открыть ворота'],
        ['Закрыть ворота'],*/
        ['Открыть ворота', 'Закрыть ворота'],
        ['~ Параметры ~']
    ]);
    const notAdminKeyboard = Markup.keyboard([['Открыть ворота'],
    ['Закрыть ворота']]);
    ctx.replyWithHTML(
        text || 'Вот кнопка для ворот\n',
        admin ? admKeyboard : notAdminKeyboard)
}
export const startKeyboardAny = async function (ctx: any) {
    const admKeyboard = Markup.keyboard([
        ['Запросы', 'Пользователи', 'Статус'],
        ['Добавить по id', 'Удалить пользователя'],
        ['~ Назад ~']
    ]);
    ctx.replyWithHTML(
        'Параметры\n',admKeyboard)
}

export const yORnKeyboard = function (bot: any, id: number, text: string, okCallb?:string, nOkCallb?:string) {
    bot.telegram.sendMessage(id, text || 'Подтверждаете?', Markup.inlineKeyboard([
        Markup.button.callback(okLbl + 'Да', okCallb || 'Yes'),
        Markup.button.callback(nokLbl + 'Нет', nOkCallb || 'Cancel')
    ]))
}
import { exec } from "child_process";
console.log(__dirname)

interface Bash {
    pull: (ctx: any)=>void;
    push: (ctx: any)=>void;
    restart: (ctx: any)=>void;
}

const pull = (ctx: any) => {
    exec(`bash ${__dirname}/pull.sh`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            ctx.reply(error.message)
            ctx.reply('error')
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            ctx.reply(stderr)
            ctx.reply('error')
            console.log(`stderr: ${stderr}`);
            return;
        }
        ctx.reply(stdout)
        console.log(`stdout: ${stdout}`);
    });
}

const push = (ctx: any) => {
    exec(`bash ${__dirname}/push.sh`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            ctx.reply(error.message)
            ctx.reply('error')
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            ctx.reply(stderr)
            ctx.reply('error')
            console.log(`stderr: ${stderr}`);
            return;
        }
        ctx.reply(stdout)
        console.log(`stdout: ${stdout}`);
    });
}

const restart = (ctx: any) => {
    exec(`systemctl restart myAvtostart`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            ctx.reply(error.message)
            ctx.reply('error')
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            ctx.reply(stderr)
            ctx.reply('error')
            console.log(`stderr: ${stderr}`);
            return;
        }
        ctx.reply(stdout)
        console.log(`stdout: ${stdout}`);
    });
}

const bash: Bash = {
    pull,
    push,
    restart
}

export default bash;


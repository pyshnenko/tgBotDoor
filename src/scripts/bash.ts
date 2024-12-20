import { exec } from "child_process";
console.log(__dirname)

interface Bash {
    pull: (ctx: any)=>void;
    push: (ctx: any)=>void;
    restart: (ctx: any)=>void;
}

const pull = (ctx: any) => {
    exec(`git pull`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        ctx.reply(stdout)
        console.log(`stdout: ${stdout}`);
    });
}

const push = (ctx: any) => {
    exec(`git add .;git commit -m "$(date)";git push origin main`, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
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
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
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


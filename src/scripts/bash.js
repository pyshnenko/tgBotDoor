"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
console.log(__dirname);
var pull = function (ctx) {
    (0, child_process_1.exec)("git pull", function (error, stdout, stderr) {
        if (error) {
            console.log("error: ".concat(error.message));
            return;
        }
        if (stderr) {
            console.log("stderr: ".concat(stderr));
            return;
        }
        ctx.reply(stdout);
        console.log("stdout: ".concat(stdout));
    });
};
var push = function (ctx) {
    (0, child_process_1.exec)("git add .;git commit -m \"$(date)\";git push origin main", function (error, stdout, stderr) {
        if (error) {
            console.log("error: ".concat(error.message));
            return;
        }
        if (stderr) {
            console.log("stderr: ".concat(stderr));
            return;
        }
        ctx.reply(stdout);
        console.log("stdout: ".concat(stdout));
    });
};
var restart = function (ctx) {
    (0, child_process_1.exec)("systemctl restart myAvtostart", function (error, stdout, stderr) {
        if (error) {
            console.log("error: ".concat(error.message));
            return;
        }
        if (stderr) {
            console.log("stderr: ".concat(stderr));
            return;
        }
        ctx.reply(stdout);
        console.log("stdout: ".concat(stdout));
    });
};
var bash = {
    pull: pull,
    push: push,
    restart: restart
};
exports.default = bash;

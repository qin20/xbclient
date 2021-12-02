const root = process.cwd();
const debug = require('debug')('service:exec');
const util = require('util');

function formatCommand(command) {
    const [cmd, ...args] = command.trim().split(/\s\s*/);
    return [cmd, args];
}

function exec(command, description, options={}) {
    return new Promise((resolve, reject) => {
        const [cmd, args] = formatCommand(command);

        debug(`[${description}]开始...`);
        debug(`${cmd} ${args.join(' ')}`);

        const cp = require('child_process').spawn(cmd, args, {
            cwd: root,
            stdio: 'inherit',
            shell: true,
            ...options,
        });

        cp.on('error', (error) => {
            debug(`[${description}]失败: ${util.inspect(error.stack)}`);
            reject(new Error(`${description}失败`));
        });

        cp.on('exit', (exitCode) => {
            if (exitCode) {
                const error = `[${description}]失败: failed with exit code ${exitCode}`;
                debug(error);
                reject(new Error(`${description}失败`));
            } else {
                debug(`[${description}]成功！`);
                resolve();
            }
        });
    });
}

function execGetOutput(command, description, callback) {
    return new Promise((resolve, reject) => {
        const [cmd, args] = formatCommand(command);

        debug(`[${description}]开始...`);
        debug(`${cmd} ${args.join(' ')}`);

        const cp = require('child_process').spawn(cmd, args, {
            cwd: root,
            // stdio: [process.stdin, "pipe", process.stderr],
            shell: true,
        });

        const buffers = [];
        cp.stdout.on('data', (data) => {
            buffers.push(data);
        });

        cp.stderr.on('data', (data) => {
            callback && callback(new Buffer(data).toString('utf-8').trim());
        });

        cp.on('error', (e) => {
            const error = `[${description}]失败 : ${util.inspect(e.stack)}`;
            debug(error);
            reject(new Error(`${description}失败`));
        });

        cp.on('exit', (exitCode) => {
            if (exitCode) {
                const error = `[${description}]失败 : failed with exit code ${exitCode}`;
                debug(error);
                reject(new Error(`${description}失败`));
            } else {
                debug(`[${description}]成功！`);
                resolve(Buffer.concat(buffers).toString('utf-8').trim());
            }
        });
    });
}

module.exports = {
    exec,
    execGetOutput,
};

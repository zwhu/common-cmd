const tty = require('tty')

const stdin = process.stdin
const stdout = process.stdout

const exec = require('child_process').spawn

const fs = require('fs')

require('keypress')(stdin)

stdin.on('keypress', function (ch, key) {

    switch (key.name) {
        case 'k':
        case 'up':
            up()
            break;
        case 'j':
        case 'down':
            down()
            break;
        case 'return':
            stdout.write('\033[?25h')
            stdout.write('\033[u')
            stdout.write('\033[J')
            execCmd()
            break;
        case 'c':
            if (key.ctrl) {
                stdout.write('\033[?25h')
                stdout.write('\033[u')
                stdin.pause()
            }
            break;
    }
})

// [{desc: 'cd 到 work 目录', cmd: 'cd ~/Work'}, {desc: 'pwd 路径', cmd: 'pwd'}]

let index = 0,
    commands

function cmd(cmds = []) {
    commands = cmds

    if (cmds.length === 0) throw new Error('pls input right value')

    stdout.write('\033[s')
    stdout.write('\033[?25l')

    draw(commands)

    stdin.setRawMode(true)
    stdin.resume()
}

const marker = '\033[36m› \033[0m'

function draw(cmds) {
    stdout.write('\033[u')
    stdout.write(cmds.map((cmd, i) => ((i === index ? marker : '  ') + cmd.desc + '\n'))
        .join(''))

    stdout.write('\n')
}

function up() {
    index = index || commands.length
    index--
    draw(commands)
}

function down() {
    index++
    index = index % commands.length
    draw(commands)
}

function execCmd() {
    let result = exec(commands[index].cmd, [], {
        shell: true,
        stdio: "inherit"
    })

    result.on('exit', function (code) {
        stdin.pause()
        process.exit()
    });
}

process.on('exit', (reason, p) => {
    stdin.pause()
})

process.on('unhandledRejection', (reason, p) => {
    unhandledRejections.set(p, reason)
    process.exit()
})
process.on('rejectionHandled', (p) => {
    unhandledRejections.delete(p)
    process.exit()
})


cmd([{
    desc: 'ls',
    cmd: 'ls -G'
}, {
    desc: 'pwd 路径',
    cmd: 'tnpm install @ali/oly-ckeditor'
}, {
    desc: 'say hello',
    cmd: 'echo "hello"'
}, {
    desc: 'say world',
    cmd: 'echo "world"'
}])
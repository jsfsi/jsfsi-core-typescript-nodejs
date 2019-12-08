import * as childProcess from 'child_process'

export const executeShell = async (command: string) => {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (error, stdout, stderr) => {
            error ? reject({ error, stderr }) : resolve(stdout)
        })
    })
}

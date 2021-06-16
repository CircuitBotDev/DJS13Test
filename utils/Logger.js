const format = require('dateformat');
const chalk = require('chalk');

const timestamp = () => format(new Date, 'yyyy-mm-dd HH:MM:ss');
const parse = (t) => typeof t !== "string" ? `\n${require("util").inspect(t)}` : t;

module.exports = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgWhite('[INFO]') + " : " + chalk.hex("#03a1fc")(parse(text)));
};

module.exports.info = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgWhite('[INFO]') + " : " + chalk.hex("#03a1fc")(parse(text)));
}
module.exports.success = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgHex("#00b527")('[SUCCESS]') + " : " + chalk.hex("#00ff6e")(parse(text)));
}
module.exports.warn = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgHex("#eeff00")('[WARNING]') + " : " + chalk.hex("#eeff00")(parse(text)));
}
module.exports.error = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgHex("#ff0000")('[ERROR]') + " : " + chalk.hex("#ff0000")(parse(text)));
}
module.exports.debug = (text, str = "Server") => {
    console.log(chalk.cyan(timestamp() + " " + str) + " " + chalk.black.bgHex("#eeff00")('[DEBUG]') + " : " + chalk.white(parse(text)));
}

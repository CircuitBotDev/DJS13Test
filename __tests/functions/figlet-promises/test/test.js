const figlet = require('../index.js');
const Figlet = new figlet();


let font = 'gothic';

(async () => {
    await Figlet.loadFonts();
    if(!Figlet.fonts.has(font)) return;
    let txt = await Figlet.write("test successful!",font);
    console.log(txt);

    //console.log(Array.from(Figlet.fonts.keys()).join()); // For a list of all available fonts!
})();
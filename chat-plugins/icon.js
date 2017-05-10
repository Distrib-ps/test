/*
* Creditos: MasterFloat (Creador), Kevinxzllz (Adaptacion a Openshift y Traduccion)
*/

var fs = require('fs');
var selectors;

function writeIconCSS() {
   fs.appendFile( DATA_DIR + 'custom.css', selectors);
}

exports.commands = {
    seticon: function (target, room, user) {
        if (!this.can('ban')) return this.errorReply("Accès refusé.");

        var args = target.split(',');if (args.length < 3) return this.parse('/help seticon');
        var username = toId(args.shift());
        var image = 'background: rgba(244, 244, 244, 0.8) url("' + args.shift().trim() + '") right no-repeat;';
        selectors = '#' + toId(args.shift()) + '-userlist-user-' + username;
        args.forEach(function (room) {
            selectors += ', #' + toId(room) + '-userlist-user-' + username;
        });
        selectors += '{' + '' + image +  '}';

        this.privateModCommand("(" + user.name + " vous a mis une icône " + username + ")");
        writeIconCSS();
    },
    seticonhelp: ["/seticon [user, [img], [room 1], [room 2], etc. - Rappelez-vous que vous devez fournir une image de 32x32."]
};

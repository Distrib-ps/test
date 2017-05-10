var fs = require('fs');
var avatarsDir = DATA_DIR + "avatars/";

function reloadCustomAvatars() {
	var path = require('path');
	var newCustomAvatars = {};
	if (!Config.customavatars) Config.customavatars = {};
	fs.readdirSync(avatarsDir).forEach(function (file) {
		var ext = path.extname(file);
		if (ext !== '.png' && ext !== '.gif')
			return;

		var user = toId(path.basename(file, ext));
		newCustomAvatars[user] = file;
		if (Config.customavatars[user]) delete Config.customavatars[user];
	});

	// Make sure the manually entered avatars exist
	for (var a in Config.customavatars)
		if (typeof Config.customavatars[a] === 'number')
			newCustomAvatars[a] = Config.customavatars[a];
		else
			fs.exists(avatarsDir + Config.customavatars[a], function (user, file, isExists) {
				if (isExists)
					Config.customavatars[user] = file;
			}.bind(null, a, Config.customavatars[a]));

	Config.customavatars = newCustomAvatars;
}
reloadCustomAvatars();

if (Config.watchConfig) {
	fs.watchFile('./config/config.js', function (curr, prev) {
		if (curr.mtime <= prev.mtime) return;
		reloadCustomAvatars();
	});
}

const script = function () {
/*
	FILENAME=`mktemp`
	function cleanup {
		rm -f $FILENAME
	}
	trap cleanup EXIT
	set -xe
	timeout 10 wget "$1" -nv -O $FILENAME
	FRAMES=`identify $FILENAME | wc -l`
	if [ $FRAMES -gt 1 ]; then
		EXT=".gif"
	else
		EXT=".png"
	fi
	timeout 30 convert $FILENAME -layers TrimBounds -coalesce -adaptive-resize 80x80\> -background transparent -gravity center -extent 80x80 "$2$EXT"
*/
}.toString().match(/[^]*\/\*([^]*)\*\//)[1];

var pendingAdds = {};

exports.commands = {
	customavatars: 'customavatar',
	customavatar: function (target) {
		var parts = target.split(',');
		var cmd = parts[0].trim().toLowerCase();

		if (cmd in {'':1, show:1, view:1, display:1}) {
			var message = "";
			for (var a in Config.customavatars)
				message += "<strong>" + Tools.escapeHTML(a) + ":</strong> " + Tools.escapeHTML(Config.customavatars[a]) + "<br />";
			return this.sendReplyBox(message);
		}

		if (!this.can('customavatar')) return false;

		switch (cmd) {
			case 'set':
				var userid = toId(parts[1]);
				var user = Users.getExact(userid);
				var avatar = parts.slice(2).join(',').trim();

				if (!userid) return this.sendReply("Vous n'avez pas spécifié un utilisateur.");
				if (Config.customavatars[userid]) return this.sendReply(userid + " Vous avez déjà un avatar personnalisé.");

				var hash = require('crypto').createHash('sha512').update(userid + '\u0000' + avatar).digest('hex').slice(0, 8);
				pendingAdds[hash] = {userid: userid, avatar: avatar};
				parts[1] = hash;

				if (!user) {
					this.sendReply("Attention !: " + userid + " n'est pas en ligne.");
					this.sendReply("Si vous souhaitez continuer, utilisez: /customavatar forceset, " + hash);
					return;
				}

				/* falls through */
			case 'forceset':
				var hash = parts[1].trim();
				if (!pendingAdds[hash]) return this.sendReply("Hash invalide");

				var userid = pendingAdds[hash].userid;
				var avatar = pendingAdds[hash].avatar;
				delete pendingAdds[hash];

				require('child_process').execFile('bash', ['-c', script, '-', avatar, avatarsDir + userid], function (e, out, err) {
					if (e) {
						this.sendReply(userid + "'s L'avatar personnalisé n'a pas pu être défini. Sortie de script:");
						(out + err).split('\n').forEach(this.sendReply.bind(this));
						return;
					}

					reloadCustomAvatars();

					var user = Users.getExact(userid);
					if (user) user.avatar = Config.customavatars[userid];

					this.sendReply(userid + "'s Un avatar personnalisé a été défini.");
				}.bind(this));
				break;

			case 'delete':
				var userid = toId(parts[1]);
				if (!Config.customavatars[userid]) return this.sendReply(userid + " N'a pas d'avatar personnalisé.");

				if (Config.customavatars[userid].toString().split('.').slice(0, -1).join('.') !== userid)
					return this.sendReply(userid + "'s custom avatar (" + Config.customavatars[userid] + ")Ne peut pas être supprimé avec ce script.");

				var user = Users.getExact(userid);
				if (user) user.avatar = 1;

				fs.unlink(avatarsDir + Config.customavatars[userid], function (e) {
					if (e) return this.sendReply(userid + "'s custom avatar (" + Config.customavatars[userid] + ") N'a pas pu être supprimé: " + e.toString());

					delete Config.customavatars[userid];
					this.sendReply(userid + "'s avatar personnalisé supprimé avec succès");
				}.bind(this));
				break;

			default:
				return this.sendReply("Commande non valide. Les commandes valides sont `/customavatar set, user, avatar` and `/customavatar delete, user`.");
		}
	}
};

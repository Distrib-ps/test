
exports.commands = {
	/*stafflist: 'authlist',
	authlist: function (target, room, user, connection) {
		var rankLists = {};
		for (var u in Users.usergroups) {
			var rank = Users.usergroups[u][0];
			var name = Users.usergroups[u].slice(1);
			if (!rankLists[rank]) rankLists[rank] = [];
			if (name) name = name.replace("\n", "").replace("\r", "");
			rankLists[rank].push(name);
		}
		var buffer = [];
		Object.keys(rankLists).sort(function (a, b) {
			return Config.groups[b].rank - Config.groups[a].rank;
		}).forEach(function (r) {
			buffer.push(Config.groups[r].name + "s (" + r + "):\n" + rankLists[r].sort().join(", "));
		});

		if (!buffer.length) {
			buffer = "This server has no auth.";
			return connection.popup("This server has no auth.");
		}
		connection.popup(buffer.join("\n\n"));
	},*/
		masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!this.can('pmall')) return false;
		if (!target) return this.parse('/help pmall');

		var pmName = 'Annonces Global';

		for (var i in Users.users) {
			var message = '|pm|' + pmName + '|' + Users.users[i].getIdentity() + '|' + target;
			Users.users[i].send(message);
		}
	},
	pmallhelp: ["/pmall [message] -Envoie un pm a tout les utilisateurs"],
	
	staffpm: 'pmallstaff',
	pmstaff: 'pmallstaff',
	pmallstaff: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target) return this.parse('/help pmallstaff');

		var pmName = ' Annonces Staff';

		for (var i in Users.users) {
			if (Users.users[i].isStaff) {
				Users.users[i].send('|pm|' + pmName + '|' + Users.users[i].group + Users.users[i].name + '|' + target);
			}
		}
	},
	
	img: 'image',
	image: function (target, room, user) {
		if (!target) return this.sendReply('Usage: /image link, size');
		if (!this.can('ban', room)) return false;
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		if (targets.length !== 2) {
			return this.sendReply('|raw|<center><img src="' + Tools.escapeHTML(targets[0]) + '" alt="" width="50%"/></center>');
		}
		if (parseInt(targets[1]) <= 0 || parseInt(targets[1]) > 100) return this.parse('Usage: /image link, size (1-100)');
		this.sendReply('|raw|<center><img src="' + Tools.escapeHTML(targets[0]) + '" alt="" width="' + toId(targets[1]) + '%"/></center>');
	},
	
	cssedit: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {return this.sendReply("/cssedit - Access denied.");}
		var fsscript = require('fs');
		if (!target) {
			if (!fsscript.existsSync(DATA_DIR + "custom.css")) return this.sendReply("custom.css no existe.");
			return this.sendReplyBox(fsscript.readFileSync(DATA_DIR + "custom.css").toString());
		}
		fsscript.writeFileSync(DATA_DIR + "custom.css", target.toString());
		this.sendReply("custom.css editado correctamente.");
	},
	
	spop: 'sendpopup',
	sendpopup: function(target, room, user) {
		if (!this.can('popup')) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply('/sendpopup [user], [message] - Vous avez manqué l utilisateur');
		if (!target) return this.sendReply('/sendpopup [user], [message] - vous avez manqué le message');

		targetUser.popup(target);
		this.sendReply(targetUser.name + ' A reçu le message sous forme de popup: ' + target);

		targetUser.send(user.name+' Vous envoye un message.');

		this.logModCommand(user.name+' Envoyer un message à '+targetUser.name);
	},
		roomshowimage: 'roomsi',
	roomsi: function(target, user, room) {
		if (!this.can('announce')) return;
		if(!target) return this.errorReply("/roomsi [imageurl]");
	this.sendReply("|raw|<img src=" + target + ">");
	},
	   sudo: function(target, room, user) {
        if (!user.can('sudo')) return;
        var parts = target.split(',');
        if (parts.length < 2) return this.parse('/help sudo');
        if (parts.length >= 3) parts.push(parts.splice(1, parts.length).join(','));
        var targetUser = parts[0],
            cmd = parts[1].trim().toLowerCase(),
            commands = Object.keys(CommandParser.commands).join(' ').toString(),
            spaceIndex = cmd.indexOf(' '),
            targetCmd = cmd;

        if (spaceIndex > 0) targetCmd = targetCmd.substr(1, spaceIndex - 1);

        if (!Users.get(targetUser)) return this.sendReply('User ' + targetUser + ' not found.');
        if (commands.indexOf(targetCmd.substring(1, targetCmd.length)) < 0 || targetCmd === '') return this.sendReply('Not a valid command.');
        if (cmd.match(/\/me/)) {
            if (cmd.match(/\/me./)) return this.parse('/control ' + targetUser + ', say, ' + cmd);
            return this.sendReply('You must put a target to make a user use /me.');
        }
        CommandParser.parse(cmd, room, Users.get(targetUser), Users.get(targetUser).connections[0]);
        this.sendReply('You have made ' + targetUser + ' do ' + cmd + '.');
    },


	
	destroymodlog: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {return this.sendReply("/destroymodlog - Access denied.");}
		var fsscript = require('fs');
		var logPath = LOGS_DIR + 'modlog/';
		if (CommandParser.modlog && CommandParser.modlog[room.id])  {
			CommandParser.modlog[room.id].close();
			delete CommandParser.modlog[room.id];
		}
		try {
			fsscript.unlinkSync(logPath + "modlog_" + room.id + ".txt");
			this.addModCommand(user.name + " ha destruido el modlog de esta sala." + (target ? ('(' + target + ')') : ''));
		} catch (e) {
			this.sendReply("No se puede destruir el modlog de esta sala.");
		}
	},

	clearall: function (target, room, user, connection) {
		if (!this.can('clearall')) return;
		var len = room.log.length,
			users = [];
		while (len--) {
			room.log[len] = '';
		}
		for (var user in room.users) {
			users.push(user);
			Users.get(user).leaveRoom(room, Users.get(user).connections[0]);
		}
		len = users.length;
		setTimeout(function() {
			while (len--) {
				Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
			}
		}, 1000);
	},

	roomlist: function (target, room, user) {
		if (!this.can('roomlist')) return;
		var rooms = Object.keys(Rooms.rooms);
		var len = rooms.length;
		var official = ['<b><font color="#1a5e00" size="2">Salle officiel:</font></b><br><br>'];
		var nonOfficial = ['<hr><b><font color="#000b5e" size="2">Salle non officiel:</font></b><br><br>'];
		var privateRoom = ['<hr><b><font color="#5e0019" size="2">Salle privers:</font></b><br><br>'];
		while (len--) {
			var _room = Rooms.rooms[rooms[(rooms.length - len) - 1]];
			if (_room.type === 'chat') {
				if (_room.isOfficial) {
					official.push(('<a href="/' + _room.title + '" class="ilink">' + _room.title + '</a> |'));
				} else if (_room.isPrivate) {
					privateRoom.push(('<a href="/' + _room.title + '" class="ilink">' + _room.title + '</a> |'));
				} else {
					nonOfficial.push(('<a href="/' + _room.title + '" class="ilink">' + _room.title + '</a> |'));
				}
			}
		}
		this.sendReplyBox(official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' '));
	}
};

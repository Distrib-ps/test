exports.commands = {
    
    rf: 'roomfounder',
    roomfounder: function (target, room, user) {
        if (!room.chatRoomData) {
            return this.sendReply("/roomfounder - This room isn't designed for per-room moderation to be added.");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
        if (!this.can('declare')) return false;
        if (room.isPersonal) return this.sendReply("You can't do this in personal rooms.");
        if (!room.auth) room.auth = room.chatRoomData.auth = {};
        if (!room.leagueauth) room.leagueauth = room.chatRoomData.leagueauth = {};
        var name = targetUser.name;
        room.auth[targetUser.userid] = '#';
        room.founder = targetUser.userid;
        this.addModCommand(name + ' was appointed to Room Founder by ' + user.name + '.');
        room.onUpdateIdentity(targetUser);
        room.chatRoomData.founder = room.founder;
        Rooms.global.writeChatRoomData();
    },
    
    roomdefounder: 'deroomfounder',
    deroomfounder: function (target, room, user) {
        if (!room.auth) {
            return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        var name = this.targetUsername;
        var userid = toId(name);
        if (room.isPersonal) return this.sendReply("You can't do this in personal rooms.");
        if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");

        if (room.auth[userid] !== '#') return this.sendReply("User '" + name + "' is not a room founder.");
        if (!this.can('declare')) return false;

        delete room.auth[userid];
        delete room.founder;
        this.sendReply("(" + name + " is no longer Room Founder.)");
        if (targetUser) targetUser.updateIdentity();
        if (room.chatRoomData) {
            Rooms.global.writeChatRoomData();
        }
    },

    roomowner: function (target, room, user) {
        if (!room.chatRoomData) {
            return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;

        if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
        if (!targetUser.registered) return this.sendReply("User '" + name + "' is not registered.");

        if (!room.founder) return this.sendReply('The room needs a room founder before it can have a room owner.');
        if (room.founder !== user.userid && !this.can('makeroom')) return this.sendReply('/roomowner - Access denied.');

        if (!room.auth) room.auth = room.chatRoomData.auth = {};

        var name = targetUser.name;

        room.auth[targetUser.userid] = '#';
        this.addModCommand("" + name + " was appointed Room Owner by " + user.name + ".");
        room.onUpdateIdentity(targetUser);
        Rooms.global.writeChatRoomData();
    }, 

    deroomowner: function (target, room, user) {
        if (!room.auth) {
            return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        var name = this.targetUsername;
        var userid = toId(name);
        if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");

        if (room.auth[userid] !== '#') return this.sendReply("User '"+name+"' is not a room owner.");
        if (!room.founder || user.userid !== room.founder && !this.can('makeroom', null, room)) return false;

        delete room.auth[userid];
        this.sendReply("(" + name + " is no longer Room Owner.)");
        if (targetUser) targetUser.updateIdentity();
        if (room.chatRoomData) {
            Rooms.global.writeChatRoomData();
        }
    },

    roomhelp: function (target, room, user) {
        if (room.id === 'lobby' || room.battle) return this.sendReply("This command is too spammy for lobby/battles.");
        if (!this.canBroadcast()) return;
        this.sendReplyBox(
            "Room drivers (%) peut utiliser:<br />" +
            "- /warn OR /k <em>username</em>: Avertir un utilisateur et montrer les règles Pokemon Showdown<br />" +
            "- /mute OR /m <em>username</em>: mute 7 minutes<br />" +
            "- /hourmute OR /hm <em>username</em>: mute 60 minute<br />" +
            "- /unmute <em>username</em>: unmute<br />" +
            "- /announce OR /wall <em>message</em>: faire une annonce<br />" +
            "- /modlog <em>username</em>: Recherchez le un user dans le modlog <br />" +
            "- /modnote <em>note</em>: Ajoute une note de modérateur qui peut être lue via modlog<br />" +
            "<br />" +
            "Room moderators (@) Peut également utiliser:<br />" +
            "- /roomban OR /rb <em>username</em>: Ban un user de la room<br />" +
            "- /roomunban <em>username</em>: Unban un user de la room<br />" +
            "- /roomvoice <em>username</em>: Promote un voice dans la room<br />" +
            "- /roomdevoice <em>username</em>: Demote un voice<br />" +
            "- /modchat <em>[off/autoconfirmed/+]</em>: Définir le niveau de modchat<br />" +
            "<br />" +
            "Room owners (#) Peut également utiliser:<br />" +
            "- /roomintro <em>intro</em>: Définit l'introduction de la room qui sera affichée pour tous les utilisateurs rejoignant la room<br />" +
            "- /rules <em>rules link</em>: Définissez le lien de règles de la pièce vu lors de l'utilisation /rules<br />" +
            "- /roommod, /roomdriver <em>username</em>: Nomme un modérateur/driver<br />" +
            "- /roomdemod, /roomdedriver <em>username</em>: Demote un driver/voice<br />" +
            "- /modchat <em>[%/@/#]</em>: Définir le niveau de modchat<br />" +
            "- /declare <em>message</em>:Faire une grande déclaration bleue dans la room<br />" +
            "- !htmlbox <em>HTML code</em>: Diffuse une boîte de code HTML dans la room<br />" +
            "- !showimage <em>[url], [width], [height]</em>: Montre une image dans la room<br />" +
            "<br />" +
            "Room founders (#) Peut également utiliser<br />" +
            "- /roomowner <em>username</em> Nomme le nom d'utilisateur roomowner<br />" +
            "<br />" +
            "Pensez a lire le réglement avec /regle<br />" +
            "</div>"
        );
    },
    	roomleader: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");

		if (!room.founder) return this.sendReply('The room needs a room founder before it can have a room owner.');
		if (room.founder !== user.userid && !this.can('makeroom')) return this.sendReply('/roomowner - Access denied.');

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		var name = targetUser.name;

		room.auth[targetUser.userid] = '&';
		this.addModCommand("" + name + " was appointed Room Leader by " + user.name + ".");
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},


	roomdeleader: 'deroomowner',
	deroomleader: function (target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");

		if (room.auth[userid] !== '&') return this.sendReply("User '"+name+"' is not a room leader.");
		if (!room.founder || user.userid !== room.founder && !this.can('makeroom', null, room)) return false;

		delete room.auth[userid];
		this.sendReply("(" + name + " is no longer Room Leader.)");
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
        }
};

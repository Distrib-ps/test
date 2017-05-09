'use strict';
const fs = require('fs');
let adWhitelist = ['pokeland'];
let adRegex = new RegExp("(play.pokemonshowdown.com\\/~~)(?!(" + adWhitelist.join('|') + "))", "g");
Config.chatfilter = function (message, user, room, connection, targetUser) {
	user.lastActiveTime = Date.now();
	if (!room && !Users(targetUser)) targetUser = {name: 'unknown user'};
	let pre_matches = (message.match(/psim|psim.us|psim us/g) || []).length;
	let final_check = (pre_matches >= 1 ? adWhitelist.filter(server => ~message.indexOf(server)).length : 0);
	if (!user.can('lock') && (pre_matches >= 1 && final_check === 0 || pre_matches >= 2 && final_check >= 1 || message.match(adRegex))) {
		if (user.locked) return false;
		if (!user.advWarns) user.advWarns = 0;
		user.advWarns++;
		if (user.advWarns > 1) {
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, null, "Advertising");
			fs.appendFile('logs/modlog/modlog_staff.txt', '[' + (new Date().toJSON()) + '] (staff) ' + user.name + ' a été verrouillé de parler par le serveur. (Advertising) (' + connection.ip + ')\n');
			connection.sendTo(room, '|raw|<strong class="message-throttle-notice">Vous avez été bloqué pour avoir tenté de la publicité.</strong>');
			Monitor.log("[AdMonitor] " + user.name + " a été bloqué pour avoir tenté de la publicité" + (room ? ". **Room:** " + room.id : " en pm" + targetUser.name + ".") + " **Message:** " + message);
			return false;
		}	
		Monitor.log("[AdMonitor] " + user.name + " A tenté de faire de la publicité" + (room ? ". **Room:** " + room.id : " en pm " + targetUser.name + ".") + " **Message:** " + message);
		connection.sendTo(room, '|raw|<strong class="message-throttle-notice">Publicité détectée, votre message n a pas été envoyé et les autorités mondiales exilées ont été notifiées.' + '<br />D autres tentatives de publicité dans un chat ou des PM se traduiront par un verrouillage.</strong>');
		connection.user.popup("|modal|Publicité détectée, votre message n'a pas été envoyé et les autorités mondiales exilées ont été notifiées.\n" + "D autres tentatives de publicité dans un chat ou des PM se traduiront par un verrouillage");
		return false;
	}
	return message;
};

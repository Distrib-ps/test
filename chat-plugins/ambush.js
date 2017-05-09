'use strict';

const ROUND_DURATION = 8 * 1000; //8 seconds

class Ambush {
	constructor(room, seconds) {
		this.players = new Map();
		this.round = 0;
		this.room = room;
		if (this.room.ambushCount) {
			this.room.ambushCount++;
		} else {
			this.room.ambushCount = 1;
		}
		this.timeLeft = Date.now() + seconds * 1000;

		this.room.add('|uhtml|ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>Un jeu d Ambush a été lancé!<br>' +
			'Le jeu commencera dans <b>' + seconds + '</b> secondes!<br>' +
			'<button name = "send" value = "/ambush join">Join!</button></center></div>'
		);
		this.timer = setTimeout(() => {
			if (this.players.size < 2) {
				this.room.add('|uhtmlchange|ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>Ce jeu d ambush s est terminé en raison du manque de joueurs.</center></div>').update();
				return this.end();
			}
			this.nextRound();
		}, seconds * 1000);
	}
	updateJoins() {
		let msg = 'ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>Le jeu ambush viens de commencer!<br>' +
			'Le jeu commencera dans <b>' + Math.round((this.timeLeft - Date.now()) / 1000) + '</b> secondes<br>' +
			'<button name = "send" value = "/ambush join">Join!</button></center>';
		if (this.players.size > 0) {
			msg += '<center><b>' + this.players.size + '</b> ' + (this.players.size === 1 ? 'user a' : 'users ont') + ' rejoind: ' + Array.from(this.players).map(player => Tools.escapeHTML(player[0].name)).join(', ') + '</center>';
		}
		this.room.add('|uhtmlchange|' + msg + '</div>');
	}
	join(user, self) {
		if (!user.named) return self.errorReply("Vous devez choisir un nom avant de vous joindre au ambush.");
		if (this.players.has(user)) return self.sendReply('Vous avez déjà participé à ce jeu d ambush.');
		if (this.round > 0) return self.sendReply('Vous ne pouvez pas vous joindre à un jeu d\'ambush après avoir commencé.');

		this.players.set(user, {status:'alive', rounds:0});
		this.updateJoins();
	}
	leave(user, self) {
		if (!this.players.has(user)) return self.sendReply('Tu n\'as pas encore rejoint ce jeu d\'ambush');

		this.players.delete(user);
		if (!this.round) {
			this.updateJoins();
		} else {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' a quitté la partie!</b>');
		}
	}
	getSurvivors() {
		return Array.from(this.players).filter(player => player[1].status === 'alive');
	}
	nextRound() {
		clearTimeout(this.timer);
		this.canShoot = false;
		if (this.checkWinner()) return this.getWinner();
		let survivors = this.getSurvivors();
		if (this.lastRoundSurvivors === survivors.length) {
			this.room.add('|html|<div class = "infobox"><center>Ce jeu d\'ambush s\'est terminé en raison de l\'inactivité, des <b>' + survivors.length + '</b> survivant.</center></div>');
			return this.end();
		}
		this.lastRoundSurvivors = survivors.length;

		this.round++;
		this.loadGuns();
		let msg = 'ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center><b>Round ' + this.round + '</b><br>' +
			'Players: ' + survivors.map(player => Tools.escapeHTML(player[0].name)).join(', ') +
			'<br><small>Utiliser /fire [player] pour tirer sur un autre joueur!</small>';
		this.room.add('|uhtml|' + msg + '<br><i>Attendez...</i></div>').update();

		this.release = setTimeout(() => {
			this.room.add('|uhtmlchange|' + msg + '<br><b style = "color:red; font-size: 12pt;">FIRE!</b></div>').update();
			this.canShoot = true;
			this.resetTimer();
		}, (Math.floor(Math.random() * 12) + 3) * 1000);
	}
	fire(user, target, self) {
		let getUser = this.players.get(user);
		if (!getUser) return self.sendReply("Vous n'êtes pas un joueur dans ce jeu d'Ambush.");
		this.madeMove = false;

		if (!this.canShoot) return self.sendReply("Vous n'êtes même pas autorisé à ouvrir le feu!");

		if (getUser.status === 'dead') return self.sendReply("Vous ne pouvez pas tirer après votre mort!");
		if (!getUser.rounds) return self.sendReply("Vous êtes hors-ligne! Vous ne pouvez pas tirer sur quelqu'un d'autre!");

		let targetUser = Users(target);
		if (!targetUser) return self.sendReply('User ' + target + ' pas trouver.');
		if (!this.players.has(targetUser)) return self.sendReply(targetUser.name + ' N\'est pas un joueur!');
		if (this.players.get(targetUser).status === 'mort') return self.sendReply(targetUser.name + ' A déjà été toucher!');

		this.players.get(user).rounds--;
		this.madeMove = true;
		if (targetUser === user) {
			this.room.add('|html|<b>' + user.name + ' S\'est tuer lui-même!</b>');
		} else if (!this.players.get(targetUser).rounds) {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' Tiré à ' + Tools.escapeHTML(targetUser.name) + ', mais ' + Tools.escapeHTML(targetUser.name) + ' hA un bouclier actif!</b>');
			return;
		} else {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' Tiré à  ' + Tools.escapeHTML(targetUser.name) + '!</b>');
		}
		this.players.get(targetUser).status = 'dead';

		if (this.checkWinner()) this.getWinner();
	}
	loadGuns() {
		this.players.forEach((details, user) => {
			if (this.players.get(user).status === 'alive') this.players.get(user).rounds = 1;
		});
	}
	resetTimer() {
		this.timer = setTimeout(() => {
			this.nextRound();
			this.room.update();
		}, ROUND_DURATION);
	}
	dq(target, self) {
		if (!this.round) return self.sendReply('Vous ne pouvez que disqualifier un joueur après le début du premier tour.');
		let targetUser = Users(target);
		if (!targetUser) return self.sendReply('User ' + target + ' Introuvable.');

		let getUser = this.players.get(targetUser);
		if (!getUser) return self.sendReply(targetUser.name + ' N\'est pas un joueur!');
		if (getUser.status === 'dead') return self.sendReply(targetUser.name + 'est deja mort!');

		this.players.delete(targetUser);
		this.room.add('|html|<b>' + Tools.escapeHTML(targetUser.name) + ' est disqualifier du jeu.</b>');
		if (this.checkWinner()) this.getWinner();
	}
	checkWinner() {
		if (this.getSurvivors().length === 1) return true;
	}
	getWinner() {
		let winner = this.getSurvivors()[0][0].name;
		let msg = '|html|<div class = "infobox"><center>Le gagnant de ce jeu d\'ambush est <b>' + Tools.escapeHTML(winner) + '!</b> Bravo!!</center>';
		if (this.room.id === 'marketplace') {
			msg += '<center>' + Tools.escapeHTML(winner) + ' tu es un géni !</center>';
			Wisp.writeCredits(winner, 5, () => this.room.add(msg).update());
		} else {
			this.room.add(msg).update();
		}
		this.end();
	}
	end(user) {
		if (user) {
			let msg = '<div class = "infobox"><center>Ce jeu d\'ambush a été terminé par la force <b>' + Tools.escapeHTML(user.name) + '</b></center></div>';
			if (!this.madeMove) {
				this.room.add('|uhtmlchange|ambush' + this.room.ambushCount + this.round + '|' + msg).update();
			} else {
				this.room.add('|html|' + msg).update();
			}
		}
		if (this.release) clearTimeout(this.release);
		clearTimeout(this.timer);
		delete this.room.ambush;
	}
}

let commands = {
	'': 'new',
	'start': 'new',
	'begin': 'new',
	'new': function (target, room, user) {
		if (room.ambush) return this.sendReply("Il y a déjà un jeu d'ambush dans cette salle.");
		if (room.isMuted(user) || user.locked) return this.errorReply("Tu es mute ! Tu ne peux pas utilisez ce jeu !.");
		if (!user.can('broadcast', null, room)) return this.sendReply("Tu dois etre + ou plus pour pouvoir utiliser ce jeu !");

		if (!target || !target.trim()) target = '60';
		if (isNaN(target)) return this.sendReply('\'' + target + '\' Nombre non valide.');
		if (target.includes('.') || target > 180 || target < 10) return this.sendReply('Le nombre de secondes doit être un nombre non décimal entre 10 et 180.');

		room.ambush = new Ambush(room, Number(target));
	},
	join: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours.");
		if (room.isMuted(user) || user.locked) return this.errorReply("Tu es mute ! Tu ne peux pas utilisez ce jeu !");

		room.ambush.join(user, this);
	},
	leave: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours.");

		room.ambush.leave(user, this);
	},
	proceed: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours.");
		if (room.isMuted(user) || user.locked) return this.errorReply("Tu es mute ! Tu ne peux pas utilisez ce jeu !");
		if (!user.can('broadcast', null, room)) return this.sendReply("Tu dois etre + ou plus.");

		if (room.ambush.round) return this.sendReply('Le jeu a deja commencer');
		if (room.ambush.players.size < 3) return this.sendReply('Il n\'y a pas encore assez de joueurs. Attendez  pour rejoindre!');
		room.add('(' + user.name + ' A commencé le tour 1)');
		room.ambush.nextRound();
	},
	disqualify: 'dq',
	dq: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours. on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("Tu es mute ! Tu ne peux pas utilisez ce jeu ! to speak.");
		if (!user.can('mute', null, room)) return this.sendReply("Vous devez être % ou plus dans cette salle pour disqualifier un utilisateur du jeu.");

		room.ambush.dq(target, this);
	},
	shoot: 'fire',
	fire: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours dans la room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("Tu es mute ! Tu ne peux pas utilisez ce jeu ! ");

		room.ambush.fire(user, target, this);
	},
	cancel: 'end',
	end: function (target, room, user) {
		if (!room.ambush) return this.sendReply("Il n'y a pas de jeu en cours. on in this room.");
		if (!user.can('mute', null, room)) return this.sendReply("tu dois atre % ou plus pour pouvoir end le jeu");

		room.ambush.end(user);
	},
	help: function () {
		this.parse('/help ambush');
	},
};

exports.commands = {
	ambush: commands,
	fire: 'shoot',
	shoot: commands.fire,
	ambushhelp: [
		'/ambush start [Secondes] - Démarre un jeu d\'embuscade dans la salle. Le premier tour commence après le nombre de secondes mentionné (1 minute par défaut). Nécessite + ou supérieur à utiliser.',
		'/ambush join/leave - Joins/Leaves le jeu d\'ambush',
		'/ambush proceed - Démarrage forcé du premier tour du jeu. Nécessite + ou plus à utiliser',
		'/ambush dq [user] -Disqualifie un joueur du jeu d\'ambush . Nécessite % ou plus à utiliser',
		'/ambush shoot/fire [user] - Tire un autre joueur (vous pouvez vous tuer également)',
		'/ambush end - Force à termine le jeu. Nécessite % ou plus à utiliser.',
	],
};

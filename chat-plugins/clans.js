exports.commands = {
	/*********************************************************
	 * Clan commands
	 *********************************************************/

	ayudaclan: 'clanshelp',
	clanhelp: 'clanshelp',
	clanshelp: function () {
		if (!this.canBroadcast()) return false;
		this.sendReplyBox(
			"<big><b>Commande basique</b></big><br /><br />" +
			"/clanes - Liste des clans.<br />" +
			"/clan (clan/miembro) - Affiche la forme / le profil d'un clan.<br />" +
			"/miembrosclan (clan/miembro) - Il montre dans quel clan est un membre.<br />" +
			"/clanauth (clan/miembro) -Il montre la hiérarchie des membres du clan..<br />" +
			"/warlog (clan/miembro) -Il montre les 10 dernières guerres de clan.<br />" +
			"/invitarclan - Inviter un utilisateur à rejoindre le clan. Elle exige de la direction Guilde.<br />" +
			"/expulsarclan (miembro) - Expulse un membre du clan. Elle exige chef de file du sous-clan.<br />" +
			"/aceptarclan (clan) - Accepte une invitation au clan.<br />" +
			"/invitacionesclan (clan/miembro) - Liste invités à un des membres du clan.<br />" +
            "/borrarinvitaciones - Supprime les invitations en attente du clan. Il faut chef de clan.<br />" +
			"/abandonarclan - Quitter le clan.<br />" +
			"<br />" +
			"<big><b>Commande de gestion du clan.</b></big><br /><br />" +
			"/liderclan (miembro) - Nomination d'un membre du chef de clan. elle exige ~<br />" +
			"/subliderclan (miembro) - La nomination d'un sous-chef du membre du clan. Chef du clan a besoin.<br />" +
			"/oficialclan (miembro) - Officiel nomination d'un membre du clan. Elle exige chef de file du sous-clan<br />" +
			"/demoteclan (miembro) - Supprime un membre du personnel du clan. Il faut Chef de Clan et ~ à rétrogradé un chef de file.<br />" +
			"/lemaclan (lema) - tg fdp.<br />" +
			"/logoclan (logo) - Définit le logo du clan, il faut le chef du clan.<br />" +
			"/closeclanroom -Bloque une salle de guilde à tous ceux qui ne sont pas membres du clan, à l'exception des administrateurs.<br />" +
			"/openclanroom - Supprime la commande bloc / fermer salle blanche.<br />" +
			"/llamarmiembros o /fjg - <br />" +
			"/rk o /roomkick - Éjecte un utilisateur d'une pièce. Nécessite @ ou plus.<br />" +
			"<br />" +
			"<big><b>Commande d'administration:</b></big><br /><br />" +
			"/createclan &lt;name> - Crée un clan.<br />" +
			"/deleteclan &lt;name> - Supprimer un clan.<br />" +
			"/addclanmember &lt;clan>, &lt;user> - Force un utilisateur à se joindre à un clan.<br />" +
			"/removeclanmember &lt;clan>, &lt;user> - Expulser quelqu'un d'un clan.<br />" +
			"/setlemaclan &lt;clan>,&lt;lema> - Établire un thème pour un clan.<br />" +
			"/setlogoclan &lt;clan>,&lt;logo> - Elle établit un logo pour un clan.<br />" +
			"/setsalaclan &lt;clan>,&lt;sala> - Définit une chambre pour un clan.<br />" +
			"/setgxeclan &lt;clan>,&lt;wins>,&lt;losses>,&lt;draws> - Réglez le score d'un clan.<br />" +
			"/serankclan &lt;clan>,&lt;puntos> - Réglez le score d'un clan.<br />" +
			"/settitleclan &lt;clan>&lt;puntos> - Mettre un  titre du clan.<br />"
		);
	},

	createclan: function (target) {
		if (!this.can('clans')) return false;
		if (target.length < 2)
			this.sendReply("El nombre del clan es demasiado corto");
		else if (!Clans.createClan(target))
			this.sendReply("No se pudo crear el clan. Es posible que ya exista otro con el mismo nombre.");
		else
			this.sendReply("Clan: " + target + " creado con éxito.");

	},

	deleteclan: function (target) {
		if (!this.can('clans')) return false;
		if (!Clans.deleteClan(target))
			this.sendReply("No se pudo eliminar el clan. Es posble que no exista o que se encuentre en war.");
		else
			this.sendReply("Clan: " + target + " eliminado con éxito.");
	},

	getclans: 'clans',
	clanes: 'clans',
	clans: function (target, room, user) {
		if (!this.canBroadcast()) return false;
		var clansTableTitle = "Lista de Clanes";
		if (toId(target) === 'rank' || toId(target) === 'puntos' || toId(target) === 'prestigio' || toId(target) === 'puntuacion') {
			target = "rank";
			clansTableTitle = "Lista de Clanes por Puntuaci&oacute;n";
		}
		if (toId(target) === 'miembros' || toId(target) === 'members') {
			target = "members";
			clansTableTitle = "Lista de Clanes por Miembros";
		}
		var clansTable = '<center><big><big><strong>' + clansTableTitle + '</strong></big></big><center><br /><table class="clanstable" width="100%" border="1" cellspacing="0" cellpadding="3" target="_blank"><tr><td><center><strong>Clan</strong></center></td><td><center><strong>Nombre Completo</strong></center></td><td><center><strong>Miembros</strong></center></td><td><center><strong>Sala</strong></center></td><td><center><strong>Wars</strong></center></td><td><center><strong>Puntuaci&oacute;n</strong></center></td></tr>';
		var clansList = Clans.getClansList(toId(target));
		var auxRating = {};
		var nMembers = 0;
		var membersClan = {};
		var auxGxe = 0;
		for (var m in clansList) {
			auxRating = Clans.getElementalData(m);
			membersClan = Clans.getMembers(m);
			if (!membersClan) {
				nMembers = 0;
			} else {
				nMembers = membersClan.length;
			}
			clansTable += '<tr><td><center>' + Tools.escapeHTML(Clans.getClanName(m)) + '</center></td><td><center>' +Tools.escapeHTML(auxRating.compname) + '</center></td><td><center>' + nMembers + '</center></td><td><center>' + '<button name="send" value="/join ' + Tools.escapeHTML(auxRating.sala) + '" target="_blank">' + Tools.escapeHTML(auxRating.sala) + '</button>' + '</center></td><td><center>' + (auxRating.wins + auxRating.losses + auxRating.draws) + '</center></td><td><center>' + auxRating.rating + '</center></td></tr>';
		}
		clansTable += '</table>';
		this.sendReply("|raw| " + clansTable);
	},

	clanauth: function (target, room, user) {
		var autoclan = false;
		if (!target) autoclan = true;
		if (!this.canBroadcast()) return false;
		var clan = Clans.getRating(target);
		if (!clan) {
			target = Clans.findClanFromMember(target);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan && autoclan) {
			target = Clans.findClanFromMember(user.name);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan) {
			this.sendReply("El clan especificado no existe o no está disponible.");
			return;
		}
		//html codes for clan ranks
		var leaderClanSource = Clans.getAuthMembers(target, 3);
		if (leaderClanSource !== "") {
			leaderClanSource = "<big><b>Líderes</b></big><br /><br />" + leaderClanSource + "</b></big></big><br /><br />";
		}
		var subLeaderClanSource = Clans.getAuthMembers(target, 2);
		if (subLeaderClanSource !== "") {
			subLeaderClanSource = "<big><b>Sub-Líderes</b></big><br /><br />" + subLeaderClanSource + "</b></big></big><br /><br />";
		}
		var oficialClanSource = Clans.getAuthMembers(target, 1);
		if (oficialClanSource !== "") {
			oficialClanSource = "<big><b>Oficiales</b></big><br /><br />" + oficialClanSource + "</b></big></big><br /><br />";
		}
		var memberClanSource = Clans.getAuthMembers(target, 0);
		if (memberClanSource !== "") {
			memberClanSource = "<big><b>Resto de Miembros</b></big><br /><br />" + memberClanSource + "</b></big></big><br /><br />";
		}

		this.sendReplyBox(
			"<center><big><big><b>Jerarquía del clan " + Tools.escapeHTML(Clans.getClanName(target)) + "</b></big></big> <br /><br />" + leaderClanSource + subLeaderClanSource + oficialClanSource + memberClanSource + '</center>'
		);
	},

	clanmembers: 'miembrosclan',
	miembrosclan: function (target, room, user) {
		var autoclan = false;
		if (!target) autoclan = true;
		if (!this.canBroadcast()) return false;
		var clan = Clans.getRating(target);
		if (!clan) {
			target = Clans.findClanFromMember(target);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan && autoclan) {
			target = Clans.findClanFromMember(user.name);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan) {
			this.sendReply("El clan especificado no existe o no está disponible.");
			return;
		}
		var nMembers = 0;
		var membersClan = Clans.getMembers(target);
		if (!membersClan) {
			nMembers = 0;
		} else {
			nMembers = membersClan.length;
		}
		this.sendReplyBox(
			"<strong>Miembros del clan " + Tools.escapeHTML(Clans.getClanName(target)) + ":</strong> " + Clans.getAuthMembers(target, "all") + '<br /><br /><strong>Número de miembros: ' + nMembers + '</strong>'
		);
	},
	invitacionesclan: function (target, room, user) {
		var autoclan = false;
		if (!target) autoclan = true;
		if (!this.canBroadcast()) return false;
		var clan = Clans.getRating(target);
		if (!clan) {
			target = Clans.findClanFromMember(target);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan && autoclan) {
			target = Clans.findClanFromMember(user.name);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan) {
			this.sendReply("El clan especificado no existe o no está disponible.");
			return;
		}
		this.sendReplyBox(
			"<strong>Invitaciones pendientes del clan " + Tools.escapeHTML(Clans.getClanName(target)) + ":</strong> " + Tools.escapeHTML(Clans.getInvitations(target).sort().join(", "))
		);
	},
	clan: 'getclan',
	getclan: function (target, room, user) {
		var autoClan = false;
		var memberClanProfile = false;
		var clanMember = "";
		if (!target) autoClan = true;
		if (!this.canBroadcast()) return false;
		var clan = Clans.getProfile(target);
		if (!clan) {
			clanMember = target;
			target = Clans.findClanFromMember(target);
			memberClanProfile = true;
			if (target)
				clan = Clans.getProfile(target);
		}
		if (!clan && autoClan) {
			target = Clans.findClanFromMember(user.name);
			if (target)
				clan = Clans.getProfile(target);
			memberClanProfile = true;
			clanMember = user.name;
		}
		if (!clan) {
			this.sendReply("El clan especificado no existe o no está disponible.");
			return;
		}
		var salaClanSource = "";
		if (clan.sala === "none") {
			salaClanSource = 'Aún no establecida.';
		} else {
			salaClanSource = '<button name="send" value="/join ' + Tools.escapeHTML(clan.sala) + '" target="_blank">' + Tools.escapeHTML(clan.sala) + '</button>';
		}
		var clanTitle = "";
		if (memberClanProfile) {
			var authValue = Clans.authMember(target, clanMember);
			if (authValue === 3) {
				clanTitle = clanMember + " - Líder del clan " + clan.compname;
			} else if (authValue === 2) {
				clanTitle = clanMember + " - Sub-Líder del clan " + clan.compname;
			} else if (authValue === 1) {
				clanTitle = clanMember + " - Oficial del clan " + clan.compname;
			} else {
				clanTitle = clanMember + " - Miembro del clan " + clan.compname;
			}
		} else {
			clanTitle = clan.compname;
		}
		var medalsClan = '';
		if (clan.medals) {
			for (var u in clan.medals) {
				medalsClan += '<img id="' + u + '" src="' + encodeURI(clan.medals[u].logo) + '" width="32" title="' + Tools.escapeHTML(clan.medals[u].desc) + '" />&nbsp;&nbsp;';
			}
		}
		this.sendReplyBox(
			'<div class="fichaclan">' +
			'<h4><center><p> <br />' + Tools.escapeHTML(clanTitle) + '</center></h4><hr width="90%" />' +
			'<table width="90%" border="0" align="center"><tr><td width="180" rowspan="2"><div align="center"><img src="' + encodeURI(clan.logo) +
			'" width="160" height="160" /></div></td><td height="64" align="left" valign="middle"><span class="lemaclan">'+ Tools.escapeHTML(clan.lema) +
			'</span></td> </tr>  <tr>    <td align="left" valign="middle"><strong>Sala Propia</strong>: ' + salaClanSource +
			' <p style="font-style: normal;font-size: 16px;"><strong>Puntuación</strong>:&nbsp;' + clan.rating +
			' (' + clan.wins + ' Victorias, ' + clan.losses + ' Derrotas, ' + clan.draws + ' Empates)<br />' +
			' </p> <p style="font-style: normal;font-size: 16px;">&nbsp;' + medalsClan +
			'</p></td>  </tr></table></div>'
		);
	},

	setlemaclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /setlemaclan clan, lema");

		if (!Clans.setLema(params[0], params[1]))
			this.sendReply("El clan no existe o el lema es mayor de 80 caracteres.");
		else {
			this.sendReply("El nuevo lema del clan " + params[0] + " ha sido establecido con éxito.");
		}
	},

	setlogoclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /setlogoclan clan, logo");

		if (!Clans.setLogo(params[0], params[1]))
			this.sendReply("El clan no existe o el link del logo es mayor de 120 caracteres.");
		else {
			this.sendReply("El nuevo logo del clan " + params[0] + " ha sido establecido con éxito.");
		}
	},

	settitleclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /settitleclan clan, titulo");

		if (!Clans.setCompname(params[0], params[1]))
			this.sendReply("El clan no existe o el título es mayor de 80 caracteres.");
		else {
			this.sendReply("El nuevo titulo del clan " + params[0] + " ha sido establecido con éxito.");
		}
	},

	setrankclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /setrankclan clan, valor");

		if (!Clans.setRanking(params[0], params[1]))
			this.sendReply("El clan no existe o el valor no es válido.");
		else {
			this.sendReply("El nuevo rank para el clan " + params[0] + " ha sido establecido con éxito.");
		}
	},

	setgxeclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 4) return this.sendReply("Usage: /setgxeclan clan, wins, losses, ties");

		if (!Clans.setGxe(params[0], params[1], params[2], params[3]))
			this.sendReply("El clan no existe o el valor no es válido.");
		else {
			this.sendReply("El nuevo GXE para el clan " + params[0] + " ha sido establecido con éxito.");
		}
	},

	setsalaclan: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /setsalaclan clan, sala");

		if (!Clans.setSala(params[0], params[1]))
			this.sendReply("El clan no existe o el nombre de la sala es mayor de 80 caracteres.");
		else {
			this.sendReply("La nueva sala del clan " + params[0] + " ha sido establecida con éxito.");
		}
	},
	
	giveclanmedal: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 4) return this.sendReply("Usage: /giveclanmedal clan, medallaId, imagen, desc");

		if (!Clans.addMedal(params[0], params[1], params[2], params[3]))
			this.sendReply("El clan no existe o alguno de los datos no es correcto");
		else {
			this.sendReply("Has entegado una medalla al clan " + params[0]);
		}
	},
	
	removeclanmedal: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /removeclanmedal clan, medallaId");

		if (!Clans.deleteMedal(params[0], params[1]))
			this.sendReply("El clan no existe o no podeía dicha medalla");
		else {
			this.sendReply("Has quitado una medalla al clan " + params[0]);
		}
	},

	lemaclan: function (target, room, user) {
		var permisionClan = false;
		if (!target) return this.sendReply("Debe especificar un lema.");
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionvalue === 3) permisionClan = true;
			if (!permisionClan && !this.can('clans')) return false;
		} else {
			return false;
		}
		var claninfo = Clans.getElementalData (clanUser);
		if (room && room.id === toId(claninfo.sala)) {
			if (!Clans.setLema(clanUser, target))
				this.sendReply("El lema es mayor de 80 caracteres.");
			else {
				this.addModCommand("Un nuevo lema para el clan " + clanUser + " ha sido establecido por " + user.name);
			}
		} else {
			this.sendReply("Este comando solo puede ser usado en la sala del clan.");
		}
	},

	logoclan: function (target, room, user) {
		var permisionClan = false;
		if (!target) return this.sendReply("Debe especificar un logo.");
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionvalue === 3) permisionClan = true;
			if (!permisionClan && !this.can('clans')) return false;
		} else {
			return false;
		}
		var claninfo = Clans.getElementalData (clanUser);
		if (room && room.id === toId(claninfo.sala)) {
			if (!Clans.setLogo(clanUser, target))
				this.sendReply("El logo es mayor de 120 caracteres.");
			else {
				this.addModCommand("Un nuevo logotipo para el clan " + clanUser + " ha sido establecido por " + user.name);
			}
		} else {
			this.sendReply("Este comando solo puede ser usado en la sala del clan.");
		}
	},

	llamarmiembros: 'fjg',
	fjg: function (target, room, user) {
		var permisionClan = false;
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionvalue === 2 || perminsionvalue === 3) permisionClan = true;
			if (!permisionClan && !this.can('clans')) return false;
		} else {
			return false;
		}
		var claninfo = Clans.getElementalData (clanUser);
		if (room && room.id === toId(claninfo.sala)) {
			var clanMembers = Clans.getMembers(clanUser);
			var targetUser;
			for (var i = 0; i < clanMembers.length; ++i) {
				if (!room.users[toId(clanMembers[i])]) {
					targetUser = Users.get(clanMembers[i])
					if (targetUser && targetUser.connected) {
						targetUser.joinRoom(room.id);
						targetUser.popup('Has sido llamado a la sala ' + claninfo.sala.trim() + ' por ' + user.name + '.');
					}
				}
			}
			this.addModCommand("Los miembros del clan " + clanUser + " han sido llamados a la sala " + toId(claninfo.sala) + ' por ' + user.name + '.');
		} else {
			this.sendReply("Este comando solo puede ser usado en la sala del clan.");
		}
	},

	addclanmember: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (params.length !== 2) return this.sendReply("Usage: /addclanmember clan, member");

		var user = Users.getExact(params[1]);
		if (!user || !user.connected) return this.sendReply("User: " + params[1] + " is not online.");

		if (!Clans.addMember(params[0], params[1]))
			this.sendReply("Could not add the user to the clan. Does the clan exist or is the user already in another clan?");
		else {
			this.sendReply("User: " + user.name + " successfully added to the clan.");
			Rooms.rooms.lobby.add('|raw|<div class="clans-user-join">' + Tools.escapeHTML(user.name) + " se ha unido al clan: " + Tools.escapeHTML(Clans.getClanName(params[0])) + '</div>');
		}
	},

	clanleader: 'liderclan',
	liderclan: function (target, room, user) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (!params) return this.sendReply("Usage: /liderclan member");

		var userk = Users.getExact(params[0]);
		if (!userk || !userk.connected) return this.sendReply("Usuario: " + params[0] + " no existe o no está disponible.");

		if (!Clans.addLeader(params[0]))
			this.sendReply("El usuario no existe, no pertenece a ningún clan o ya era líder de su clan.");
		else {
			var clanUser = Clans.findClanFromMember(params[0]);
			this.sendReply("Usuario: " + userk.name + " nombrado correctamente líder del clan " + clanUser + ".");
			userk.popup(user.name + " te ha nombrado Líder del clan " + clanUser + ".\nUtiliza el comando /clanhelp para más información.");
		}
	},

	clanoficial: 'oficialclan',
	oficialclan: function (target, room, user) {
		var permisionClan = false;
		var params = target.split(',');
		if (!params) {
				return this.sendReply("Usage: /oficialclan member");
		}
		var clanUser = Clans.findClanFromMember(user.name);
		var clanTarget = Clans.findClanFromMember(params[0]);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var userb = toId(params[0]);
			var iduserwrit = toId(user.name);
			var perminsionValue = Clans.authMember(clanUserid, iduserwrit);
			if ((perminsionValue === 2 || perminsionValue === 3) && clanTarget === clanUser) permisionClan = true;
		}
		if (!permisionClan && !this.can('clans')) return;
		var userk = Users.getExact(params[0]);
		if (!userk || !userk.connected) return this.sendReply("Usuario: " + params[0] + " no existe o no está disponible.");
		if (clanTarget) {
			var clanId = toId(clanTarget);
			var userId = toId(params[0]);
			if ((Clans.authMember(clanId, userId) > 2 && !this.can('clans')) || (Clans.authMember(clanId, userId) === 2 && perminsionValue < 3 && !this.can('clans'))) return false;
		}
		if (!Clans.addOficial(params[0]))
			this.sendReply("El usuario no existe, no pertenece a ningún clan o ya era oficial de su clan.");
		else {
			this.sendReply("Usuario: " + userk.name + " nombrado correctamente oficial del clan " + clanTarget + ".");
			userk.popup(user.name + " te ha nombrado Oficial del clan " + clanTarget + ".\nUtiliza el comando /clanhelp para más información.");
		}
	},
	
	clansubleader: 'subliderclan',
	subliderclan: function (target, room, user) {
		var permisionClan = false;
		var params = target.split(',');
		if (!params) {
				return this.sendReply("Usage: /subliderclan member");
		}
		var clanUser = Clans.findClanFromMember(user.name);
		var clanTarget = Clans.findClanFromMember(params[0]);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var userb = toId(params[0]);
			var iduserwrit = toId(user.name);
			var perminsionValue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionValue === 3 && clanTarget === clanUser) permisionClan = true;
		}
		if (!permisionClan && !this.can('clans')) return;
		var userk = Users.getExact(params[0]);
		if (!userk || !userk.connected) return this.sendReply("Usuario: " + params[0] + " no existe o no está disponible.");
		if (clanTarget) {
			var clanId = toId(clanTarget);
			var userId = toId(params[0]);
			if ((Clans.authMember(clanId, userId) > 2 && !this.can('clans')) || (Clans.authMember(clanId, userId) === 2 && perminsionValue < 3 && !this.can('clans'))) return false;
		}
		if (!Clans.addSubLeader(params[0]))
			this.sendReply("El usuario no existe, no pertenece a ningún clan o ya era sub-lider de su clan.");
		else {
			this.sendReply("Usuario: " + userk.name + " nombrado correctamente sub-lider del clan " + clanTarget + ".");
			userk.popup(user.name + " te ha nombrado Sub-Lider del clan " + clanTarget + ".\nUtiliza el comando /clanhelp para más información.");
		}
	},

	degradarclan: 'declanauth',
	demoteclan: 'declanauth',
	declanauth: function (target, room, user) {
		var permisionClan = false;
		var params = target.split(',');
		if (!params) {
			return this.sendReply("Usage: /demoteclan member");
		}
		var clanUser = Clans.findClanFromMember(user.name);
		var clanTarget = Clans.findClanFromMember(params[0]);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var userb = toId(params[0]);
			var iduserwrit = toId(user.name);
			var perminsionValue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionValue >= 2 && clanTarget === clanUser) permisionClan = true;
		}
		if (!permisionClan && !this.can('clans')) return;
		var userk = Users.getExact(params[0]);
		if (!clanTarget) {
			return this.sendReply("El usuario no existe o no pertenece a ningún clan.");
		} else {
			var clanId = toId(clanTarget);
			var userId = toId(params[0]);
			if ((Clans.authMember(clanId, userId) > 2 && !this.can('clans')) || (Clans.authMember(clanId, userId) === 2 && perminsionValue < 3 && !this.can('clans'))) return false;
		}
		if (!Clans.deleteLeader(params[0])) {
			if (!Clans.deleteOficial(params[0])) {
				this.sendReply("El usuario no poseía ninguna autoridad dentro del clan.");
			} else {
				if (!userk || !userk.connected) {
					this.addModCommand(params[0] + " ha sido degradado de rango en " + clanTarget + " por " + user.name);
				} else {
					this.addModCommand(userk.name + " ha sido degradado de rango en " + clanTarget + " por " + user.name);
				}
			}
		} else {
			var oficialDemote = Clans.deleteOficial(params[0]);
			if (!userk || !userk.connected) {
				this.addModCommand(params[0] + " ha sido degradado de rango en " + clanTarget + " por " + user.name);
			} else {
				this.addModCommand(userk.name + " ha sido degradado de rango en " + clanTarget + " por " + user.name);
			}
		}
	},

	invitarclan: function (target, room, user) {
		var permisionClan = false;
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var permisionValue = Clans.authMember(clanUserid, iduserwrit);
			if (permisionValue > 0) permisionClan = true;
		}
		if (!permisionClan) return this.sendReply("/invitarclan - Acceso denegado");
		var params = target.split(',');
		if (!params) return this.sendReply("Usage: /invitarclan user");
		var userk = Users.getExact(params[0]);
		if (!userk || !userk.connected) return this.sendReply("Usuario: " + params[0] + " no existe o no está disponible.");
		if (!Clans.addInvite(clanUser, params[0]))
			this.sendReply("No se pudo invitar al usuario. ¿No existe, ya está invitado o está en otro clan?");
		else {
			clanUser = Clans.findClanFromMember(user.name);
			userk.popup(user.name + " te ha invitado a unirte al clan " + clanUser + ".\nPara unirte al clan escribe en el chat /aceptarclan " + clanUser);
			room.addRaw(userk.name + " ha sido invitado a unirse al clan " + clanUser + " por " + user.name);
		}
	},
	aceptarclan: function (target, room, user) {
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser) {
			return this.sendReply("Ya perteneces a un clan. No te puedes unir a otro.");
		}
		var params = target.split(',');
		if (!params) return this.sendReply("Usage: /aceptarclan clan");
		var clanpropio = Clans.getClanName(params[0]);
		if (!clanpropio) return this.sendReply("El clan no existe o no está disponible.");

		if (!Clans.aceptInvite(params[0], user.name))
			this.sendReply("El clan no existe o no has sido invitado a este.");
		else {
			this.sendReply("Te has unido correctamente al clan" + clanpropio);
			Rooms.rooms.lobby.add('|raw|<div class="clans-user-join">' + Tools.escapeHTML(user.name) + " se ha unido al clan: " + Tools.escapeHTML(Clans.getClanName(params[0])) + '</div>');
		}
	},
	inviteclear: 'borrarinvitaciones',
	borrarinvitaciones: function (target, room, user) {
		var permisionClan = false;
		var clanUser = Clans.findClanFromMember(user.name);
		if (!target) {
			if (clanUser) {
				var clanUserid = toId(clanUser);
				var iduserwrit = toId(user.name);
				var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
				if (perminsionvalue === 3) permisionClan = true;
			}
			if (!permisionClan) return false;
		} else {
			if (!this.can('clans')) return;
			clanUser = target;
		}
		if (!Clans.clearInvitations(clanUser))
			this.sendReply("El clan no existe o no está disponible.");
		else {
			this.sendReply("Lista de Invitaciones pendientes del clan " + clanUser + " borrada correctamente.");
		}
	},

	removeclanmember: function (target) {
		if (!this.can('clans')) return false;
		var params = target.split(',');
		if (params.length !== 2) return this.sendReply("Usage: /removeclanmember clan, member");
		if (!Clans.removeMember(params[0], params[1]))
			this.sendReply("Could not remove the user from the clan. Does the clan exist or has the user already been removed from it?");
		else {
			this.sendReply("User: " + params[1] + " successfully removed from the clan.");
			Rooms.rooms.lobby.add('|raw|<div class="clans-user-join">' + Tools.escapeHTML(params[1]) + " ha abandonado el clan: " + Tools.escapeHTML(Clans.getClanName(params[0])) + '</div>');
		}
	},

	expulsarclan: function (target, room, user) {
		var permisionClan = false;
		var params = target.split(',');
		if (!params) {
				return this.sendReply("Usage: /expulsarclan member");
		}
		var clanUser = Clans.findClanFromMember(user.name);
		var clanTarget = Clans.findClanFromMember(params[0]);
		if (clanUser) {
			var clanUserid = toId(clanUser);
			var userb = toId(params[0]);
			var iduserwrit = toId(user.name);
			var perminsionValue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionValue >= 2 && clanTarget === clanUser) permisionClan = true;
		}
		if (!permisionClan && !this.can('clans')) return;
		var currentWar = War.findClan(clanTarget);
		if (currentWar) {
			var currentWarParticipants = War.getTourData(currentWar);
			if (currentWarParticipants.teamAMembers[toId(params[0])] || currentWarParticipants.teamBMembers[toId(params[0])]) return this.sendReply("No puedes expulsar del clan si el miembro estaba participando en una war.");
		}
		var userk = Users.getExact(params[0]);
		if (!clanTarget) {
			return this.sendReply("El usuario no existe o no pertenece a ningún clan.");
		} else {
			var clanId = toId(clanTarget);
			var userId = toId(params[0]);
			if ((Clans.authMember(clanId, userId) > 2 && !this.can('clans')) || (Clans.authMember(clanId, userId) === 2 && perminsionValue < 3 && !this.can('clans'))) return false;
		}
		if (!Clans.removeMember(clanTarget, params[0])) {
			this.sendReply("El usuario no pudo ser expulsado del clan.");
		} else {
			if (!userk || !userk.connected) {
				this.addModCommand(params[0] + " ha sido expulsado del clan " + clanTarget + " por " + user.name);
			} else {
				this.addModCommand(userk.name + " ha sido expulsado del clan " + clanTarget + " por " + user.name);
			}
		}
	},

	 salirdelclan: 'abandonarclan',
	 clanleave: 'abandonarclan',
	 abandonarclan: function (target, room, user) {
		var clanUser = Clans.findClanFromMember(user.name);
		if (!clanUser) {
			return this.sendReply("No perteneces a ningún clan.");
		}
		var currentWar = War.findClan(clanUser);
		if (currentWar) {
			var currentWarParticipants = War.getTourData(currentWar);
			if (currentWarParticipants.teamAMembers[toId(user.name)] || currentWarParticipants.teamBMembers[toId(user.name)]) return this.sendReply("No puedes salir del clan si estabas participando en una war.");
		}
		if (!Clans.removeMember(clanUser, user.name)) {
			 this.sendReply("Error al intentar salir del clan.");
		} else {
			this.sendReply("Has salido del clan" + clanUser);
			Rooms.rooms.lobby.add('|raw|<div class="clans-user-join">' + Tools.escapeHTML(user.name) + " ha abandonado el clan: " + Tools.escapeHTML(Clans.getClanName(clanUser)) + '</div>');
		}
	},


	//new war system
	resetclanranking: function (target, room, user) {
		if (!this.can('clans')) return false;
		if (room.id !== 'staff') return this.sendReply("Este comando solo puede ser usado en la sala Staff");
		Clans.resetClansRank();
		this.addModCommand(user.name + " ha reiniciado el ranking de clanes.");
	},
	
	resetwarlog: function (target, room, user) {
		if (!this.can('clans')) return false;
		if (room.id !== 'staff') return this.sendReply("Este comando solo puede ser usado en la sala Staff");
		Clans.resetWarLog();
		this.addModCommand(user.name + " ha borrado todos los warlogs.");
	},
	
	pendingwars: 'wars',
	wars: function (target, room, user) {
		this.parse("/war search");
	},

	viewwar: 'vw',
	warstatus: 'vw',
	vw: function (target, room, user) {
		this.parse("/war round");
	},
	
	endwar: function (target, room, user) {
		this.parse("/war end");
	},
	
	warlog: function (target, room, user) {
		var autoclan = false;
		if (!target) autoclan = true;
		if (!this.canBroadcast()) return false;
		var clan = Clans.getRating(target);
		if (!clan) {
			target = Clans.findClanFromMember(target);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan && autoclan) {
			target = Clans.findClanFromMember(user.name);
			if (target)
				clan = Clans.getRating(target);
		}
		if (!clan) {
			this.sendReply("El clan especificado no existe o no está disponible.");
			return;
		}
		var f = new Date();
		var dateWar = f.getDate() + '-' + f.getMonth() + ' ' + f.getHours() + 'h';
		this.sendReply(
			"|raw| <center><big><big><b>Ultimas Wars del clan " + Tools.escapeHTML(Clans.getClanName(target)) + "</b></big></big> <br /><br />" + Clans.getWarLogTable(target) + '<br /> Fecha del servidor: ' + dateWar + '</center>'
		);
	},
	
	cerrarsalaclan: 'closeclanroom',
	closeclanroom: function (target, room, user) {
		var permisionClan = false;
		var clanRoom = Clans.findClanFromRoom(room.id);
		if (!clanRoom) return this.sendReply("Esta no es una sala de Clan.");
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser && toId(clanRoom) === toId(clanUser)) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionvalue >= 2) permisionClan = true;
			
		} 
		if (!permisionClan && !this.can('clans')) return false;
		if (!Clans.closeRoom(room.id, clanRoom))
			this.sendReply("Error al intentar cerrar la sala. Es posible que ya esté cerrada.");
		else {
			this.addModCommand("Esta sala ha sido cerrada a quienes no sean miembros de " + clanRoom + " por " + user.name);
		}
	},
	
	abrirsalaclan: 'openclanroom',
	openclanroom: function (target, room, user) {
		var permisionClan = false;
		var clanRoom = Clans.findClanFromRoom(room.id);
		if (!clanRoom) return this.sendReply("Esta no es una sala de Clan.");
		var clanUser = Clans.findClanFromMember(user.name);
		if (clanUser && toId(clanRoom) === toId(clanUser)) {
			var clanUserid = toId(clanUser);
			var iduserwrit = toId(user.name);
			var perminsionvalue = Clans.authMember(clanUserid, iduserwrit);
			if (perminsionvalue >= 2) permisionClan = true;
			
		} 
		if (!permisionClan && !this.can('clans')) return false;
		if (!Clans.openRoom(room.id, clanRoom))
			this.sendReply("Error al intentar abrir la sala. Es posible que ya esté abierta.");
		else {
			this.addModCommand("Esta sala ha sido abierta a todos los usuarios por " + user.name);
		}
	},
	
	kickall: function (target, room, user, connection) {
		if (!this.can('makeroom')) return false;
		var targetUser;
		for (var f in room.users) {
			targetUser = Users.getExact(room.users[f]);
			if (!targetUser) {
				delete room.users[f];
			} else {
				targetUser.leaveRoom(room.id);
			}
		}
		room.userCount = 0;
		this.addModCommand("" + user.name + " has kicked all users from room " + room.id + '.');
		setTimeout(function () {user.joinRoom(room.id);}, 2000);
	}
};

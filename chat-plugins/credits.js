'Use Strict';

/* Original code by panpawn! Modified for roleplau by Prince Sky!*/

var color = require('../config/color');
hashColor = function(name, bold) {
	return (bold ? "<b>" : "") + "<font color=" + color(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Tools.escapeHTML(Users.getExact(name).name) : Tools.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
}

exports.commands = {
	credit: 'credits',
	credits: function (target, room, user) {
		this.popupReply("|html|" + "<font size=5>Credits pokeland</font><br />" +
					"<u>Owners:</u><br />" +
					"- " + hashColor('Distrib', true) + " (Fondateur, Sysadmin, Développeur, Traducteur)<br />" +
                    "- " + hashColor('Saitochi', true) + " (Fondateur, Traducteur)<br />" +
                    "- " + hashColor('asumaru', true) + " (Admin)<br />" +
                     "- " + hashColor('newxluffy', true) + " (Admin)<br />" +
                    "- " + hashColor('herminchan', true) + " (Admin)<br />" +
                    "- " + hashColor('Neko♣chechir', true) + " (Leader)<br />" +
					"<br />" +
					"<u>Development:</u><br />" +
					"- " + hashColor('Distrib', true) + " (Développeur, Traducteur)<br />" +
					"- " + hashColor('Saitochi', true) + " (Traducteur)<br />" +
					"- " + hashColor('Wally the bully', true) + " (Server CSS)<br />" +
					"<br />" +
					"<u>Remerciment aux:</u><br />" +
					"- Equipe actuelle du staff<br />" +
					"- Nos utilisateurs réguliers<br />");
	},
	    regle: function(target, room, user) {
        target = user.userid;
        target = this.splitTarget(target);
        var targetUser = this.targetUser;
        if(targetUser) {
            targetUser.popup('|html|<p>Voici le règlement du serveur, veuillez le lire attentivement.</p><br/><p>Règle N°1: Respectez les autres membres et ne traité pas, peu importe le prétexte. Si Une personne vous manque de respect, contactez un membre du staff (%Driver, @Modérateur ou &Leader).  Si vous répliquez au lieu de prévenir, votre plainte ne sera pas prise en compte et vous serez autant puni que cette personne.</p><br/><p>Règle N°2: Le serveur possède un système de rangs. Veuillez respecter la hiérarchie (%Driver, @Modérateur, &Leader, ~Administrateur, etc). Aucune sanction non justifiée et tolérée. Si un membre du staff venait à abuser de ses droits, contactez un &Leader ou un ~Administrateur en lui envoyant une capture de PC.</p><br/><p>Règle N°3: Le staff est mis en place par les administrateurs. Veuillez ne pas contester un promote ou un demote effectué par un ~Administrateur et ne demandez pas aux membres du staff un promote (+Voice etc). Ces derniers jugent bon de promote ou de demote un membre en fonction de sa présence et de son implication sur le serveur.</p><br/><p>Règle N°4: Les décisions sont prises par le Staff (%, @, &, ~). Ces derniers sont donc les seuls autorisés à prendre des décisions importantes mais dans certains cas les administrateurs peuvent être les seuls habilités à prendre la ou les décisions.</p><br/><p>Règle N°5: Les bucks sont la monnaie virtuelle. Ils se gagnent lors de tournois, de mini-jeux. Les boutons provoquant un transfert automatique de bucks sont également interdits , entraînent des lourdes sanction et cela vaut pour toutes les salles du serveur.</p><br/><p>Règle N°6: Plusieurs actes sont passibles de sanctions, comme par exemple le spam, le flood, la vulgarité. Les sanctions peuvent être prises par notre Robot qui surveille les éventuels manquements aux règles. Plusieurs sanctions sont possibles comme le mute, le lock, ou le ban. Tout bold non autorisé sera sanctionné.</p><br/><p>Règle N°7: Le lobby est un lieu qui représente le serveur, c le lieux depuis lequel les nouveaux arrivants se forgent une image du serveur. Le langage doit donc y être respectueux. Les discussions liées au sexe, que ce soit en privé ou dans le chat, sont formellement interdites par Pokémon Showdown et par conséquent. Veuillez donc évitez ce genre de discussion. Évitez également les messages à tendance raciste.</p><br/><p>Règle N°8: Les liens sont interditst un sujet intéressant. Tout lien publié étant publicitaire, choquant, ou considéré comme hors sujet par un membre du staff devra être immédiatement supprimé par le biais un warn puis  sanction supérieure en cas de récidive ou si le lien posté est considéré comme méritant une sanction plus lourde.</p><br/><p>Règle N°9. Si un membre du staff reçoit une plainte, votre rang dans la room sera supprimée par un ~Administrateur ou par le #Room Owner. Leak (donner le lien ou le nom sur une room publique) une room secrète sera passible de sanction.</p><br/><p>Merci de lire le réglement. <h3>Règlement du serveur bigbang</h3></p>');
        }
    },
 
};


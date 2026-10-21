// Launcher language. The page and the launcher write their texts in English; this file shows them in the chosen
// language: every text node (and title/placeholder) is looked up in D, whole, or in PATTERNS when it carries a name or
// a number. A MutationObserver covers the texts the page and the launcher set later. The choice is kept in this
// page's storage; with none, the Windows language is used (English when it is not one of these).
(() => {
  const LANGS = [['en', 'English'], ['pt-BR', 'Português (Brasil)'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano']];
  const COL = {'pt-BR': 0, es: 1, fr: 2, de: 3, it: 4};
  // English: [Português (Brasil), Español, Français, Deutsch, Italiano]
  const D = {
    'Home': ['Início', 'Inicio', 'Accueil', 'Start', 'Home'],
    'Social': ['Social', 'Social', 'Social', 'Social', 'Social'],
    'Matches': ['Partidas', 'Partidas', 'Matchs', 'Spiele', 'Partite'],
    'Online': ['Online', 'En línea', 'En ligne', 'Online', 'Online'],
    'Display': ['Tela', 'Pantalla', 'Affichage', 'Anzeige', 'Schermo'],
    'Graphics': ['Gráficos', 'Gráficos', 'Graphismes', 'Grafik', 'Grafica'],
    'Performance': ['Desempenho', 'Rendimiento', 'Performances', 'Leistung', 'Prestazioni'],
    'Controls': ['Controles', 'Controles', 'Commandes', 'Steuerung', 'Comandi'],
    'Advanced': ['Avançado', 'Avanzado', 'Avancé', 'Erweitert', 'Avanzate'],
    'CREDITS': ['CRÉDITOS', 'CRÉDITOS', 'CRÉDITS', 'CREDITS', 'CREDITI'],
    'Performance ·': ['Desempenho ·', 'Rendimiento ·', 'Performances ·', 'Leistung ·', 'Prestazioni ·'],
    'PT-BR translation ·': ['Tradução PT-BR ·', 'Traducción PT-BR ·', 'Traduction PT-BR ·', 'PT-BR-Übersetzung ·', 'Traduzione PT-BR ·'],
    'Offline': ['Offline', 'Sin conexión', 'Hors ligne', 'Offline', 'Offline'],
    'Not set up': ['Não configurado', 'Sin configurar', 'Non configuré', 'Nicht eingerichtet', 'Non configurato'],
    'Minimize': ['Minimizar', 'Minimizar', 'Réduire', 'Minimieren', 'Riduci a icona'],
    'Close': ['Fechar', 'Cerrar', 'Fermer', 'Schließen', 'Chiudi'],

    'is back online.': ['voltou ao online.', 'vuelve a estar en línea.', 'est de retour en ligne.', 'ist wieder online.', 'è di nuovo online.'],
    'Division Match, weekly Cups and Friend Matches with real players. Pick up where you left off.': [
      'Partidas de Divisão, Copas semanais e Partidas entre Amigos com jogadores reais. Continue de onde parou.',
      'Partidos de División, Copas semanales y Partidos entre Amigos con jugadores reales. Continúa donde lo dejaste.',
      'Matchs de Division, Coupes hebdomadaires et Matchs entre amis avec de vrais joueurs. Reprenez là où vous vous étiez arrêté.',
      'Divisionsspiele, wöchentliche Pokale und Freundschaftsspiele mit echten Spielern. Mach weiter, wo du aufgehört hast.',
      'Partite di Divisione, Coppe settimanali e Partite tra amici con giocatori veri. Riprendi da dove avevi lasciato.'],
    'PLAY': ['JOGAR', 'JUGAR', 'JOUER', 'SPIELEN', 'GIOCA'],
    'PLAYING': ['JOGANDO', 'JUGANDO', 'EN JEU', 'LÄUFT', 'IN GIOCO'],
    'ONLINE NOW': ['ONLINE AGORA', 'EN LÍNEA AHORA', 'EN LIGNE', 'JETZT ONLINE', 'ONLINE ORA'],
    'on your server': ['no seu servidor', 'en tu servidor', 'sur votre serveur', 'auf deinem Server', 'sul tuo server'],
    'SERVER': ['SERVIDOR', 'SERVIDOR', 'SERVEUR', 'SERVER', 'SERVER'],
    'GRAPHICS': ['GRÁFICOS', 'GRÁFICOS', 'GRAPHISMES', 'GRAFIK', 'GRAFICA'],
    'LAST SESSION': ['ÚLTIMA SESSÃO', 'ÚLTIMA SESIÓN', 'DERNIÈRE SESSION', 'LETZTE SITZUNG', 'ULTIMA SESSIONE'],
    'server offline': ['servidor offline', 'servidor sin conexión', 'serveur hors ligne', 'Server offline', 'server offline'],
    'Ready to play online': ['Pronto para jogar online', 'Listo para jugar en línea', 'Prêt à jouer en ligne', 'Bereit für Online-Spiele', 'Pronto per giocare online'],
    'Playing': ['Jogando', 'Jugando', 'En jeu', 'Im Spiel', 'In gioco'],
    'Online is off': ['Online desligado', 'En línea desactivado', 'En ligne désactivé', 'Online ist aus', 'Online disattivato'],
    'Ready to play offline (online is off)': ['Pronto para jogar offline (online desligado)', 'Listo para jugar sin conexión (en línea desactivado)',
      'Prêt à jouer hors ligne (en ligne désactivé)', 'Bereit zum Offline-Spielen (Online ist aus)', 'Pronto per giocare offline (online disattivato)'],
    'Online is not set up. Run the online patch again': ['O online não está configurado. Execute o patch online de novo',
      'El modo en línea no está configurado. Vuelve a ejecutar el parche en línea', "Le jeu en ligne n'est pas configuré. Relancez le patch en ligne",
      'Online ist nicht eingerichtet. Führe den Online-Patch erneut aus', "L'online non è configurato. Esegui di nuovo la patch online"],
    'Starting ReStreet...': ['Iniciando o ReStreet...', 'Iniciando ReStreet...', 'Lancement de ReStreet...', 'ReStreet wird gestartet...', 'Avvio di ReStreet...'],
    'Launch failed': ['Falha ao iniciar', 'Error al iniciar', 'Échec du lancement', 'Start fehlgeschlagen', 'Avvio non riuscito'],
    'Check your settings': ['Verifique suas configurações', 'Revisa tu configuración', 'Vérifiez vos réglages', 'Prüfe deine Einstellungen', 'Controlla le impostazioni'],
    'Could not start the game': ['Não foi possível iniciar o jogo', 'No se pudo iniciar el juego', 'Impossible de lancer le jeu', 'Das Spiel konnte nicht gestartet werden', 'Impossibile avviare il gioco'],
    'High internal resolution may reduce FPS': ['Resolução interna alta pode reduzir o FPS', 'Una resolución interna alta puede reducir los FPS',
      'Une résolution interne élevée peut réduire les FPS', 'Hohe interne Auflösung kann die FPS senken', 'Una risoluzione interna alta può ridurre gli FPS'],
    'Downloading the update...': ['Baixando a atualização...', 'Descargando la actualización...', 'Téléchargement de la mise à jour...', 'Update wird heruntergeladen...', "Download dell'aggiornamento..."],
    'Checking and installing. The launcher will reopen by itself.': ['Verificando e instalando. O launcher vai reabrir sozinho.',
      'Comprobando e instalando. El launcher se volverá a abrir solo.', 'Vérification et installation. Le launcher se rouvrira tout seul.',
      'Wird geprüft und installiert. Der Launcher öffnet sich danach von selbst.', 'Verifica e installazione. Il launcher si riaprirà da solo.'],
    'Update available': ['Atualização disponível', 'Actualización disponible', 'Mise à jour disponible', 'Update verfügbar', 'Aggiornamento disponibile'],
    'A new version of ReStreet is ready. The launcher downloads it from GitHub, checks it and installs it for you. Your name, server and saves are kept.': [
      'Uma nova versão do ReStreet está pronta. O launcher baixa do GitHub, verifica e instala para você. Seu nome, servidor e saves são mantidos.',
      'Hay una nueva versión de ReStreet lista. El launcher la descarga de GitHub, la comprueba y la instala por ti. Se conservan tu nombre, servidor y partidas guardadas.',
      "Une nouvelle version de ReStreet est prête. Le launcher la télécharge depuis GitHub, la vérifie et l'installe pour vous. Votre nom, votre serveur et vos sauvegardes sont conservés.",
      'Eine neue Version von ReStreet ist bereit. Der Launcher lädt sie von GitHub, prüft sie und installiert sie für dich. Name, Server und Spielstände bleiben erhalten.',
      'Una nuova versione di ReStreet è pronta. Il launcher la scarica da GitHub, la verifica e la installa per te. Nome, server e salvataggi vengono mantenuti.'],
    'Update now': ['Atualizar agora', 'Actualizar ahora', 'Mettre à jour', 'Jetzt aktualisieren', 'Aggiorna ora'],
    'Update': ['Atualizar', 'Actualizar', 'Mettre à jour', 'Aktualisieren', 'Aggiorna'],
    'Later': ['Depois', 'Más tarde', 'Plus tard', 'Später', 'Più tardi'],
    'Help make ReStreet faster': ['Ajude a deixar o ReStreet mais rápido', 'Ayuda a que ReStreet sea más rápido', 'Aidez à rendre ReStreet plus rapide',
      'Hilf mit, ReStreet schneller zu machen', 'Aiuta a rendere ReStreet più veloce'],
    'After each session, send an anonymous performance report: your graphics card, processor, memory, settings and FPS. No name, no account. You can turn it off in Advanced.': [
      'Depois de cada sessão, envia um relatório anônimo de desempenho: placa de vídeo, processador, memória, configurações e FPS. Sem nome, sem conta. Dá para desligar em Avançado.',
      'Después de cada sesión, envía un informe de rendimiento anónimo: tarjeta gráfica, procesador, memoria, configuración y FPS. Sin nombre ni cuenta. Puedes desactivarlo en Avanzado.',
      'Après chaque session, envoie un rapport de performances anonyme : carte graphique, processeur, mémoire, réglages et FPS. Sans nom ni compte. Désactivable dans Avancé.',
      'Sendet nach jeder Sitzung einen anonymen Leistungsbericht: Grafikkarte, Prozessor, Speicher, Einstellungen und FPS. Kein Name, kein Konto. Unter Erweitert abschaltbar.',
      'Dopo ogni sessione invia un report anonimo sulle prestazioni: scheda video, processore, memoria, impostazioni e FPS. Nessun nome, nessun account. Puoi disattivarlo in Avanzate.'],
    'Share': ['Compartilhar', 'Compartir', 'Partager', 'Teilen', 'Condividi'],
    'No thanks': ['Não, obrigado', 'No, gracias', 'Non merci', 'Nein danke', 'No, grazie'],

    'Friends': ['Amigos', 'Amigos', 'Amis', 'Freunde', 'Amici'],
    'Requests': ['Pedidos', 'Solicitudes', 'Demandes', 'Anfragen', 'Richieste'],
    'Add a friend by name': ['Adicionar amigo pelo nome', 'Añadir un amigo por nombre', 'Ajouter un ami par son nom', 'Freund per Name hinzufügen', 'Aggiungi un amico per nome'],
    'Add friend': ['Adicionar amigo', 'Añadir amigo', 'Ajouter en ami', 'Als Freund hinzufügen', 'Aggiungi amico'],
    'Add friends from the Online list': ['Adicione amigos pela lista Online', 'Añade amigos desde la lista En línea', 'Ajoutez des amis depuis la liste En ligne',
      'Füge Freunde aus der Online-Liste hinzu', 'Aggiungi amici dalla lista Online'],
    'No requests': ['Nenhum pedido', 'Sin solicitudes', 'Aucune demande', 'Keine Anfragen', 'Nessuna richiesta'],
    'Nobody online': ['Ninguém online', 'Nadie en línea', 'Personne en ligne', 'Niemand online', 'Nessuno online'],
    'Wants to be your friend': ['Quer ser seu amigo', 'Quiere ser tu amigo', 'Veut être votre ami', 'Möchte dein Freund sein', 'Vuole essere tuo amico'],
    'Request sent': ['Pedido enviado', 'Solicitud enviada', 'Demande envoyée', 'Anfrage gesendet', 'Richiesta inviata'],
    'Remove friend': ['Remover amigo', 'Eliminar amigo', "Retirer l'ami", 'Freund entfernen', 'Rimuovi amico'],
    'Block': ['Bloquear', 'Bloquear', 'Bloquer', 'Blockieren', 'Blocca'],
    'Message': ['Mensagem', 'Mensaje', 'Message', 'Nachricht', 'Messaggio'],
    'Send message': ['Enviar mensagem', 'Enviar mensaje', 'Envoyer un message', 'Nachricht senden', 'Invia messaggio'],
    'Send': ['Enviar', 'Enviar', 'Envoyer', 'Senden', 'Invia'],
    'Report message': ['Denunciar mensagem', 'Denunciar mensaje', 'Signaler le message', 'Nachricht melden', 'Segnala messaggio'],
    'be nice, chat is moderated': ['seja gentil, o chat é moderado', 'sé amable, el chat está moderado', 'soyez sympa, le chat est modéré',
      'sei nett, der Chat wird moderiert', 'sii gentile, la chat è moderata'],
    'Chat is not available on this server yet': ['O chat ainda não está disponível neste servidor', 'El chat aún no está disponible en este servidor',
      "Le chat n'est pas encore disponible sur ce serveur", 'Der Chat ist auf diesem Server noch nicht verfügbar', 'La chat non è ancora disponibile su questo server'],
    'Online patch not installed': ['Patch online não instalado', 'Parche en línea no instalado', 'Patch en ligne non installé', 'Online-Patch nicht installiert', 'Patch online non installata'],
    'Server': ['Servidor', 'Servidor', 'Serveur', 'Server', 'Server'],

    'Post a match or join one. Keep the game closed: when someone joins, ReStreet opens for both of you straight into the match lobby.': [
      'Crie uma partida ou entre numa. Deixe o jogo fechado: quando alguém entrar, o ReStreet abre para os dois direto no lobby da partida.',
      'Publica una partida o únete a una. Mantén el juego cerrado: cuando alguien se una, ReStreet se abrirá para los dos directamente en la sala de la partida.',
      "Créez un match ou rejoignez-en un. Gardez le jeu fermé : quand quelqu'un rejoint, ReStreet s'ouvre pour vous deux directement dans le salon du match.",
      'Erstelle ein Spiel oder tritt einem bei. Lass das Spiel geschlossen: Sobald jemand beitritt, öffnet sich ReStreet für euch beide direkt in der Spiellobby.',
      'Crea una partita o unisciti a una. Tieni il gioco chiuso: quando qualcuno entra, ReStreet si apre per entrambi direttamente nella lobby della partita.'],
    'OPEN MATCHES': ['PARTIDAS ABERTAS', 'PARTIDAS ABIERTAS', 'MATCHS OUVERTS', 'OFFENE SPIELE', 'PARTITE APERTE'],
    'LOOKING FOR A MATCH IN THE GAME': ['PROCURANDO PARTIDA NO JOGO', 'BUSCANDO PARTIDA EN EL JUEGO', 'EN RECHERCHE DE MATCH DANS LE JEU', 'SUCHEN IM SPIEL', 'IN CERCA DI UNA PARTITA NEL GIOCO'],
    'Nobody is searching in the game right now.': ['Ninguém está procurando no jogo agora.', 'Nadie está buscando en el juego ahora mismo.',
      'Personne ne cherche dans le jeu pour le moment.', 'Gerade sucht niemand im Spiel.', 'Nessuno sta cercando nel gioco in questo momento.'],
    'Search the same mode in the game (Xbox LIVE) to be paired with them.': ['Procure o mesmo modo no jogo (Xbox LIVE) para jogar com eles.',
      'Busca el mismo modo en el juego (Xbox LIVE) para emparejarte con ellos.', 'Cherchez le même mode dans le jeu (Xbox LIVE) pour être associé à eux.',
      'Suche im Spiel (Xbox LIVE) denselben Modus, um mit ihnen gepaart zu werden.', 'Cerca la stessa modalità nel gioco (Xbox LIVE) per essere abbinato a loro.'],
    'No open matches right now. Post one and anyone on your server can join.': ['Nenhuma partida aberta agora. Crie uma e qualquer pessoa do seu servidor pode entrar.',
      'No hay partidas abiertas ahora mismo. Publica una y cualquiera de tu servidor podrá unirse.',
      "Aucun match ouvert pour le moment. Créez-en un et n'importe qui sur votre serveur pourra le rejoindre.",
      'Gerade gibt es keine offenen Spiele. Erstelle eins, dann kann jeder auf deinem Server beitreten.',
      'Nessuna partita aperta al momento. Creane una e chiunque sul tuo server potrà unirsi.'],
    '▶ Post match': ['▶ Criar partida', '▶ Publicar partida', '▶ Créer un match', '▶ Spiel erstellen', '▶ Crea partita'],
    'POST': ['CRIAR', 'PUBLICAR', 'CRÉER', 'ERSTELLEN', 'CREA'],
    'Title (optional), e.g. Chill 5-a-side, no skills spam': ['Título (opcional), ex.: 5 contra 5 tranquilo, sem spam de dribles',
      'Título (opcional), p. ej.: 5 contra 5 tranquilo, sin abusar de regates', 'Titre (facultatif), ex. : 5 contre 5 tranquille, sans spam de gestes',
      'Titel (optional), z. B. Entspanntes 5 gegen 5, kein Trick-Spam', 'Titolo (facoltativo), es.: 5 contro 5 tranquillo, niente spam di trick'],
    '5-a-side': ['5 contra 5', '5 contra 5', '5 contre 5', '5 gegen 5', '5 contro 5'],
    '6-a-side': ['6 contra 6', '6 contra 6', '6 contre 6', '6 gegen 6', '6 contro 6'],
    'Leave': ['Sair', 'Salir', 'Quitter', 'Verlassen', 'Esci'],
    'Leave game': ['Sair da partida', 'Salir de la partida', 'Quitter la partie', 'Spiel verlassen', 'Lascia la partita'],
    'Full': ['Cheia', 'Llena', 'Complet', 'Voll', 'Piena'],
    'Game ready!': ['Partida pronta!', '¡Partida lista!', 'Match prêt !', 'Spiel bereit!', 'Partita pronta!'],
    "Both players are in. Press PLAY: the game opens and takes you to the match by itself. Don't touch anything until the match set-up appears.": [
      'Os dois jogadores estão dentro. Aperte JOGAR: o jogo abre e leva você até a partida sozinho. Não toque em nada até aparecer a configuração da partida.',
      'Los dos jugadores están dentro. Pulsa JUGAR: el juego se abre y te lleva solo a la partida. No toques nada hasta que aparezca la configuración de la partida.',
      "Les deux joueurs sont là. Appuyez sur JOUER : le jeu s'ouvre et vous emmène tout seul au match. Ne touchez à rien jusqu'à l'écran de configuration du match.",
      'Beide Spieler sind drin. Drück SPIELEN: Das Spiel öffnet sich und bringt dich von selbst zum Spiel. Nichts anfassen, bis die Spieleinrichtung erscheint.',
      'Entrambi i giocatori sono dentro. Premi GIOCA: il gioco si apre e ti porta da solo alla partita. Non toccare nulla finché non compare la configurazione della partita.'],
    'Your game is restarting so it can open the match by itself.': ['Seu jogo está reiniciando para abrir a partida sozinho.',
      'Tu juego se está reiniciando para abrir la partida solo.', 'Votre jeu redémarre pour ouvrir le match tout seul.',
      'Dein Spiel startet neu, um das Spiel von selbst zu öffnen.', 'Il tuo gioco si sta riavviando per aprire la partita da solo.'],

    'Your online name and the server you play on. Each server has its own players, seasons and friends.': [
      'Seu nome online e o servidor onde você joga. Cada servidor tem seus próprios jogadores, temporadas e amigos.',
      'Tu nombre en línea y el servidor en el que juegas. Cada servidor tiene sus propios jugadores, temporadas y amigos.',
      'Votre nom en ligne et le serveur sur lequel vous jouez. Chaque serveur a ses propres joueurs, saisons et amis.',
      'Dein Online-Name und der Server, auf dem du spielst. Jeder Server hat eigene Spieler, Saisons und Freunde.',
      'Il tuo nome online e il server su cui giochi. Ogni server ha i suoi giocatori, stagioni e amici.'],
    'PLAY MODE': ['MODO DE JOGO', 'MODO DE JUEGO', 'MODE DE JEU', 'SPIELMODUS', 'MODALITÀ DI GIOCO'],
    'Play online': ['Jogar online', 'Jugar en línea', 'Jouer en ligne', 'Online spielen', 'Gioca online'],
    'Off: the game starts offline, with no server, friends or rooms.': ['Desligado: o jogo abre offline, sem servidor, amigos nem salas.',
      'Desactivado: el juego se abre sin conexión, sin servidor, amigos ni salas.', 'Désactivé : le jeu démarre hors ligne, sans serveur, amis ni salons.',
      'Aus: Das Spiel startet offline, ohne Server, Freunde und Räume.', 'Disattivato: il gioco parte offline, senza server, amici né stanze.'],
    'ACCOUNT': ['CONTA', 'CUENTA', 'COMPTE', 'KONTO', 'ACCOUNT'],
    'ONLINE NAME': ['NOME ONLINE', 'NOMBRE EN LÍNEA', 'NOM EN LIGNE', 'ONLINE-NAME', 'NOME ONLINE'],
    'STATUS': ['STATUS', 'ESTADO', 'STATUT', 'STATUS', 'STATO'],
    'To change your online name, run the online patch again.': ['Para mudar seu nome online, execute o patch online de novo.',
      'Para cambiar tu nombre en línea, vuelve a ejecutar el parche en línea.', 'Pour changer votre nom en ligne, relancez le patch en ligne.',
      'Um deinen Online-Namen zu ändern, führe den Online-Patch erneut aus.', 'Per cambiare il nome online, esegui di nuovo la patch online.'],

    'Screen, refresh rate and language.': ['Tela, taxa de atualização e idioma.', 'Pantalla, frecuencia de actualización e idioma.',
      'Écran, fréquence de rafraîchissement et langue.', 'Bildschirm, Bildwiederholrate und Sprache.', 'Schermo, frequenza di aggiornamento e lingua.'],
    'RESOLUTION': ['RESOLUÇÃO', 'RESOLUCIÓN', 'RÉSOLUTION', 'AUFLÖSUNG', 'RISOLUZIONE'],
    'REFRESH RATE': ['TAXA DE ATUALIZAÇÃO', 'FRECUENCIA', 'FRÉQUENCE', 'BILDWIEDERHOLRATE', 'FREQUENZA'],
    'DISPLAY MODE': ['MODO DE TELA', 'MODO DE PANTALLA', "MODE D'AFFICHAGE", 'ANZEIGEMODUS', 'MODALITÀ SCHERMO'],
    'MONITOR': ['MONITOR', 'MONITOR', 'ÉCRAN', 'MONITOR', 'MONITOR'],
    'GAME LANGUAGE': ['IDIOMA DO JOGO', 'IDIOMA DEL JUEGO', 'LANGUE DU JEU', 'SPIELSPRACHE', 'LINGUA DEL GIOCO'],
    'LAUNCHER LANGUAGE': ['IDIOMA DO LAUNCHER', 'IDIOMA DEL LAUNCHER', 'LANGUE DU LAUNCHER', 'LAUNCHER-SPRACHE', 'LINGUA DEL LAUNCHER'],
    'SYNC': ['SINCRONIZAÇÃO', 'SINCRONIZACIÓN', 'SYNCHRO', 'SYNCHRONISATION', 'SINCRONIZZAZIONE'],
    'No tearing, a new frame every refresh': ['Sem tearing, um quadro novo a cada atualização', 'Sin tearing, un fotograma nuevo en cada refresco',
      'Sans déchirure, une nouvelle image à chaque rafraîchissement', 'Kein Tearing, ein neues Bild pro Bildaufbau', 'Niente tearing, un nuovo fotogramma a ogni aggiornamento'],
    'Fullscreen': ['Tela cheia', 'Pantalla completa', 'Plein écran', 'Vollbild', 'Schermo intero'],
    'Windowed': ['Janela', 'Ventana', 'Fenêtré', 'Fenster', 'Finestra'],

    'Quality and performance. Weaker PC? Use 1x internal resolution and turn off ambient occlusion and MSAA.': [
      'Qualidade e desempenho. PC mais fraco? Use resolução interna 1x e desligue a oclusão ambiente e o MSAA.',
      'Calidad y rendimiento. ¿PC menos potente? Usa resolución interna 1x y desactiva la oclusión ambiental y el MSAA.',
      "Qualité et performances. PC moins puissant ? Utilisez la résolution interne 1x et désactivez l'occlusion ambiante et le MSAA.",
      'Qualität und Leistung. Schwächerer PC? Nutze interne Auflösung 1x und schalte Umgebungsverdeckung und MSAA aus.',
      "Qualità e prestazioni. PC meno potente? Usa la risoluzione interna 1x e disattiva l'occlusione ambientale e l'MSAA."],
    'PROFILE': ['PERFIL', 'PERFIL', 'PROFIL', 'PROFIL', 'PROFILO'],
    'GRAPHICS API': ['API GRÁFICA', 'API GRÁFICA', 'API GRAPHIQUE', 'GRAFIK-API', 'API GRAFICA'],
    'POST-PROCESSING': ['PÓS-PROCESSAMENTO', 'POSPROCESADO', 'POST-TRAITEMENT', 'NACHBEARBEITUNG', 'POST-ELABORAZIONE'],
    'INTERNAL RESOLUTION': ['RESOLUÇÃO INTERNA', 'RESOLUCIÓN INTERNA', 'RÉSOLUTION INTERNE', 'INTERNE AUFLÖSUNG', 'RISOLUZIONE INTERNA'],
    'ANTI-ALIASING': ['ANTISSERRILHAMENTO', 'ANTIALIASING', 'ANTICRÉNELAGE', 'KANTENGLÄTTUNG', 'ANTIALIASING'],
    'Native 2x MSAA': ['MSAA 2x nativo', 'MSAA 2x nativo', 'MSAA 2x natif', 'Natives 2x MSAA', 'MSAA 2x nativo'],
    'Smoother edges, costs performance': ['Bordas mais suaves, custa desempenho', 'Bordes más suaves, cuesta rendimiento',
      'Bords plus lisses, coûte des performances', 'Glattere Kanten, kostet Leistung', 'Bordi più morbidi, costa prestazioni'],
    'Balanced (default)': ['Equilibrado (padrão)', 'Equilibrado (predeterminado)', 'Équilibré (par défaut)', 'Ausgewogen (Standard)', 'Bilanciato (predefinito)'],
    'Quality (strong PCs)': ['Qualidade (PCs fortes)', 'Calidad (PC potentes)', 'Qualité (PC puissants)', 'Qualität (starke PCs)', 'Qualità (PC potenti)'],
    'Performance (weak PCs)': ['Desempenho (PCs fracos)', 'Rendimiento (PC modestos)', 'Performances (PC modestes)', 'Leistung (schwache PCs)', 'Prestazioni (PC deboli)'],
    'Custom': ['Personalizado', 'Personalizado', 'Personnalisé', 'Benutzerdefiniert', 'Personalizzato'],
    'None': ['Nenhum', 'Ninguno', 'Aucun', 'Keins', 'Nessuno'],
    'FXAA Extreme': ['FXAA extremo', 'FXAA extremo', 'FXAA extrême', 'FXAA extrem', 'FXAA estremo'],
    '1x - Native (1280 x 720)': ['1x - Nativa (1280 x 720)', '1x - Nativa (1280 x 720)', '1x - Native (1280 x 720)', '1x - Nativ (1280 x 720)', '1x - Nativa (1280 x 720)'],
    'Automatic': ['Automático', 'Automático', 'Automatique', 'Automatisch', 'Automatico'],
    'FRAME RATE LIMIT': ['LIMITE DE QUADROS', 'LÍMITE DE FOTOGRAMAS', "LIMITE D'IMAGES", 'BILDRATENBEGRENZUNG', 'LIMITE FOTOGRAMMI'],
    'SCALING': ['ESCALA', 'ESCALADO', "MISE À L'ÉCHELLE", 'SKALIERUNG', 'SCALATURA'],
    'ASPECT RATIO': ['PROPORÇÃO', 'PROPORCIÓN', "FORMAT D'IMAGE", 'SEITENVERHÄLTNIS', 'PROPORZIONI'],
    'ANISOTROPIC FILTERING': ['FILTRO ANISOTRÓPICO', 'FILTRADO ANISOTRÓPICO', 'FILTRAGE ANISOTROPE', 'ANISOTROPE FILTERUNG', 'FILTRO ANISOTROPICO'],
    'AMBIENT OCCLUSION': ['OCLUSÃO AMBIENTE', 'OCLUSIÓN AMBIENTAL', 'OCCLUSION AMBIANTE', 'UMGEBUNGSVERDECKUNG', 'OCCLUSIONE AMBIENTALE'],
    'Game MSAA (4x in 3D)': ['MSAA do jogo (4x no 3D)', 'MSAA del juego (4x en 3D)', 'MSAA du jeu (4x en 3D)', 'MSAA des Spiels (4x in 3D)', 'MSAA del gioco (4x nel 3D)'],
    'Bilinear': ['Bilinear', 'Bilineal', 'Bilinéaire', 'Bilinear', 'Bilineare'],
    'FSR 1 Quality': ['FSR 1 Qualidade', 'FSR 1 Calidad', 'FSR 1 Qualité', 'FSR 1 Qualität', 'FSR 1 Qualità'],
    'FSR 1 Balanced': ['FSR 1 Equilibrado', 'FSR 1 Equilibrado', 'FSR 1 Équilibré', 'FSR 1 Ausgewogen', 'FSR 1 Bilanciato'],
    'FSR 1 Performance': ['FSR 1 Desempenho', 'FSR 1 Rendimiento', 'FSR 1 Performances', 'FSR 1 Leistung', 'FSR 1 Prestazioni'],
    'FSR 1 Ultra Performance': ['FSR 1 Ultra desempenho', 'FSR 1 Ultra rendimiento', 'FSR 1 Ultra performances', 'FSR 1 Ultra-Leistung', 'FSR 1 Ultra prestazioni'],
    'Match screen': ['Igual à tela', 'Igual que la pantalla', "Comme l'écran", 'Wie der Bildschirm', 'Come lo schermo'],
    '16:9 (console)': ['16:9 (console)', '16:9 (consola)', '16:9 (console)', '16:9 (Konsole)', '16:9 (console)'],
    'Screen refresh rate': ['Taxa da tela', 'Frecuencia de la pantalla', "Fréquence de l'écran", 'Bildwiederholrate', 'Frequenza dello schermo'],
    'No limit': ['Sem limite', 'Sin límite', 'Sans limite', 'Kein Limit', 'Nessun limite'],
    'Game default': ['Padrão do jogo', 'El del juego', 'Celui du jeu', 'Wie das Spiel', 'Quello del gioco'],
    'Off': ['Desligado', 'Desactivado', 'Désactivé', 'Aus', 'Disattivato'],

    'How ReStreet ran on this PC in your last sessions. Matches, replays and menus are measured separately.': [
      'Como o ReStreet rodou neste PC nas suas últimas sessões. Partidas, replays e menus são medidos separadamente.',
      'Cómo funcionó ReStreet en este PC en tus últimas sesiones. Partidos, repeticiones y menús se miden por separado.',
      'Comment ReStreet a tourné sur ce PC lors de vos dernières sessions. Matchs, ralentis et menus sont mesurés séparément.',
      'Wie ReStreet in deinen letzten Sitzungen auf diesem PC lief. Spiele, Wiederholungen und Menüs werden getrennt gemessen.',
      'Come è andato ReStreet su questo PC nelle ultime sessioni. Partite, replay e menu sono misurati separatamente.'],
    'THIS PC': ['ESTE PC', 'ESTE PC', 'CE PC', 'DIESER PC', 'QUESTO PC'],
    'GRAPHICS CARD USED': ['PLACA DE VÍDEO USADA', 'TARJETA GRÁFICA USADA', 'CARTE GRAPHIQUE UTILISÉE', 'VERWENDETE GRAFIKKARTE', 'SCHEDA VIDEO USATA'],
    'LAST MATCH FPS': ['FPS DA ÚLTIMA PARTIDA', 'FPS DEL ÚLTIMO PARTIDO', 'FPS DU DERNIER MATCH', 'FPS LETZTES SPIEL', 'FPS ULTIMA PARTITA'],
    'AVERAGE (10 SESSIONS)': ['MÉDIA (10 SESSÕES)', 'MEDIA (10 SESIONES)', 'MOYENNE (10 SESSIONS)', 'DURCHSCHNITT (10 SITZUNGEN)', 'MEDIA (10 SESSIONI)'],
    'CRASHES': ['TRAVAMENTOS', 'CIERRES', 'PLANTAGES', 'ABSTÜRZE', 'CRASH'],
    'SESSIONS': ['SESSÕES', 'SESIONES', 'SESSIONS', 'SITZUNGEN', 'SESSIONI'],
    'WHEN': ['QUANDO', 'CUÁNDO', 'QUAND', 'WANN', 'QUANDO'],
    'MATCH': ['PARTIDA', 'PARTIDO', 'MATCH', 'SPIEL', 'PARTITA'],
    'MENUS': ['MENUS', 'MENÚS', 'MENUS', 'MENÜS', 'MENU'],
    'REPLAYS': ['REPLAYS', 'REPETICIONES', 'RALENTIS', 'WIEDERHOLUNGEN', 'REPLAY'],
    '1% LOW': ['1% MÍN.', '1% MÍN.', '1% MIN.', '1% TIEF', '1% MIN.'],
    'Play a session and your results appear here.': ['Jogue uma sessão e seus resultados aparecem aqui.', 'Juega una sesión y tus resultados aparecerán aquí.',
      'Jouez une session et vos résultats apparaîtront ici.', 'Spiel eine Sitzung, dann erscheinen hier deine Ergebnisse.', 'Gioca una sessione e i risultati appariranno qui.'],
    'crash': ['travou', 'cierre', 'plantage', 'Absturz', 'crash'],
    'in matches': ['nas partidas', 'en partidos', 'en match', 'in Spielen', 'nelle partite'],
    'average': ['média', 'media', 'moyenne', 'Durchschnitt', 'media'],
    'Share performance reports': ['Compartilhar relatórios de desempenho', 'Compartir informes de rendimiento', 'Partager les rapports de performances',
      'Leistungsberichte teilen', 'Condividi i report sulle prestazioni'],
    'The game ran on your': ['O jogo rodou na sua', 'El juego se ejecutó en tu', 'Le jeu a tourné sur votre', 'Das Spiel lief auf deiner', 'Il gioco è andato sulla tua'],
    'integrated graphics': ['placa de vídeo integrada', 'gráfica integrada', 'carte graphique intégrée', 'integrierten Grafik', 'grafica integrata'],
    'while this PC has a faster card. In Graphics, pick the dedicated card, or in Windows Settings > Display > Graphics set FifaStreet to High performance.': [
      'enquanto este PC tem uma placa mais rápida. Em Gráficos, escolha a placa dedicada, ou em Configurações do Windows > Tela > Gráficos defina o FifaStreet como Alto desempenho.',
      'mientras este PC tiene una tarjeta más rápida. En Gráficos, elige la tarjeta dedicada, o en Configuración de Windows > Pantalla > Gráficos pon FifaStreet en Alto rendimiento.',
      'alors que ce PC a une carte plus rapide. Dans Graphismes, choisissez la carte dédiée, ou dans Paramètres Windows > Affichage > Graphiques réglez FifaStreet sur Hautes performances.',
      'obwohl dieser PC eine schnellere Karte hat. Wähle unter Grafik die dedizierte Karte oder stelle in den Windows-Einstellungen > Anzeige > Grafik FifaStreet auf Hohe Leistung.',
      'mentre questo PC ha una scheda più veloce. In Grafica scegli la scheda dedicata, oppure in Impostazioni di Windows > Schermo > Grafica imposta FifaStreet su Prestazioni elevate.'],
    'Many stutters in matches. Keep': ['Muitos travamentos nas partidas. Mantenha', 'Muchos tirones en los partidos. Mantén', 'Beaucoup de saccades en match. Gardez',
      'Viele Ruckler in Spielen. Lass', 'Molti scatti nelle partite. Tieni'],
    'on; the first matches on a new PC stutter while shaders are built.': ['ligado; as primeiras partidas num PC novo travam enquanto os shaders são criados.',
      'activado; los primeros partidos en un PC nuevo tienen tirones mientras se crean los shaders.',
      'activé ; les premiers matchs sur un nouveau PC saccadent pendant la création des shaders.',
      'an; die ersten Spiele auf einem neuen PC ruckeln, während Shader erstellt werden.',
      'attivo; le prime partite su un PC nuovo scattano mentre vengono creati gli shader.'],
    'The game closed with an error in several recent sessions. Update your graphics driver, or open the logs in Advanced and send them to us on Discord.': [
      'O jogo fechou com erro em várias sessões recentes. Atualize o driver de vídeo, ou abra os logs em Avançado e mande para nós no Discord.',
      'El juego se cerró con un error en varias sesiones recientes. Actualiza el controlador gráfico, o abre los registros en Avanzado y envíanoslos por Discord.',
      "Le jeu s'est fermé avec une erreur lors de plusieurs sessions récentes. Mettez à jour le pilote graphique, ou ouvrez les journaux dans Avancé et envoyez-les-nous sur Discord.",
      'Das Spiel wurde in mehreren letzten Sitzungen mit einem Fehler beendet. Aktualisiere den Grafiktreiber oder öffne die Logs unter Erweitert und schick sie uns auf Discord.',
      'Il gioco si è chiuso con un errore in diverse sessioni recenti. Aggiorna il driver video, oppure apri i log in Avanzate e inviaceli su Discord.'],

    'Play without a controller. The keyboard works as an Xbox controller, so menus, matches and online all work; a controller still works too.': [
      'Jogue sem controle. O teclado funciona como um controle de Xbox, então menus, partidas e online funcionam; um controle também continua funcionando.',
      'Juega sin mando. El teclado funciona como un mando de Xbox, así que menús, partidos y en línea funcionan; un mando también sigue funcionando.',
      'Jouez sans manette. Le clavier fonctionne comme une manette Xbox : menus, matchs et jeu en ligne marchent ; une manette fonctionne aussi.',
      'Spiel ohne Controller. Die Tastatur funktioniert wie ein Xbox-Controller, also gehen Menüs, Spiele und Online; ein Controller geht trotzdem.',
      'Gioca senza controller. La tastiera funziona come un controller Xbox, quindi menu, partite e online funzionano; anche un controller continua a funzionare.'],
    'Play with keyboard': ['Jogar com teclado', 'Jugar con teclado', 'Jouer au clavier', 'Mit Tastatur spielen', 'Gioca con la tastiera'],
    'Turn on to use the keys below': ['Ligue para usar as teclas abaixo', 'Actívalo para usar las teclas de abajo', 'Activez pour utiliser les touches ci-dessous',
      'Einschalten, um die Tasten unten zu nutzen', 'Attiva per usare i tasti qui sotto'],
    'Mouse for skill moves': ['Mouse para dribles', 'Ratón para regates', 'Souris pour les gestes techniques', 'Maus für Tricks', 'Mouse per i trick'],
    'The mouse moves the right stick': ['O mouse move o analógico direito', 'El ratón mueve el stick derecho', 'La souris déplace le stick droit',
      'Die Maus bewegt den rechten Stick', 'Il mouse muove la levetta destra'],
    'Mouse sensitivity': ['Sensibilidade do mouse', 'Sensibilidad del ratón', 'Sensibilité de la souris', 'Mausempfindlichkeit', 'Sensibilità del mouse'],
    'LAYOUT': ['LAYOUT', 'DISPOSICIÓN', 'DISPOSITION', 'BELEGUNG', 'LAYOUT'],
    'Keyboard + mouse': ['Teclado + mouse', 'Teclado + ratón', 'Clavier + souris', 'Tastatur + Maus', 'Tastiera + mouse'],
    'Keyboard only': ['Só teclado', 'Solo teclado', 'Clavier seul', 'Nur Tastatur', 'Solo tastiera'],
    'Recommended. WASD to move, the mouse does skill moves; left click pass, right click shoot, middle click lob.': [
      'Recomendado. WASD para mover, o mouse faz os dribles; clique esquerdo passa, clique direito chuta, clique do meio lança.',
      'Recomendado. WASD para moverte, el ratón hace los regates; clic izquierdo pase, clic derecho tiro, clic central pase alto.',
      'Recommandé. WASD pour bouger, la souris fait les gestes techniques ; clic gauche passe, clic droit tir, clic du milieu lob.',
      'Empfohlen. WASD zum Bewegen, die Maus macht Tricks; Linksklick Pass, Rechtsklick Schuss, Mittelklick Lupfer.',
      'Consigliato. WASD per muoverti, il mouse fa i trick; clic sinistro passaggio, clic destro tiro, clic centrale pallonetto.'],
    'WASD to move, J pass, K shoot, L lob, I manual pass, arrows for skill moves.': [
      'WASD para mover, J passe, K chute, L lançamento, I passe manual, setas para dribles.',
      'WASD para moverte, J pase, K tiro, L pase alto, I pase manual, flechas para regates.',
      'WASD pour bouger, J passe, K tir, L lob, I passe manuelle, flèches pour les gestes techniques.',
      'WASD zum Bewegen, J Pass, K Schuss, L Lupfer, I manueller Pass, Pfeiltasten für Tricks.',
      'WASD per muoverti, J passaggio, K tiro, L pallonetto, I passaggio manuale, frecce per i trick.'],
    'Both: Shift sprint, Space Street Ball Control (hold), Q flair (hold), E juggle. Menus: Enter select, Backspace back, Esc pause.': [
      'Os dois: Shift corre, Space controle de bola (segurar), Q floreio (segurar), E embaixadinha. Menus: Enter seleciona, Backspace volta, Esc pausa.',
      'Ambos: Shift esprint, Space control del balón (mantener), Q floritura (mantener), E toques. Menús: Enter seleccionar, Backspace volver, Esc pausa.',
      'Les deux : Shift sprint, Space contrôle du ballon (maintenir), Q fioriture (maintenir), E jonglage. Menus : Enter valider, Backspace retour, Esc pause.',
      'Beide: Shift Sprint, Space Ballkontrolle (halten), Q Flair (halten), E Jonglieren. Menüs: Enter auswählen, Backspace zurück, Esc Pause.',
      'Entrambi: Shift scatto, Space controllo palla (tieni), Q flair (tieni), E palleggio. Menu: Enter seleziona, Backspace indietro, Esc pausa.'],
    'Click a key to change it, then press the new key (or a mouse button). Each action can have two keys.': [
      'Clique numa tecla para mudar e aperte a nova tecla (ou um botão do mouse). Cada ação pode ter duas teclas.',
      'Haz clic en una tecla para cambiarla y pulsa la nueva (o un botón del ratón). Cada acción puede tener dos teclas.',
      'Cliquez sur une touche pour la changer, puis appuyez sur la nouvelle (ou un bouton de souris). Chaque action peut avoir deux touches.',
      'Klick auf eine Taste, um sie zu ändern, dann drück die neue Taste (oder eine Maustaste). Jede Aktion kann zwei Tasten haben.',
      'Clicca un tasto per cambiarlo, poi premi il nuovo tasto (o un pulsante del mouse). Ogni azione può avere due tasti.'],
    'cancels,': ['cancela,', 'cancela,', 'annule,', 'bricht ab,', 'annulla,'],
    'right-click': ['clique direito', 'clic derecho', 'clic droit', 'Rechtsklick', 'clic destro'],
    'clears a key.': ['limpa uma tecla.', 'borra una tecla.', 'efface une touche.', 'löscht eine Taste.', 'cancella un tasto.'],
    'Press a key...': ['Aperte uma tecla...', 'Pulsa una tecla...', 'Appuyez sur une touche...', 'Drück eine Taste...', 'Premi un tasto...'],
    'That key cannot be used.': ['Essa tecla não pode ser usada.', 'Esa tecla no se puede usar.', 'Cette touche ne peut pas être utilisée.',
      'Diese Taste kann nicht verwendet werden.', 'Quel tasto non può essere usato.'],
    'Saved.': ['Salvo.', 'Guardado.', 'Enregistré.', 'Gespeichert.', 'Salvato.'],
    'Cancelled.': ['Cancelado.', 'Cancelado.', 'Annulé.', 'Abgebrochen.', 'Annullato.'],
    'MOVEMENT (LEFT STICK)': ['MOVIMENTO (ANALÓGICO ESQUERDO)', 'MOVIMIENTO (STICK IZQUIERDO)', 'DÉPLACEMENT (STICK GAUCHE)', 'BEWEGUNG (LINKER STICK)', 'MOVIMENTO (LEVETTA SINISTRA)'],
    'SKILL MOVES (RIGHT STICK)': ['DRIBLES (ANALÓGICO DIREITO)', 'REGATES (STICK DERECHO)', 'GESTES TECHNIQUES (STICK DROIT)', 'TRICKS (RECHTER STICK)', 'TRICK (LEVETTA DESTRA)'],
    'BUTTONS': ['BOTÕES', 'BOTONES', 'BOUTONS', 'TASTEN', 'PULSANTI'],
    'Move up': ['Mover para cima', 'Mover arriba', 'Aller en haut', 'Nach oben', 'Muovi su'],
    'Move down': ['Mover para baixo', 'Mover abajo', 'Aller en bas', 'Nach unten', 'Muovi giù'],
    'Move left': ['Mover para a esquerda', 'Mover a la izquierda', 'Aller à gauche', 'Nach links', 'Muovi a sinistra'],
    'Move right': ['Mover para a direita', 'Mover a la derecha', 'Aller à droite', 'Nach rechts', 'Muovi a destra'],
    'Left stick click': ['Clique do analógico esquerdo', 'Pulsar stick izquierdo', 'Clic stick gauche', 'Linken Stick drücken', 'Pressione levetta sinistra'],
    'Skill up': ['Drible para cima', 'Regate arriba', 'Geste en haut', 'Trick nach oben', 'Trick su'],
    'Skill down': ['Drible para baixo', 'Regate abajo', 'Geste en bas', 'Trick nach unten', 'Trick giù'],
    'Skill left': ['Drible para a esquerda', 'Regate a la izquierda', 'Geste à gauche', 'Trick nach links', 'Trick a sinistra'],
    'Skill right': ['Drible para a direita', 'Regate a la derecha', 'Geste à droite', 'Trick nach rechts', 'Trick a destra'],
    'Stand on the ball / neck stall': ['Pisar na bola / bola no pescoço', 'Pisar el balón / balón en la nuca', 'Pied sur le ballon / ballon sur la nuque',
      'Fuß auf den Ball / Ball im Nacken', 'Piede sulla palla / palla sul collo'],
    'Pass (tap twice for a one-two)': ['Passe (toque duas vezes para tabela)', 'Pase (pulsa dos veces para una pared)', 'Passe (deux fois pour un une-deux)',
      'Pass (zweimal tippen für Doppelpass)', 'Passaggio (premi due volte per un uno-due)'],
    'Shoot': ['Chutar', 'Tirar', 'Tirer', 'Schießen', 'Tira'],
    'Lob pass': ['Lançamento', 'Pase alto', 'Passe lobée', 'Lupfer', 'Pallonetto'],
    'Manual pass': ['Passe manual', 'Pase manual', 'Passe manuelle', 'Manueller Pass', 'Passaggio manuale'],
    'Hold: Street Ball Control / jockey': ['Segurar: controle de bola / marcação', 'Mantener: control del balón / marcar', 'Maintenir : contrôle du ballon / jockey',
      'Halten: Ballkontrolle / Stellen', 'Tieni: controllo palla / jockey'],
    'Sprint / Panna': ['Correr / Caneta', 'Esprint / Caño', 'Sprint / Petit pont', 'Sprint / Tunnel', 'Scatto / Tunnel'],
    'Hold: flair pass or shot': ['Segurar: passe ou chute de efeito', 'Mantener: pase o tiro de fantasía', 'Maintenir : passe ou tir de fantaisie',
      'Halten: Flair-Pass oder -Schuss', 'Tieni: passaggio o tiro di fantasia'],
    'Juggle (hold: knees)': ['Embaixadinha (segurar: joelhos)', 'Toques (mantener: rodillas)', 'Jonglage (maintenir : genoux)', 'Jonglieren (halten: Knie)', 'Palleggio (tieni: ginocchia)'],
    'Pause': ['Pausa', 'Pausa', 'Pause', 'Pause', 'Pausa'],
    'Back': ['Voltar', 'Atrás', 'Retour', 'Zurück', 'Indietro'],
    'D-pad up': ['Direcional para cima', 'Cruceta arriba', 'Croix haut', 'Steuerkreuz oben', 'Croce su'],
    'D-pad down': ['Direcional para baixo', 'Cruceta abajo', 'Croix bas', 'Steuerkreuz unten', 'Croce giù'],
    'D-pad left': ['Direcional para a esquerda', 'Cruceta izquierda', 'Croix gauche', 'Steuerkreuz links', 'Croce sinistra'],
    'D-pad right': ['Direcional para a direita', 'Cruceta derecha', 'Croix droite', 'Steuerkreuz rechts', 'Croce destra'],

    'Game files and renderer options for textures, lighting, black screens and stutter.': [
      'Arquivos do jogo e opções do renderizador para texturas, iluminação, telas pretas e travamentos.',
      'Archivos del juego y opciones del renderizador para texturas, iluminación, pantallas negras y tirones.',
      "Fichiers du jeu et options du rendu pour les textures, l'éclairage, les écrans noirs et les saccades.",
      'Spieldateien und Renderer-Optionen für Texturen, Beleuchtung, schwarze Bildschirme und Ruckler.',
      'File di gioco e opzioni del renderer per texture, illuminazione, schermate nere e scatti.'],
    'GAME FILES': ['ARQUIVOS DO JOGO', 'ARCHIVOS DEL JUEGO', 'FICHIERS DU JEU', 'SPIELDATEIEN', 'FILE DI GIOCO'],
    'GAME EXECUTABLE': ['EXECUTÁVEL DO JOGO', 'EJECUTABLE DEL JUEGO', 'EXÉCUTABLE DU JEU', 'SPIEL-EXE', 'ESEGUIBILE DEL GIOCO'],
    'GAME DATA FOLDER': ['PASTA DE DADOS DO JOGO', 'CARPETA DE DATOS DEL JUEGO', 'DOSSIER DES DONNÉES DU JEU', 'SPIELDATENORDNER', 'CARTELLA DATI DEL GIOCO'],
    'Browse': ['Procurar', 'Examinar', 'Parcourir', 'Durchsuchen', 'Sfoglia'],
    'COMPATIBILITY': ['COMPATIBILIDADE', 'COMPATIBILIDAD', 'COMPATIBILITÉ', 'KOMPATIBILITÄT', 'COMPATIBILITÀ'],
    'Full (compatible)': ['Completo (compatível)', 'Completo (compatible)', 'Complet (compatible)', 'Voll (kompatibel)', 'Completo (compatibile)'],
    'Some (recommended)': ['Parcial (recomendado)', 'Parcial (recomendado)', 'Partiel (recommandé)', 'Teilweise (empfohlen)', 'Parziale (consigliato)'],
    'Fast (more FPS, may glitch)': ['Rápido (mais FPS, pode dar falhas)', 'Rápido (más FPS, puede fallar)', 'Rapide (plus de FPS, peut buguer)',
      'Schnell (mehr FPS, evtl. Fehler)', 'Veloce (più FPS, può avere difetti)'],
    'None (experimental)': ['Nenhum (experimental)', 'Ninguno (experimental)', 'Aucun (expérimental)', 'Keins (experimentell)', 'Nessuno (sperimentale)'],
    'Frame stats log': ['Log de estatísticas de quadros', 'Registro de estadísticas de fotogramas', "Journal des statistiques d'images", 'Bildstatistik-Log', 'Log statistiche fotogrammi'],
    'Open logs': ['Abrir logs', 'Abrir registros', 'Ouvrir les journaux', 'Logs öffnen', 'Apri log'],
    'Open game folder': ['Abrir pasta do jogo', 'Abrir carpeta del juego', 'Ouvrir le dossier du jeu', 'Spielordner öffnen', 'Apri cartella del gioco'],
    'Desktop shortcut': ['Atalho na área de trabalho', 'Acceso directo en el escritorio', 'Raccourci sur le bureau', 'Desktop-Verknüpfung', 'Collegamento sul desktop'],
    'Could not create the shortcut': ['Não foi possível criar o atalho', 'No se pudo crear el acceso directo', 'Impossible de créer le raccourci',
      'Verknüpfung konnte nicht erstellt werden', 'Impossibile creare il collegamento'],
  };
  // Texts with a name or a number inside: $1 is the captured part as is, $T1 the captured part translated.
  const PATTERNS = [
    [/^ReStreet (.+) is available$/, ['ReStreet $1 está disponível', 'ReStreet $1 está disponible', 'ReStreet $1 est disponible', 'ReStreet $1 ist verfügbar', 'ReStreet $1 è disponibile']],
    [/^Downloading the update\.\.\. (\d+)%$/, ['Baixando a atualização... $1%', 'Descargando la actualización... $1%', 'Téléchargement de la mise à jour... $1%',
      'Update wird heruntergeladen... $1%', "Download dell'aggiornamento... $1%"]],
    [/^Ready to play online as (.+)$/, ['Pronto para jogar online como $1', 'Listo para jugar en línea como $1', 'Prêt à jouer en ligne en tant que $1',
      'Bereit, online als $1 zu spielen', 'Pronto per giocare online come $1']],
    [/^Loading your match with (.+)\.\.\.$/, ['Carregando sua partida com $1...', 'Cargando tu partida con $1...', 'Chargement de votre match avec $1...',
      'Dein Spiel mit $1 wird geladen...', 'Caricamento della partita con $1...']],
    [/^(\d+) players online$/, ['$1 jogadores online', '$1 jugadores en línea', '$1 joueurs en ligne', '$1 Spieler online', '$1 giocatori online']],
    [/^(.+) server$/, ['Servidor $1', 'Servidor $1', 'Serveur $1', 'Server $1', 'Server $1']],
    [/^(.+) keys set\.$/, ['Teclas de $1 definidas.', 'Teclas de $1 configuradas.', 'Touches $1 définies.', '$1-Tasten gesetzt.', 'Tasti $1 impostati.']],
    [/^(.+) moved here from (.+)\.$/, ['$1 foi movida de "$T2" para cá.', '$1 se movió aquí desde "$T2".', '$1 a été déplacée ici depuis « $T2 ».',
      '$1 wurde von „$T2" hierher verschoben.', '$1 è stato spostato qui da "$T2".']],
    [/^(.+) opens a ReStreet menu in the game\. Pick another key\.$/, ['$1 abre um menu do ReStreet no jogo. Escolha outra tecla.',
      '$1 abre un menú de ReStreet en el juego. Elige otra tecla.', '$1 ouvre un menu ReStreet dans le jeu. Choisissez une autre touche.',
      '$1 öffnet ein ReStreet-Menü im Spiel. Wähle eine andere Taste.', '$1 apre un menu di ReStreet nel gioco. Scegli un altro tasto.']],
    [/^Matches ran at (\S+) FPS, below your (\S+) Hz\. Try 1x internal resolution, ambient occlusion off, or the other graphics API\.$/, [
      'As partidas rodaram a $1 FPS, abaixo dos seus $2 Hz. Tente resolução interna 1x, oclusão ambiente desligada ou a outra API gráfica.',
      'Los partidos fueron a $1 FPS, por debajo de tus $2 Hz. Prueba resolución interna 1x, oclusión ambiental desactivada o la otra API gráfica.',
      "Les matchs tournaient à $1 FPS, sous vos $2 Hz. Essayez la résolution interne 1x, l'occlusion ambiante désactivée ou l'autre API graphique.",
      'Spiele liefen mit $1 FPS, unter deinen $2 Hz. Probier interne Auflösung 1x, Umgebungsverdeckung aus oder die andere Grafik-API.',
      "Le partite andavano a $1 FPS, sotto i tuoi $2 Hz. Prova la risoluzione interna 1x, l'occlusione ambientale disattivata o l'altra API grafica."]],
    [/^Your (.+) game at (.+) is open, waiting for a player\.\.\.$/, ['Sua partida de $T1 em $2 está aberta, esperando um jogador...',
      'Tu partida de $T1 en $2 está abierta, esperando a un jugador...', 'Votre match $T1 à $2 est ouvert, en attente d\'un joueur...',
      'Dein $T1-Spiel in $2 ist offen und wartet auf einen Spieler...', 'La tua partita $T1 a $2 è aperta, in attesa di un giocatore...']],
    [/^Game ready with (.+?)! (.*)$/, ['Partida pronta com $1! $T2', '¡Partida lista con $1! $T2', 'Match prêt avec $1 ! $T2', 'Spiel bereit mit $1! $T2', 'Partita pronta con $1! $T2']],
    [/^(Your game is restarting so it can open the match by itself\. )?ReStreet is opening straight into your (.+) match lobby\.$/, [
      '$T1O ReStreet está abrindo direto no lobby da sua partida de $T2.', '$T1ReStreet se está abriendo directamente en la sala de tu partida de $T2.',
      "$T1ReStreet s'ouvre directement dans le salon de votre match $T2.", '$T1ReStreet öffnet sich direkt in der Lobby deines $T2-Spiels.',
      '$T1ReStreet si sta aprendo direttamente nella lobby della tua partita $T2.']],
    [/^Could not change the server: (.*)$/, ['Não foi possível trocar de servidor: $1', 'No se pudo cambiar de servidor: $1', 'Impossible de changer de serveur : $1',
      'Server konnte nicht gewechselt werden: $1', 'Impossibile cambiare server: $1']],
    [/^Update failed: (.*)$/, ['Falha na atualização: $1', 'Error en la actualización: $1', 'Échec de la mise à jour : $1', 'Update fehlgeschlagen: $1', 'Aggiornamento non riuscito: $1']],
  ];

  let lang = null;
  try { lang = localStorage.getItem('restreet.uiLang'); } catch (e) { /* no storage: the Windows language below */ }
  if (!LANGS.some(l => l[0] === lang)) {
    const n = (navigator.language || 'en').toLowerCase();
    lang = n.startsWith('pt') ? 'pt-BR' : (['es', 'fr', 'de', 'it'].find(c => n.startsWith(c)) || 'en');
  }

  function tr(text) {
    if (lang === 'en' || !text) return text;
    const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2], col = COL[lang];
    let out = D[core] && D[core][col];
    if (!out) {
      for (const [re, row] of PATTERNS) {
        const g = core.match(re);
        if (!g) continue;
        out = row[col].replace(/\$T(\d)/g, (_, i) => tr(g[i] || '')).replace(/\$(\d)/g, (_, i) => g[i] || '');
        break;
      }
    }
    return out ? m[1] + out + m[3] : text;
  }

  // English source of each text node, so a later language change (or a text the page rewrites) starts from it.
  const source = new WeakMap(), shown = new WeakMap();
  function doText(node) {
    const now = node.nodeValue;
    const en = shown.get(node) === now ? source.get(node) : now;
    const out = tr(en);
    source.set(node, en); shown.set(node, out);
    if (out !== now) node.nodeValue = out;
  }
  function doAttrs(el) {
    for (const a of ['title', 'placeholder', 'aria-label']) {
      if (!el.hasAttribute(a)) continue;
      const key = 'en' + a.replace('-', '');
      if (el.dataset[key] === undefined || el.getAttribute(a) !== el.dataset[key + 'Out']) el.dataset[key] = el.getAttribute(a);
      const out = tr(el.dataset[key]);
      el.dataset[key + 'Out'] = out;
      if (out !== el.getAttribute(a)) el.setAttribute(a, out);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || root.closest('script,style,textarea')) return;
    doAttrs(root);
    root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(doAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement && n.parentElement.closest('script,style,textarea') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) doText(n);
  }
  new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') doText(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, {childList: true, subtree: true, characterData: true});

  // The status box is an input: its value comes from the launcher in English on every refresh.
  if (typeof window.render === 'function') {
    const base = window.render;
    window.render = s => { base(s); const st = document.getElementById('ostatus'); if (st) st.value = tr(st.value); };
  }

  // LAUNCHER LANGUAGE (Display page).
  const dd = document.querySelector('.dd[data-id="uiLang"]');
  function fillLang() {
    if (!dd) return;
    dd.querySelector('.dd-btn span').textContent = LANGS.find(l => l[0] === lang)[1];
    const listEl = dd.querySelector('.dd-list'); listEl.innerHTML = '';
    for (const [code, label] of LANGS) {
      const o = document.createElement('div'); o.className = 'dd-opt' + (code === lang ? ' sel' : ''); o.textContent = label;
      o.onclick = e => { e.stopPropagation(); dd.classList.remove('open'); setLang(code); };
      listEl.appendChild(o);
    }
  }
  function setLang(code) {
    lang = code;
    try { localStorage.setItem('restreet.uiLang', code); } catch (e) { /* this session only */ }
    document.documentElement.lang = code;
    walk(document.body);
    fillLang();
  }
  document.documentElement.lang = lang;
  walk(document.body);
  fillLang();
})();

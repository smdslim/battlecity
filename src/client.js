var currentPlayer, clientHash, players = {},
    maxPlayersAmount = 3,
    bullets = {},
    explosion = imagePosition.explosion,
    mapField, mapCanvas, map = {},
    createdMap = {},
    lastPingCheckStamp, justStartedMoving = true,
    prevKeyCode = 0,
    moveInterval = 0,
    prevMoveInterval, ping = 0,
    bottomField, bottomCanvas, effectsCanvas, lastDataSpeedUpdate = 0,
    dataReceived = 0,
    renderInterval, currentGameId, refreshGamesInterval, isMoving = false, _moveInterval,
    lastConnectionCheck = 0, checkConnectionInterval, currentPing;

$(function() {


    showChooseGameDialog();

    socket.on("get_current_games", function(data) {
        drawGames(data);
    });

    socket.on("game_create_error", function(data) {
        alert("create game error, try again");
    });

    socket.on("game_created", function(gameId) {
        establishConnect(gameId);
    });

    socket.on("load_map", function(data) {
        drawMap(data);
    });

    socket.on("authorizing", function(data) {
        authorizePlayer(data);
    });

    socket.on("check_player", function(data) {
        handlePlayer(data);
    });

    socket.on("check_ping", function(time) {
        handlePing(time);
    });


    /* server snapshot of players positioning (received every player move) */
    socket.on("battlefieldInfo", function(data) {
        countDataReciveSpeed(data);
        applyBattlefieldInfo(data);
    });

    socket.on("explosion", function(data) {
        handleExplosion(data);
    });

    socket.on("bullet_started", function(data) {
        startBullet(data);
    });

    socket.on("bonus_appeared", function(data) {
        createBonus(data);
    });

    socket.on("bonus_picked_up", function(data) {
        applyBonus(data);
    });

    socket.on("player_died", function(data) {
        murderPlayer(data);
    });

    socket.on("check_if_locked", function(data) {
        var password;
        if (data.locked) {
            if (data.reason == "password lock") {
                password = prompt("type password here");
                if (password.trim() != "" && password != null) socket.emit("check_password", {
                    gameId: data.gameId,
                    password: password
                })
            } else {
                alert("sorry, no free slots");
            }
        } else {
            establishConnect(data.gameId);
        }
    });

    socket.on("check_password", function(data) {
        if (data.correctPassword === true) {
            establishConnect(data.gameId);
        } else {
            alert("wrong password");
        }
    });

    socket.on("change_player_name", function(data) {
        $("#p" + data.playerNumber).html(data.playerName);
    });

    socket.on("redefine_host", function(data) {
        redefineHost(data);
    });

})
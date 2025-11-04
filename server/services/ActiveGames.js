class ActiveGames {
  constructor() {
    if (ActiveGames.instance) {
      return ActiveGames.instance;
    }
    this.games = new Map();
    ActiveGames.instance = this;
  }

  getGame(roomId) {
    return this.games.get(roomId);
  }

  setGame(roomId, gameInstance) {
    this.games.set(roomId, gameInstance);
  }

  deleteGame(roomId) {
    this.games.delete(roomId);
  }

  getRoomBySocketId(socketId) {
    for (const [roomId, game] of this.games.entries()) {
      if (game.isPlayerInGame(socketId)) {
        return roomId;
      }
    }
    return null;
  }
}

const instance = new ActiveGames();
Object.freeze(instance);

export default instance;

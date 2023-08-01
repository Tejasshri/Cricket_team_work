const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has been Started");
    });
  } catch (error) {
    console.log("Some Error in Server starting");
    process.exit(1);
  }
};
initializeDBAndServer();

//Get PLAYERS
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team ;`;
  let books = await db.all(getPlayersQuery);
  books = books.map((object) => {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
      jerseyNumber: object.jersey_number,
      role: object.role,
    };
  });
  response.send(books);
});

//ADD PLAYER
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(playerName);
  console.log(jerseyNumber);
  console.log(role);

  const addPlayerQuery = `
    INSERT INTO cricket_team
        (player_name, jersey_number, role)
    VALUES
        ('${playerName}', ${jerseyNumber}, '${role}');`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

/////GET PLAYER
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team 
        WHERE player_id = ${playerId} ; `;
  let playerDetails = await db.get(getPlayerQuery);
  playerDetails = {
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  };
  response.send(playerDetails);
});

////CHANGE PLAYER
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber} ,
        role = '${role}'
    WHERE player_id = ${playerId}; `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

///DELETE PLAYER
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team
        WHERE 
            player_id = ${playerId} ; `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;

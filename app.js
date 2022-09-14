const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
   select * from cricket_team ;
   `;
  const result = await db.all(getPlayersQuery);
  response.send(result);
});

app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { player_Name, jersey_Number, role } = newPlayer;
  const addPlayer = `insert into 
   cricket_team (player_name,jersey_number,role) 
   values('${player_Name}','${jersey_Number}','${role}');`;
  const dbresponse = await db.run(addPlayer);
  const playerId = dbresponse.lastID;
  console.log("Player Added to Team");
  response.send({ player_id: playerId });
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id=${playerId};`;
  const play = await db.get(getPlayerQuery);
  response.send(play);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playDetails = request.body;

  const { player_Name, jersey_Number, role } = playDetails;
  const updatedPlayer = `update 
   cricket_team
    set
     player_name='${player_Name}',
     jersey_number='${jersey_Number}',
     role='${role}'
   where 
   player_id=${playerId};`;
  await db.run(updatedPlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team
    where player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Deleted");
});
# cricket-Team

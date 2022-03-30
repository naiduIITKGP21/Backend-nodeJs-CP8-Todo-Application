const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { status, priority, search_q = "" } = request.query;
  console.log(typeof status, typeof priority);

  switch (true) {
    case priority !== undefined && status !== undefined:
      getTodosQuery = ` SELECT * FROM todo 
                       WHERE todo LIKE "%${search_q}%" 
                       AND priority = "${priority}"
                       AND status = "${status}";`;
      break;

    case priority !== undefined:
      getTodosQuery = ` SELECT * FROM todo 
                       WHERE todo LIKE "%${search_q}%" 
                       AND priority = "${priority}";`;
      break;
    case status !== undefined:
      getTodosQuery = ` SELECT * FROM todo 
                       WHERE todo LIKE "${search_q}"
                       AND status = "${status}";`;
      break;
    default:
      getTodosQuery = ` SELECT * FROM todo 
                       WHERE todo LIKE "%${search_q}%";`;
  }
  console.log(getTodosQuery);
  const getTodosArray = await db.all(getTodosQuery);
  response.send(getTodosArray);
  console.log(getTodosArray);
});

//API 2:
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
  console.log(todo);
});

//API 3:
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(id);
  const addTodo = `INSERT INTO todo 
  (id, todo, priority, status)
  VALUES 
  (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(addTodo);
  response.send("Todo Successfully Added");
});

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const dbPassword = process.env.DB_PASSWORD;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "dadjokes",
  password: dbPassword,
  port: 5434,
});

const app = express();
const port = 3000;

db.connect();

let quiz = [];
db.query("SELECT * FROM dadjokestable", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
    return;
  } else {
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.answer.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomJokes = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomJokes;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

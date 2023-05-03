const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'ukd_admin',
  host: 'ep-square-mouse-262994.us-west-2.aws.neon.tech',
  database: 'ukd',
  password: 'YyfeQqL0W8uS',
  port: 5432,
});

// Додати студента
app.post('/students', async (req, res) => {
  const { name, age, email } = req.body;
  const newStudent = await pool.query(
    'INSERT INTO students (name, age, email) VALUES ($1, $2, $3) RETURNING *',
    [name, age, email]
  );
  res.json(newStudent.rows[0]);
});

// Додати завдання
app.post('/tasks', async (req, res) => {
  const { title, description, student_id, subject_id } = req.body;
  const newTask = await pool.query(
    'INSERT INTO tasks (title, description, student_id, subject_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, description, student_id, subject_id]
  );
  res.json(newTask.rows[0]);
});

// Отримати список студентів з приєднаними завданнями
app.get('/students', async (req, res) => {
  const students = await pool.query('SELECT * FROM students');
  const tasks = await pool.query('SELECT * FROM tasks');

  const result = students.rows.map((student) => {
    const studentTasks = tasks.rows.filter((task) => task.student_id === student.id);
    return {
      id: student.id,
      name: student.name,
      age: student.age,
      email: student.email,
      tasks: studentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
      })),
    };
  });

  res.send(result);
});

// Отримати один предмет за id з приєднаними завданнями
app.get('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const subject = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);

  const result = {
    id: subject.rows[0].id,
    name: subject.rows[0].name,
    tasks: [],
  };

  const tasksQuery = `
    SELECT t.id AS task_id, t.title, t.description 
    FROM tasks t 
    INNER JOIN subjects s ON t.subject_id = s.id 
    WHERE s.id = $1
  `;
  const tasksResult = await pool.query(tasksQuery, [id]);

tasksResult.rows.forEach((row) => {
    result.tasks.push({
        id: row.task_id,
        title: row.title,
        description: row.description,
        });
      
    });

    res.send(result);
    });
    
    app.listen(3000, () => {
    console.log('Server has started on port 3000');
});
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();

app.use(express.json());
app.use(cors());

const PORT = 3000;


let db = new sqlite3.Database('./mydb.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Подключено к базе данных SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )`);
    }
});


app.get('/api/task/', (req, res) => {
    db.all(`SELECT * FROM tasks`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});


app.post('/api/task/', (req, res) => {
    const { task, completed } = req.body;

    if (typeof task !== 'string' || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Неверные данные. Task должен быть строкой, а completed — логическим значением.' });
    }

    const completedValue = completed ? 1 : 0;
    const sql = `INSERT INTO tasks (task, completed) VALUES (?, ?)`;

    db.run(sql, [task, completedValue], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, task, completed });
    });
});


app.put('/api/task/:id', (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;

    if (typeof task !== 'string' || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Неверные данные' });
    }

    const completedValue = completed ? 1 : 0;
    const sql = `UPDATE tasks SET task = ?, completed = ? WHERE id = ?`;

    db.run(sql, [task, completedValue, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Задача обновлена' });
    });
});


app.delete('/api/task/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM tasks WHERE id = ?`;

    db.run(sql, id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Задача удалена' });
    });
});

app.listen(PORT, () => console.log('Server started on port', PORT))
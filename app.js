const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const db = new Database(path.join(__dirname, 'list.db'));

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

(() => {
    const sql = fs.readFileSync('init_db.sql', 'utf8');
    db.exec(sql);
    console.log('DB 초기화 완료');
})();
// curl -X GET http://127.0.0.1:3000/api/note/table/feedbackList
app.get('/api/note/table/:table', (req, res) => {
    const db_table = req.params.table;
    try {
        const rows = db.prepare(`SELECT * FROM \`${db_table}\``).all();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// curl -X GET http://127.0.0.1:3000/api/note/1
app.get('/api/note/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const row = db.prepare('SELECT * FROM `feedbackList` WHERE id=?').get(id);
        if (!row) return res.status(404).json({ error: '피드백을 찾을 수 없습니다.' });
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// curl -X POST http://127.0.0.1:3000/api/note/create -H "Content-Type: application/json" -d '{"title":"test22","message":"내용22"}'
app.post('/api/note/create', (req, res) => {
    const { title, message } = req.body;
    try {
        const result = db.prepare('INSERT INTO `feedbackList` (title, message) VALUES (?, ?)').run(title, message);
        res.json({ ok: true, id: result.lastInsertRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// curl -X DELETE http://127.0.0.1:3000/api/note/1
app.delete('/api/note/:id', (req, res) => {
    const id = req.params.id;
    try {
        const result = db.prepare('DELETE FROM `feedbackList` WHERE id=?').run(id);
        if (result.changes === 0) return res.status(404).json({ error: '피드백을 찾을 수 없습니다.' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// curl -X PUT http://127.0.0.1:3000/api/note/2 -H "Content-Type: application/json" -d '{"title":"수정333","message":"수정된 내용333"}'
app.put('/api/note/:id', (req, res) => {
    const id = req.params.id;
    const { title, message } = req.body;
    try {
        const result = db.prepare('UPDATE `feedbackList` SET title=?, message=? WHERE id=?').run(title, message, id);
        if (result.changes === 0) return res.status(404).json({ error: '피드백을 찾을 수 없습니다.' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is ready on http://127.0.0.1:${PORT}`);
});

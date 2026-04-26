const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados MySQL:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados MySQL com sucesso!');
    
    db.query(`CREATE TABLE IF NOT EXISTS Quadros (ID INT AUTO_INCREMENT PRIMARY KEY, Nome VARCHAR(255) NOT NULL)`, (err) => {
        if (err) console.error("⚠️ Erro ao verificar tabela Quadros:", err.message);
    });
});

app.get('/quadros', (req, res) => {
    const usuarioId = req.query.usuarioId;
    if (!usuarioId) return res.status(400).json({ erro: 'Usuário não identificado' });

    db.query('SELECT * FROM Quadros WHERE UsuarioId = ?', [usuarioId], (err, results) => {
        if (err) {
            console.error("❌ Erro SQL ao buscar quadros:", err.message);
            return res.status(500).json({ erro: 'Erro ao buscar quadros', detalhes: err.message });
        }
        res.json(results);
    });
});

app.post('/quadros', (req, res) => {
    const { Nome, UsuarioId } = req.body;
    db.query('INSERT INTO Quadros (Nome, UsuarioId) VALUES (?, ?)', [Nome, UsuarioId], (err, results) => {
        if (err) {
            console.error("❌ Erro SQL ao criar quadro:", err.message);
            return res.status(500).json({ erro: 'Erro ao criar quadro', detalhes: err.message });
        }
        res.json({ mensagem: 'Quadro criado com sucesso', idGerado: results.insertId });
    });
});

app.put('/quadros/:id', (req, res) => {
    const { id } = req.params;
    const { Nome } = req.body;
    db.query('UPDATE Quadros SET Nome = ? WHERE ID = ?', [Nome, id], (err, results) => {
        if (err) {
            console.error("❌ Erro SQL ao atualizar quadro:", err.message);
            return res.status(500).json({ erro: 'Erro ao atualizar quadro', detalhes: err.message });
        }
        res.json({ mensagem: 'Quadro atualizado com sucesso' });
    });
});

app.delete('/quadros/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Atividades WHERE QuadroId = ?', [id], (err) => {
        db.query('DELETE FROM Quadros WHERE ID = ?', [id], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao excluir quadro' });
            res.json({ mensagem: 'Quadro excluído com sucesso' });
        });
    });
});

app.get('/atividades', (req, res) => {
    const usuarioId = req.query.usuarioId;
    if (!usuarioId) return res.status(400).json({ erro: 'Usuário não identificado' });

    let query = 'SELECT Atividades.*, Quadros.Nome AS QuadroNome FROM Atividades LEFT JOIN Quadros ON Atividades.QuadroId = Quadros.ID WHERE Atividades.UsuarioId = ?';
    const params = [usuarioId];
    
    if (req.query.quadroId) {
        query += ' AND Atividades.QuadroId = ?';
        params.push(req.query.quadroId);
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Erro ao buscar atividades:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor' });
        }
        res.json(results);
    });
});

app.post('/atividades', (req, res) => {
    const { Titulo, Descricao, DataLimite, Status, QuadroId, UsuarioId } = req.body;
    const query = 'INSERT INTO Atividades (Titulo, Descricao, DataLimite, Status, QuadroId, UsuarioId) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [Titulo, Descricao, DataLimite, Status || 'todo', QuadroId || null, UsuarioId], (err, results) => {
        if (err) {
            console.error("Erro ao criar atividade:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor ao criar atividade' });
        }
        res.json({ 
            mensagem: 'Atividade criada com sucesso!',
            idGerado: results.insertId 
        });
    });
});

app.put('/atividades/:id', (req, res) => {
    const { id } = req.params;
    const { Titulo, Descricao } = req.body;
    const query = 'UPDATE Atividades SET Titulo = ?, Descricao = ? WHERE ID = ?';
    
    db.query(query, [Titulo, Descricao, id], (err, results) => {
        if (err) {
            console.error("Erro ao atualizar atividade:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar atividade' });
        }
        res.json({ mensagem: 'Atividade atualizada com sucesso' });
    });
});

app.delete('/atividades/:id', (req, res) => {
    db.query('DELETE FROM Atividades WHERE ID = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao excluir atividade' });
        res.json({ mensagem: 'Atividade excluída com sucesso' });
    });
});

app.put('/atividades/:id/status', (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
    
    let query = 'UPDATE Atividades SET Status = ? WHERE ID = ?';
    let params = [Status, id];
    
    if (Status === 'done') {
        query = 'UPDATE Atividades SET Status = ?, DataConclusao = CURDATE() WHERE ID = ?';
    } else {
        query = 'UPDATE Atividades SET Status = ?, DataConclusao = NULL WHERE ID = ?';
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Erro ao atualizar status:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar status' });
        }
        res.json({ mensagem: 'Status do card atualizado para ' + Status });
    });
});

app.put('/atividades/:id/data', (req, res) => {
    const { id } = req.params;
    const { DataLimite } = req.body;
    const query = 'UPDATE Atividades SET DataLimite = ? WHERE ID = ?';
    
    db.query(query, [DataLimite, id], (err, results) => {
        if (err) {
            console.error("Erro ao atualizar data:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar data' });
        }
        res.json({ mensagem: 'Data da atividade atualizada com sucesso' });
    });
});

app.post('/register', (req, res) => {
    const { Nome, Email, Senha } = req.body;
    const query = 'INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)';
    
    db.query(query, [Nome, Email, Senha], (err, results) => {
        if (err) {
            console.error("Erro ao cadastrar usuário:", err);
            return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
        }
        res.json({ mensagem: 'Usuário cadastrado com sucesso!', id: results.insertId });
    });
});

app.post('/login', (req, res) => {
    const { Email, Senha } = req.body;
    const query = 'SELECT ID, Nome, Email FROM Usuarios WHERE Email = ? AND Senha = ?';
    
    db.query(query, [Email, Senha], (err, results) => {
        if (err) {
            console.error("Erro ao fazer login:", err);
            return res.status(500).json({ erro: 'Erro interno no servidor' });
        }
        if (results.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        }
        res.json({ mensagem: 'Login realizado com sucesso', usuario: results[0] });
    });
});

app.get('/usuarios/:id', (req, res) => {
    const query = 'SELECT ID, Nome, Email FROM Usuarios WHERE ID = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });
        if (results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json(results[0]);
    });
});

app.put('/usuarios/:id', (req, res) => {
    const { Nome, Email } = req.body;
    const query = 'UPDATE Usuarios SET Nome = ?, Email = ? WHERE ID = ?';
    
    db.query(query, [Nome, Email, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
        res.json({ mensagem: 'Perfil atualizado com sucesso!' });
    });
});

app.listen(3000, () => {
    console.log('Servidor da API rodando em http://localhost:3000');
});
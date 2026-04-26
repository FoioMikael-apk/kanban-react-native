# 📌 App Kanban - Gestor de Projetos e Tarefas

Um aplicativo completo de gestão de tarefas e projetos inspirado no Trello, focado em produtividade e organização. Desenvolvido com **React Native (Expo)** no Frontend e **Node.js + MySQL** no Backend.

---

## ✨ Funcionalidades

- **🔒 Autenticação Multi-Tenant:** Sistema de Cadastro e Login com isolamento de dados. Cada usuário tem acesso exclusivo aos seus próprios quadros e tarefas (sessão gerenciada via `AsyncStorage`).
- **📂 Múltiplos Quadros:** Crie diversos quadros para separar seus projetos (ex: Faculdade, Trabalho, Casa). O app aplica automaticamente cores dinâmicas para diferenciar visualmente cada projeto.
- **📋 Quadro Kanban Interativo:** Gerencie suas atividades movendo os cards entre as colunas "Planejamento", "Em Andamento" e "Concluído".
- **📅 Agenda Inteligente:** Uma visão unificada de todos os quadros. Utilize o calendário expansível para filtrar tarefas por data de entrega. As tarefas são automaticamente categorizadas como: *Em Atraso, Em Planejamento, Em Andamento* ou *Finalizadas*.
- **📊 Dashboard de Desempenho:** Acompanhe seu ritmo de produtividade. O app calcula uma taxa de sucesso cruzando a *Data Limite* da tarefa com a *Data de Conclusão* real, gerando um selo de desempenho (Excelente, Muito Bom, Regular, etc).
- **⚙️ Gestão Completa (CRUD):** Crie, edite textos/prazos, e exclua quadros e tarefas com proteção contra exclusão acidental.

---

## 🚀 Tecnologias Utilizadas

### Frontend (App Mobile)
- **React Native / Expo**
- **Expo Router:** Navegação moderna baseada em arquivos (Tabs, Modais e Telas Dinâmicas).
- **AsyncStorage:** Persistência de sessão local no dispositivo.
- **React Native Calendars:** Componente de calendário para a Agenda.
- **React Native Toast Message:** Feedbacks visuais e alertas não intrusivos (Toasts).
- **Feather Icons:** Iconografia padrão do app.

### Backend (API REST)
- **Node.js & Express:** Roteamento e lógica da API.
- **MySQL2:** Conexão com o banco de dados relacional.
- **Dotenv:** Segurança e ocultação de credenciais de ambiente.
- **CORS:** Liberação de acesso cross-origin.

---

## 🛠️ Como rodar o projeto localmente

### 1. Preparando o Banco de Dados (MySQL)
Abra o seu gerenciador de banco de dados (ex: phpMyAdmin, DBeaver, MySQL Workbench) e execute os seguintes comandos SQL para criar a estrutura:

```sql
CREATE DATABASE Extensaocultural;
USE Extensaocultural;

CREATE TABLE Usuarios (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Senha VARCHAR(255) NOT NULL
);

CREATE TABLE Quadros (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    UsuarioId INT NOT NULL
);

CREATE TABLE Atividades (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(255) NOT NULL,
    Descricao TEXT,
    DataLimite DATE,
    DataConclusao DATE,
    Status VARCHAR(50) DEFAULT 'todo',
    QuadroId INT,
    UsuarioId INT NOT NULL
);
```

### 2. Configurando e Rodando o Backend
Navegue até a pasta do backend:
```bash
cd backend-kanban
```
Instale as dependências:
```bash
npm install
```
Crie um arquivo chamado `.env` na raiz da pasta `backend-kanban` e insira as credenciais do seu banco MySQL local:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=Extensaocultural
```
Inicie o servidor:
```bash
node server.js
```
*A API estará rodando em `http://localhost:3000`*

### 3. Configurando e Rodando o Frontend
Em um novo terminal, navegue até a pasta do aplicativo:
```bash
cd CultFinishing
```
Instale as dependências do Expo:
```bash
npm install
```
**⚠️ IMPORTANTE:** Antes de iniciar o app, abra o código e substitua o IP (`192.168.1.82`) pelo IP local da sua máquina na rede Wi-Fi atual (use `ipconfig` no Windows para descobrir). Você encontrará as variáveis `API_URL` nos arquivos dentro da pasta `app/`.

Inicie o aplicativo limpando o cache:
```bash
npx expo start -c
```
Escaneie o QR Code com o aplicativo **Expo Go** no seu celular (Android/iOS) para testar!

---

## 📄 Licença
Este projeto foi desenvolvido para fins de aprendizado e composição de portfólio. Sinta-se livre para clonar, modificar e utilizar a arquitetura como base para os seus próprios projetos!

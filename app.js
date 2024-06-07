const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('')


initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
    res.render("consulta");
    const dbAgendamentos = db.collection('agendamentos');
    const conteudo = await dbAgendamentos.get();
    if (conteudo.empty) {
        console.log('No matching documents.');
        console.log('DBAgendamentos: '+dbAgendamentos)
        console.log('Conteudo: '+conteudo)
    
    }else{
        conteudo.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });
        
        res.render("consulta", {conteudo: conteudos})
    }
});  

app.get("/editar/:id", function(req, res){
})

app.get("/excluir/:id", function(req, res){
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})
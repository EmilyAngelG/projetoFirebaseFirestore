const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./dsenvolvimentowebfateczl-firebase-adminsdk-k9lwr-1d04eb5deb.json')


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
    const dataSnapshot = await db.collection('agendamentos').get();
    const data = [];
    dataSnapshot.forEach((doc) => {
        data.push({
            id: doc.id,
            nome: doc.get('nome'),
            telefone: doc.get('telefone'),
            origem: doc.get('origem'),
            data_contato: doc.get('data_contato'),
            observacao: doc.get('observacao'),
        });
    });       
        res.render("consulta", {data});
})

app.get("/editar/:id", async function(req, res){
    try{
        const docRef = db.collection('agendamentos').doc(req.params.id);
        const doc = await docRef.get();
        if(!doc.exists){
            console.log('Dados não encontrados');
            res.status(404).send("Dados não encontrado");
        }else{
            res.render('editar', {id: req.params.id, agendamento: doc.data()});
        }
    }catch(error){
        console.log('Erro ao capturar o documento: '+error);
        res.status(500).send("Erro ao buscar os dados do documento");
    }
});

app.get("/excluir/:id", async function(req, res){
    try{
        await db.collection('agendamentos').doc(req.params.id).delete();
        console.log('Dados excluidos com sucesso');
        res.redirect("/consulta");
    }catch(error){
        console.error('Erro ao deletar os dados: ', error);
        res.status(500).send("Erro ao deletar os dados")
    }
});

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

app.post("/atualizar/:id", async function(req, res){
    try{
        const docRef = db.collection('agendamentos').doc(req.params.id);
        await docRef.update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao
        });
        console.log('Atualização feita com sucesso');
        res.redirect('/consulta');
    }catch(error){
        console.error("Erro ao atualizar o documento: ", error);
        res.status(500).send('Erro ao atualizar o documento');
    }
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})
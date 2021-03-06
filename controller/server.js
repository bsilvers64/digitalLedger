const express=require('express');
const app=express();
const path=require('path');
const bodyParser=require('body-parser');
const port=4208;
const session= require('express-session');
const bcrypt=require('bcrypt');
const model=require('../main/model/model.js');
const mailer=require('../main/mailerService/mailer.js');
const saltRounds=10;
app.use(session({
    secret: 'secret-key',
    resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000},
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,"public")));
app.get('/',(req,res)=>{
    if(req.session.username!=null){
        console.log(req.session.username);
        res.sendFile(path.join(__dirname,"public","html","dashboard.html"));
    }else{
        res.sendFile(path.join(__dirname,"public","html","home.html"));
    }
    
});
app.post('/register',(req,res)=>{
    bcrypt.hash(req.body.b_password,saltRounds,(err,hash)=>{
        if(err){
            console.log(err);
        }else{
            model.register(req.body.b_name,req.body.b_owner,req.body.b_email,req.body.b_number,hash);
        }
    })
    res.sendStatus(204);
});
app.post('/login',async(req,res)=>{
const isUser=await model.login(req.body.l_email);
if(isUser[0]==true){
bcrypt.compare(req.body.l_password,isUser[2],(err,result)=>{
    if(err){console.log(err);}
    else{console.log(result);
        req.session.username=isUser[1][0].b_email;
    res.sendFile(path.join(__dirname,"public","html","dashboard.html"));
    }
})
}else{console.log('user not found!');}
});
app.get('/show',(req,res)=>{
    res.json({"user logged in":req.session.username});
});
app.post('/addClient',(req,res)=>{
    
    model.addClient(req.body.clientName,req.body.clientEmail,req.body.clientMobile);
    res.sendStatus(204);
});
app.post('/sendTransactionRequest',async(req,res)=>{
var link=await model.transactionRequest(req.body.amount,req.body.clientEmail,req.session.username);
await mailer.sendTransactionMail(req.body.amount,req.body.reason,req.body.clientEmail,req.session.username,link);
res.sendStatus(204);
});
app.get('/payment',async(req,res)=>{
var isPresent=await model.isPresent(req.query.unique);
if(isPresent){
    req.session.pid=req.query.unique;
}else{
    res.send('<h3>this url is expired , the payment is complete or declined already</h3>');
}
})
app.listen(port,()=>{console.log('server on')});
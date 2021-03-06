const { hash } = require('bcrypt');
const { Mongoose } = require('mongoose');

mongoose=require('mongoose');
mongoose.connect('mongodb+srv://dbuser:root@cluster0.1fwfj.mongodb.net/mainDB?retryWrites=true&w=majority',{ useUnifiedTopology: true,useNewUrlParser: true },(err)=>{
    if(err){
        console.log(err);
    }else{console.log('database connection established');}
})
var ObjectId=mongoose.Schema.ObjectId;
var pendingTransactionsSchema=new  mongoose.Schema({
    amount:{type:Number,sparse:true},
    clientEmail:{type:String,sparse:true},
    b_email:{type:String, sparse:true}
});
var transactionSchema= new mongoose.Schema({amount :{type:Number,trim: true, sparse: true},
    timeStamp : {type:Date,trim: true, index: true, sparse: true},
    status : {type :String,sparse:true},
    previousHash:{type:String,trim: true, index: true, unique: true, sparse: true},
    hash:{type:String,required:true,trim: true, index: true, unique: true, sparse: true}
});
var clientSchema=new mongoose.Schema({clientName :{type:String,required:true,sparse:true},
    clientEmail : {type:String,trim: true, index: true, unique: true, sparse: true},
    clientMobile : {type:Number,trim: true, index: true, unique: true, sparse: true},
    clientTransactions : {type:[transactionSchema]}});

var businessSchema=new mongoose.Schema({
b_id :{type: ObjectId},
b_name:{type :String, required:true},
b_owner:{type : String ,required:true},
b_email : {type : String , required:true,unique:true},
b_mobile:{type:Number,required:true,unique:true},
b_password :{type:String ,required:true},
clients : {type:[clientSchema],unique:true}});
var business=mongoose.model("Businesses",businessSchema);
var pending=mongoose.model("PendingTransactions",pendingTransactionsSchema);
module.exports={
 register : function(b_name,b_owner,b_email,b_mobile,b_password){
    var newDoc= new business();
    newDoc.b_name=b_name;
    newDoc.b_owner=b_owner;
    newDoc.b_email=b_email;
    newDoc.b_mobile=b_mobile;
    newDoc.b_password=b_password;
    newDoc.save();},
login : async(b_email)=>{
    var b=[];
    var hash;
   var a=[false,b,hash];
    await business.find({b_email:b_email},(err,doc)=>{
        if(err){console.log(err);}
        else{a[1]=doc;}
    });
    if(a[1].length==0){return a;}else{a[0]=true;a[2]=a[1][0].b_password;return a;}
},
addClient :async(clientName,clientEmail,clientMobile,b_email)=>{
var client={clientName:clientName,clientEmail:clientEmail,clientMobile:clientMobile};
await business.updateOne({b_email:b_email},
    {$addToSet :{clients:client}},(err,result)=>{
        if(err){console.log(err);}
        else{console.log('success!');}
    });

},
transactionRequest : async(amount,clientEmail,b_email)=>{
var newDoc=new pending();
newDoc.amount=amount;
newDoc.clientEmail=clientEmail;
newDoc.b_email=b_email;
await newDoc.save();
return newDoc.id;
},
isPresent :async(id)=>{
var hashCheck=false;
await pending.findById(id,(err,result)=>{
    if(err){console.log(err);}
    else{hashCheck=true;}
});
return true;
}
}
const express = require('express')
const dotenv = require('dotenv')
const userHelpers = require('./helpers/userHelpers')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const ws =  require('ws')
const fs = require('fs')





const app = express()

function verifyLogin(req,res,next){
    let {token}=req.cookies
    if(token){
        jwt.verify(token,process.env.JWT_SECRET_KEY,{},(err,userData)=>{
            if(userData.Id){
                req.user=userData
                req.user.logstatus = true;
                next()
            }
        })
    }
    else{
        req.user = {logstatus:false};
        next();
    }
}

app.use(cookieParser())
dotenv.config()
app.use(cors({
    credentials : true,
    origin : process.env.CLIENT_URL
}))
app.use(express.json())
mongoose.connect(process.env.MONGO_URL)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL); // replace with your client-side URL
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/uploads',express.static(__dirname+"/storage/uploads"))
app.post('/login',(req,res)=>{
    console.log(req.body)
    userHelpers.doLogin(req.body).then((response)=>{
        if(response){
            jwt.sign({User:response.Username,Id:response._id},process.env.JWT_SECRET_KEY,{},(err,token)=>{
                res.cookie('token',token,{sameSite:'none',secure:true,httpOnly:false,maxAge:3600000}).status(201).json(
                    {
                        Username:response.Username,
                        Id:response._id
                        
                    }
                )
            })
        }else{
            res.status(404).json('user not found')
        }
    }
)})
app.post('/register',async (req,res)=>{
    console.log(req.body)
    // console.log(req.cookies)
    // if(!req.cookies){
        let user=await userHelpers.doRegister(req.body)
        console.log(user)
        jwt.sign({User:user.Username,Id:user._id},process.env.JWT_SECRET_KEY,{},(err,token)=>{
            console.log("token :"+token)
            res.cookie('token',token,{sameSite:'none',secure:true,httpOnly:false}).status(201).json({
               Id : user._id,
               Username:user.username
            })
            
        })
    // }
    // else{
    //     res.json('Already logged in..')
    // }
    
})
app.get('/profile',verifyLogin,(req,res)=>{
        res.status(200).json(req.user)
})
app.get('/chatlist',verifyLogin,(req,res)=>{
    userHelpers.getUserData(req.user.Id).then((response)=>{
        res.status(200).json(response)
    })
})
app.post('/user',(req,res)=>{
    console.log(req.body)
    let email=req.body.email
    userHelpers.findUser(email).then(userData=>{
        res.status(200).json(userData)
    }).catch(()=>{
        res.status(200).json(false)
    })
})
app.get("/logout",(req,res)=>{
    res.cookie('token','',{sameSite:'none',secure:true,httpOnly:false,maxAge:3600000}).status(201).json('loggedout')
})
app.get('/follow',verifyLogin, async(req,res)=>{
    let f_id=req.query.id;
    let userId=req.user.Id
    console.log(f_id,userId)
    userHelpers.followUsers(userId,f_id).then(()=>{
        res.status(200).json('followed user')
    })
    
})
app.get('/fetchMessages',verifyLogin,(req,res)=>{
    console.log(req.query.loggedUserId,req.query.selectedUserId);
    userHelpers.fetchMessages(req.query.loggedUserId,req.query.selectedUserId).then((response)=>{
        if (response){
            res.status(200).json(response);
        }
    });  
})

const server=app.listen(process.env.PORT,()=>{
    console.log('server started on port :'+process.env.PORT)
})

const wss=new ws.WebSocketServer({server});
wss.on('connection',(connection,req)=>{
    console.log('connected');
    
    let cookies = req.headers.cookie;
    if (cookies){
        let cookieString=cookies.split(';').find(str => str.startsWith('token'))
        if(cookieString){
            let token = cookieString.split('=')[1]
            if(token){
                jwt.verify(token,process.env.JWT_SECRET_KEY,{},(err,userData)=>{
                    if(err) throw err
                    const {User,Id}=userData;
                    connection.Username=User;
                    connection.Id=Id
                })
            }
        }
    }
    connection.on('message',(messageData)=>{
        messageData=JSON.parse(messageData.toString())
        const {Sender,Recipient,Message,File} = messageData;
        console.log(messageData)
        if(File){
            File.file = File.file.split(",")[1]
            let name = File.name.split('.')
            let ext = name[name.length - 1]
            console.log(ext)
            let file = new Buffer(File.file,'base64')
            let fileName = "HalfChat" + Date.now() + "." +ext;
            let filePath = __dirname + "/storage/uploads/" + fileName;
            fs.appendFile(filePath, file, ()=>{
                console.log("file saved")
            })
            messageData.File = fileName;
        }
        if(Recipient && (Message || File)){
            userHelpers.sendMessage(messageData).then((res)=>{
                [...wss.clients].filter(c => c.Id===Recipient).forEach(c => c.send(JSON.stringify({Message,Sender,Id:res._id,incoming:true})))
            })
        }
    });
    
    let online = {};
    [...wss.clients].forEach((client)=>{
        [...wss.clients].map(c => (online[c.Id] = c.Username))
        client.send(JSON.stringify({online:online}))
    })
})

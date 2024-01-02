const { reject } = require('bcrypt/promises')
const userModel = require('../Schema/userSchema')
const messageModel = require('../Schema/messagesSchema')
const bcrypt = require('bcrypt')
const objectId=require('mongoose').Types.ObjectId
module.exports={
    doRegister:(userData)=>{
        return new Promise( async (resolve,reject)=>{
            let userExist = await userModel.findOne({Email:userData.Email})
            if(!userExist){
                try{
                    userData.Password = await bcrypt.hash(userData.Password,10);
                    userModel.create(userData).then(data=>{
                        
                        resolve(data)
                        console.log('Register Success..')
                })
                }   catch(err){
                    console.log(err.message)
                }
            }
            else{
                console.log('user already exists')
            }
        })
    },
    doLogin:(userData)=>{
        return new Promise( async (resolve,reject)=>{
            let user = await userModel.findOne({Email:userData.Email})
            if(user){
                let passwordmatch=await bcrypt.compare(userData.Password,user.Password)
                if (passwordmatch){
                    console.log('login successfull')
                    resolve(user)
                }else{
                    console.log('login failed')
                    resolve()
                }
            }
            else{
                console.log("no User Found")
            }

        })
    },
    findUser:(email)=>{
        return new Promise (async(resolve,reject)=>{

            let user= await userModel.findOne({Email:email})
            if (user){
                resolve({_id:user._id,Username:user.Username,Email:user.Email})
            }
            else{
                reject()
            }
        })
    },
    followUsers:(userId,f_id)=>{
        return new Promise ( async(resolve,reject)=>{
            let user = await userModel.findOne({_id:userId})
            let dup = user.Chatlist.find(e=>e===f_id)
            if(!dup){
                
                userModel.bulkWrite([{updateOne:{
                    filter:{_id:userId},
                    update:{$push:{Chatlist: new objectId(f_id)}}
                }},
                {
                    updateOne:{
                        filter:{_id:f_id},
                        update:{$push:{Chatlist: new objectId(userId)}}
                    }
                }
                ]).then((res)=>{
                    resolve()
                })
            }
            else{
                resolve()
            }
            
        })
    },
    getUserData:(userId)=>{
        return new Promise ( async(resolve,reject)=>{
            let UserData= await userModel.aggregate([{$match:{_id: new objectId(userId)}},
                {
                    $lookup:{
                        from:'users',
                        localField:'Chatlist',
                        foreignField:"_id",
                        as:'ChatlistData'
                    }
                },
                {
                    $project:{
                        ChatlistData:1
                    }
                },
                {
                    $unwind:"$ChatlistData"
                },{
                    $project:{
                        _id:'$ChatlistData._id',
                        Username:'$ChatlistData.Username',
                        Email:'$ChatlistData.Email'
                    }
                }
            ])
            resolve(UserData)
        })
    },
    sendMessage:(data)=>{
        // store messages into database
        return new Promise((resolve,reject)=>{
            messageModel.create(data).then((res)=>{
                resolve(res)
            })
        })
    },
    fetchMessages:(userid,selectedUser)=>{
        console.log(userid)
        return new Promise(async(resolve,reject)=>{
           const messages= await messageModel.find({Sender:{$in:[userid,selectedUser]},Recipient:{$in:[userid,selectedUser]}})
           console.log(messages);
           resolve('hello') 
        })
    }
}
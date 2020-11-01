var admin = require("firebase-admin");

var serviceAccount = require("C:\\Users\\Aakash\\Documents\\Aakash Progs\\node-apps\\chat-api\\firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-app-93d68.firebaseio.com"
});
var payload={
  notification:{
    title:"Chat-app",
    body:"new Message"
  }
}
var options={
  priority:"High"
}
const sendNotification=(token)=>{
  admin.messaging().sendToDevice(payload,token,options).then(function(response){
    console.log("Successful");
  }).
  catch(function(error){
    console.log("Error");
  })
}
module.exports= sendNotification

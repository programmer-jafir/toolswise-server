const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ureojum.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const toolCollection = client.db('toolswise').collection('tools');
        const orderCollection = client.db('toolswise').collection('orders');
        const userCollection = client.db('toolswise').collection('users');

        // get all tools
        app.get('/tool', async ( req, res) =>{
            const query= {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })


        app.put('/user/:email', async(req, res) =>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
              };
              const result = await userCollection.updateOne(filter, updateDoc, options);
              const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SERECT, { expiresIn: '1h' })
              res.send({result, token});
        })

        // get one tool
        app.get('/tool/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const tool = await toolCollection.findOne(query);
            res.send(tool)
        })

        app.post('/order', async(req, res)=>{
      const order = req.body;
      const result = orderCollection.insertOne(order);
      return res.send(result);
    })
    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Running manufacturer-website-server')
});
app.listen(port, () =>{
    console.log('Listening to port', port)
})
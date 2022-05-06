const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;


//middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g7qwl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const collection = client.db("booksWarehouse").collection("books");
        console.log('db is connected');
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('books warehouse Server is running')
});



app.listen(port, () => {
    console.log(`Port is:  ${port}`)
});
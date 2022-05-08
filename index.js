const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');
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
        const booksCollection = client.db("booksWarehouse").collection("books");
        console.log('db is connected');

        //created token for access...
        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token })
        })


        //post data to database...
        app.post('/uploadBook', async (req, res) => {
            const newBooks = req.body;
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo?.split(" ");
            const decoded = verifyToken(accessToken);
            //const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            if (email === decoded.email) {
                const result = await booksCollection.insertOne(newBooks);
                res.send({ success: 'Upload successfully' })
            } else {
                res.send({ success: 'Unauthorized Access' })
            }
        });

        //get all data from database...
        app.get('/allBooks', async (req, res) => {
            const allBooks = await booksCollection.find({}).toArray();
            res.send(allBooks);
        });

        //get data by id from database
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await booksCollection.findOne(query);
            res.send(book);
        });
        //update quantity api 
        app.put('/updateQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.updateQuantity
                },
            };
            const result = await booksCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        //Delete items by id api 
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            result = await booksCollection.deleteOne(query);
            res.send(result);
        });

        //get data by email api
        app.get('/myBooks', async (req, res) => {
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo?.split(" ");
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            if (email === decoded.email) {
                const orderInfo = await booksCollection.find({ email: email }).toArray();
                res.send(orderInfo);
            } else {
                res.send({ success: 'failed' })
            }
        });

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


//verify token ........ function
function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            email = 'Invalid email'
        }
        if (decoded) {
            email = decoded
        }
    });
    return email;
}
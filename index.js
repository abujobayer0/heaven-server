const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://muna700064:IyfwcKKkOwsd1SWV@cluster0.bztvv55.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // all collections
    const galleryCollection = client.db("heaven").collection("gallery");

    const retailersCollection = client.db("heaven").collection("retailers");
    const onlinePartnersCollection = client
      .db("heaven")
      .collection("onlinePartners");

    //   all get operations
    const allToysCollection = client.db("heaven").collection("all-toys");

    app.get("/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });
    app.get("/all", async (req, res) => {
      const result = await allToysCollection.find().toArray();
      res.send(result);
    });

    app.get("/retailers", async (req, res) => {
      const result = await retailersCollection.find().toArray();
      res.send(result);
    });
    app.get("/online-partners", async (req, res) => {
      const result = await onlinePartnersCollection.find().toArray();
      res.send(result);
    });
    const blogCollection = client.db("heaven").collection("blog");
    app.get("/blog", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });
    app.get("/alltoys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;

      try {
        const result = await allToysCollection.find().limit(limit).toArray();
        res.json(result);
      } catch (error) {
        console.error("Error retrieving toy data:", error);
        res.status(500).json({ error: "Failed to retrieve toy data" });
      }
    });
    app.get("/toy/:id", async (req, res) => {
      const { id } = req.params;
      const data = await allToysCollection.findOne({ _id: new ObjectId(id) });
      console.log(id);
      res.send(data);
    });
    app.get("/toys/", async (req, res) => {
      const sort = req.query.sort;
      const email = req.query.email;
      const query = { email: email };
      try {
        const sortedToys = await allToysCollection
          .find(query)
          .sort({ price: sort === "descending" ? -1 : 1 })
          .toArray();
        res.send(sortedToys);
      } catch (err) {
        console.log(err);
      }
    });
    app.get("/search", async (req, res) => {
      const name = req.query.name;
      console.log(name);
      const result = await allToysCollection
        .find({ name: { $regex: name, $options: "i" } })
        .toArray();
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const { email, page } = req.query;
      const pageNumber = parseInt(page) || 1;
      const pageSize = 10;
      const skipCount = (pageNumber - 1) * pageSize;

      try {
        const result = await allToysCollection
          .find({ email: email })
          .skip(skipCount)
          .limit(pageSize)
          .toArray();

        const totalCount = await allToysCollection
          .find({
            email: email,
          })
          .toArray();

        const totalPages = Math.ceil(totalCount.length / pageSize);

        res.send({ result, totalPages });
      } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching user toys");
      }
    });

    //  all post apis
    app.post("/add", async (req, res) => {
      const {
        picture,
        name,
        seller,
        subCategory,
        price,
        rating,
        quantity,
        details,
        email,
      } = req.body;
      const newToy = {
        picture: picture,
        name: name,
        seller: seller,
        subCategory: subCategory,
        price: price,
        rating: rating,
        quantity: quantity,
        details: details,
        email: email,
      };
      const result = await allToysCollection.insertOne(newToy);
      console.log(newToy);
      res.send(result);
    });
    // all put api
    app.put("/update/:id", (req, res) => {
      const { id } = req.params;
      const { price, quantity, details } = req.body;
      const query = { _id: new ObjectId(id) };
      const result = allToysCollection.updateOne(query, {
        $set: { price, quantity, details },
      });
      res.send(result);
    });
    // all delete api
    app.delete("/delete/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = allToysCollection.deleteOne(query);
      res.send(result);
      console.log(id);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Heaven is Running BOOM 🏓 !");
});
app.listen(port, () => {
  console.log(`heaven server is running on ${port}`);
});

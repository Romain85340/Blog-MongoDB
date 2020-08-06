const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs  = require('express-handlebars');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const methodOverride = require("method-override");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + Date.now())
    }
})



// Express
const app = express();


// Express Static
app.use(express.static("public"))

// Upload image

const upload = multer({storage : storage})
// const upload = multer ({ dest: "./public/uploads/"})

// Handlebars
app.engine("hbs", exphbs({defaultLayout: "main", extname: "hbs", handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set("view engine", "hbs")


// BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));


// Express Static
app.use(express.static("public"));


// Method-override
app.use(methodOverride("_method"));


// MongoDB
mongoose.connect('mongodb://localhost:27017/BlogWithArticle', { useNewUrlParser: true, useUnifiedTopology: true });



// Collection MongoDB

const articleSchema = mongoose.Schema({
    title: String,
    content: String,
    author: String,
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: "categorie" },
    cover: {
        name: String,
        originalName: String,
        path: String,
        createAt: Date,
    }
});
const categorieSchema = new mongoose.Schema ({
    title: String,
})



const Article = mongoose.model("article", articleSchema)
const Categorie = mongoose.model("categorie", categorieSchema)



// Route api

app.route("/api")
    .get((req, res) => {
        Article.find()
        .exec(function(err, article){
            if(!err){
                 res.json({
                 article : article
                 })
            } else {
                res.send(err)
            }
        })
    })

// Route index

app.route("/")
.get((req, res) => {
   Article
   .find()
   .populate("categorie")
   .exec(function(err, article){
       if(!err){
            res.render("index", {
            article : article
            })
       } else {
           res.send(err)
       }
   })
})
.post()
.delete(function(req, res){
    Article.deleteMany(function(err){
        if(!err){
            res.redirect("/")
        } else {
            res.send(err)
        }
    })
})


// Route cree des categorie

app.route("/categorie")
.get((req, res) => {
    Categorie.find((err, categorie) => {
        if (!err) {
            res.render("categorie", {
                categorie : categorie
            })
        } else {
            res.send(err)
        }
    })
})
.post((req, res) => {
    const newCategorie = new Categorie({
        title: req.body.title,
    })
    newCategorie.save( function(err) {
        if(!err) {
            res.redirect("categorie")
        } else {
            res.send(err)
        }
    })
})

// Route supprimer une categorie

app.route("/categorie/:id")
.delete(function(req, res){
    Categorie.deleteOne(
        {_id: req.params.id},
        function(err) {
            if(!err){
                res.redirect("/")
            }
            else {
                res.send(err)
            }
        }
    )
})

// Route ajouter des articles

app.route("/article")
.get((req, res) => {
    Article
    .find()
    .populate("categorie")
    .exec(function(err, article){
        if(!err){     
            Categorie.find( function(err, categorie ){
                res.render("article", {
                    article : article,
                    categorie: categorie,
                    })
                })
        } else {
                res.send(err)
        }
    })    
})
.post(upload.single("cover"), (req, res) => {
    const file = req.file
    console.log(file);


    const newArticle = new Article ({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        categorie: req.body.categorie,
    });

    if(file){
        newArticle.cover = {
            name: file.filename,
            originalName: file.originalname,
            // path: "uploads/" + filename,
            path: file.path.replace("public", ""),
            createAt: Date.now(),
        }
    }


    newArticle.save(function(err){
        if(!err){
            res.redirect("/")
        } else {
            res.send(err)
        }
    })
})


// Route pour modification Article

app.route("/:id")
.get((req, res) => {
    Article.findOne({_id: req.params.id}, function(err, article){
        if(!err){
            res.render("edition", {
                _id: article.id,
                title: article.title,
                content: article.content,
                author: article.author,
            })
        } else {
            res.send("err")
        }
    })
})
.put(upload.single("cover"), (req, res) => {
    const file = req.file;
    console.log(file);

    const newPut = new Article ({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        cover: req.body.cover

    })
    if(file){
        newPut.cover = {
            name: file.filename,
            originalName: file.originalname,
            path: file.path.replace("public", ""),
            createAt: Date.now(),
        }
    }



    Article.update(
        // condition
        {_id: req.params.id},
        // update
        {
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            cover: newPut.cover

        },
        // option
        {multi: true},
        // exec
        function(err){
            if(!err) {
                res.redirect("/")
            } else {
                res.send(err)
            }
        }
    )
})
.delete(function(req, res){
    Article.deleteOne(
        {_id: req.params.id},
        function(err) {
            if(!err){
                res.redirect("/")
            }
            else {
                res.send(err)
            }
        }
    )
})




// Start Server-localPort


app.listen(3000, function(){
    console.log(`écoute le port 3000 lancé à ${new Date().toLocaleString()}`);
})

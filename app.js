const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://GusTiavo123:lillimu123@cluster0.tbsyczh.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name : {
    type : String,
    required: true
  }
};
const Item = mongoose.model('item',itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delte an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model('list',listSchema);

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find()
  .then(items => {
    if (items.length === 0) {
      return Item.insertMany(defaultItems);
    } else {
      return items;
    }
  })
  .then(items => {
    res.render('list', { listTitle: day, newListItems: items });
  })
  .catch(err => {
    console.log(err);
  });

});

app.get('/:customListName', (req,res) =>{
  const customListName = req.params.customListName;
  const queryListName = customListName.charAt(0).toUpperCase() + customListName.slice(1);

  List.findOne({ name: queryListName })
  .then(list => {
    if (list) {
      res.render('list', { listTitle: list.name, newListItems: list.items });
    } else {
      const list = new List({
        name: queryListName,
        items: defaultItems
      });
      list.save();
      res.redirect('/' + customListName);
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).send(err);
  });


})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === date.getDate()){
    item.save()
    .then(() =>{
      res.redirect('/');
    })
    .catch(err =>{
      console.log(err);
    })
  } else {

    List.findOne({name: listName})
      .then(list =>{
        list.items.push(item);
        return list.save();
      })
      .then(() =>{
        res.redirect('/' + listName);
      })
      .catch(err =>{
        console.log(err);
      })
  }
});

app.post('/delete', (req,res) =>{

  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.deleteOne({_id: itemId})
    .then(() =>{
      res.redirect('/');
    })
    .catch((err) =>{
      console.log(err);
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}})
      .then(() =>{
        res.redirect('/' + listName);
      })
      .catch(err =>{
        console.log(err);
      })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

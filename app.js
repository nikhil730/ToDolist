const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const favicon = require("express-favicon");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.png"));

const dbname = "Todo_db";

mongoose
  .connect(
    "mongodb+srv://nikhil:.eebuL5tURPiNtx@cluster0.8jqmdrx.mongodb.net/" +
      dbname +
      "",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));

const itemschema = new mongoose.Schema({
  name: {
    type: String,
    reuired: true,
  },
});

const Item = mongoose.model("Item", itemschema);

const defaultmsg = new Item({
  name: "Add a Task",
});

const defaultmsgs = [defaultmsg];

const listSchema = {
  name: String,
  items: [itemschema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let day = date.getDay();
  Item.find({}, function (err, item) {
    //if (item.length === 0) {
    //  Item.insertMany(defaultmsgs, function (err) {
    //    if (err) {
    //      console.log(err);
    //    } else {
    //      console.log("Added");
    //    }
    //  });
    //  res.redirect("/");
    //} else {
    res.render("list", {
      listTitle: "Home",
      day: day,
      items: item,
    });
    //}
  });
});

app.get("/:customlistname", function (req, res) {
  let day = date.getDay();
  const customlistname = req.params.customlistname;
  List.findOne({ name: customlistname }, function (err, FoundList) {
    if (!err) {
      if (!FoundList) {
        const list = new List({
          name: customlistname,
          //items: defaultmsgs,
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", {
          listTitle: FoundList.name,
          day: day,
          items: FoundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  let itemName = req.body.newitem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Home") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Home") {
    Item.findByIdAndDelete(checkeditemid, function (err) {
      if (!err) {
        console.log(err);
        console.log("item deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkeditemid } } },
      function (err, foundList) {
        if (!err) {
          console.log("Item deleted");
          res.redirect("/" + listName);
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server is runing");
});

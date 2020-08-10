const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const _ = require('lodash');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

var tex = '';


mongoose.connect('mongodb://localhost:27017/todolistDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemsSchema = {
    items: {
        type: String,
        require: true
    }
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    items: 'Select'
});

const item2 = new Item({
    items: 'Select'
});

const item3 = new Item({
    items: 'Select'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);


app.get('/', (req, res) => {

    let day = date.getDate();


    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Successfully saved daulft item to DB');

                }
            });

            res.redirect('/');

        } else {
            res.render('lists', {
                listTitle: 'Today',
                newListItems: foundItems
            });

        }

    });
});

app.post('/', (req, res) => {


    let itemName = req.body.newItem;
    let list = req.body.list;

    const item = new Item({
        items: itemName
    });

    if (list === 'Today') {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({
            name: list
        }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + list);
        })

    }

});


app.post('/delete', (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Succes delete item By id');
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, (err, foundList) => {
            if (!err) {
                res.redirect('/' + listName);
            }
        })
    }

});




app.get('/:params', (req, res) => {

    const customListName = _.capitalize(req.params.params);

    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            } else {

                res.render('lists', {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }

        }
    });



});


app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');

});
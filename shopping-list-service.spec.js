const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');

describe(`Shopping list service object`, function() {
    let db
    let testItems = [
        {
            id: 1,
            name: 'banana',
            price: '23.34',
            category: 'Main',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: false
        },
        {
            id: 2,
            name: 'Chex Mix',
            price: '4.34',
            category: 'Lunch',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: true
        },
        {
            id: 3,
            name: 'Apple',
            price: '3.30',
            category: 'Breakfast',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: false
        }
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    after(() => db.destroy())
    afterEach(() => db('shopping_list').truncate())

    before(() => db('shopping_list').truncate())
    
    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db
                .into('shopping_list')
                .insert(testItems);
        })

        it('getAllItems() returns all items in "shopping_list" table', () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql(testItems.map(item => ({
                        ...item,
                        date_added: new Date(item.date_added)
                    })))
                })
        })

        it(`add() inserts new item in the shopping_list table`, () => {
            const newItem = {
                id: 19204,
                name: 'test',
                price: '14.50',
                category: 'Main',
                date_added: new Date('2019-01-22T16:28:32.615Z'),
                checked: false
            }
            return ShoppingListService.addItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 19204,
                        name: newItem.name,
                        price: newItem.price,
                        category: newItem.category,
                        date_added: new Date(newItem.date_added),
                        checked: newItem.checked,
                    })
                })
        })

        it(`getById() returns item matching the id`, () => {
            const newId = 2;
            const newItem = testItems[newId - 1];

            return ShoppingListService.getById(db, newId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: newId,
                        name: newItem.name,
                        price: newItem.price,
                        category: newItem.category,
                        date_added: new Date(newItem.date_added),
                        checked: newItem.checked,
                    })
                }) 
                
            })

        it(`updateItem() updates the item from shopping_list`, () => {
            const id = 2;
            const updatedItem = {
                name: 'updated name',
                price: '20.00',
                category: 'Breakfast',
                date_added: new Date(),
                checked: false
            }

            return ShoppingListService.updateItem(db, id, updatedItem)
                .then(() => ShoppingListService.getById(db, id))
                .then(actual => {
                    expect(actual).to.eql({
                        id: id,
                        ...updatedItem
                    })
                })
        })

        it(`deleteItem() deletes the itme from shopping_list`, () => {
            const itemId = 2;

            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getAllItems(db))
                .then(allItems => {
                    const expected = testItems.filter(item => item.id !== itemId);
                    expect(allItems).to.eql(expected);
                })
        })
    })
    
})

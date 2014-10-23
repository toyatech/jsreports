var fs = require('fs')
  , sqlite3 = require('sqlite3').verbose()
  , db = new sqlite3.Database(__dirname + '/Northwind.sqlite3');

db.serialize(function() {
  db.each("SELECT * FROM Orders ORDER BY ShipCountry", function(err, row) {
    console.log(row.OrderID + ': ' + row.CustomerID);
  });
});

db.close();

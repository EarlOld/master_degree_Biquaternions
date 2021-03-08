const express = require('express');
const app = new express();
const path = require("path");
const port = 8000;

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname + '/index.html'));
});
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
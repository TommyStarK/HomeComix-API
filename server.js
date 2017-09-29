const express	= require('express');
const app		= express();

var port = process.env.PORT || 3000;

// Start the server
app.listen(port, function() {
  console.log('HomeComix server listening on port ' + port);
});

// JavaScript source code
var jwt = require('jsonwebtoken');
var http = require('http');

module.exports = function (app) {

    var db = require('./controller/api.js');

    app.use( function (req, res, next){
        if((req.url != '/login') && (req.url != '/signup')){
            console.log("in if");
            //db.authenticate;
            if(req.header('Authorization')){
                const secret = 'DA693C13E7C5528473D915EB827EC';
                var token = req.header('Authorization').split(' ');
                
                if(token[0] == 'Bearer'){
                    
                    var user_data = jwt.verify(token[1], secret, {});
        
                    var options = {
                        hostname: 'localhost',
                        path: "http://localhost:8080/user?"+encodeURI("where=email='"+user_data.email+"' and id="+user_data.user_id),
                        port: 8080,    
                        method: 'GET',
                        headers: {
                          'Authorization': token[0]+' '+token[1]
                        }
                      };

                        console.log(options.path);
        
                        http.get(options, (response) => { 
            
                            let verify_data = '';
                            response.on('data', (d) => {
                                verify_data += d;
                                console.log(verify_data);
                                verify_data = JSON.parse(verify_data);
                                if(verify_data.status && verify_data.data.length == 1){
                                    console.log(verify_data.status);
                                    response.writeHead(302,{'Location': 'http://localhost:8080'+req.url});
                                    console.log(verify_data.data.length);
                                    response.end();
                                }
                            });
                            response.end();
                        }).on('error',(e)=>{
                            console.log(e);
                        });
                }
            }
        }else {
            console.log("in else")
            next();
        }
        
    });

    app.post('/login', db.login);

    app.post('/signup', db.signup);

    app.post('/send_mail', db.sendgrid);

    app.get('/:table_name', db.get_data);

    app.post('/:table_name', db.post_data);

    app.put('/:table_name', db.put_data);

    app.delete('/:table_name', db.delete_data);

}
// JavaScript source code

var db = require('../config.js');
var mail = require('@sendgrid/mail');
var https = require('https');
var http = require('http');
var request = require('request');
var jwt = require('jsonwebtoken');

module.exports.authenticate = function(req,res) {

    if(req.header('Authorization')){
        const secret = 'DA693C13E7C5528473D915EB827EC';
        var token = req.header('Authorization').split(' ');
        
        if(token[0] == 'Bearer'){
            
            var user_data = jwt.verify(token[1], secret, {});

            console.log(token[1]);

            var options = {
                hostname: 'localhost',
                path: '/user?where=email="'+user_data.email+'" and id='+user_data.user_id,
                port: 8080,    
                method: 'GET',
                headers: {
                  'Authorization': token[0]+' '+token[1]
                }
              };

            http.request(options, (response) => { 

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
            }).on('error',(e)=>{
                console.log(e);
            });
        }
    }
}

module.exports.get_data = function (req, res) {
    var get_query = 'Select ';
    if (req.query.fields) get_query += req.query.fields + ' from ' + req.params.table_name;
    else get_query += '* from ' + req.params.table_name;
    if (req.query.where) get_query += ' where ' + req.query.where;
    if (req.query.group_by) get_query += ' group by ' + req.query.group_by;
    if (req.query.having) get_query += ' having ' + req.query.having;
    if (req.query.order_by) get_query += ' order by ' + req.query.order_by;
    if (req.query.limit) get_query += ' limit ' + req.query.limit;
    if (req.query.offset) get_query += ' offset ' + req.query.offset;
    if (req.query.union) get_query += ' union ' + req.query.union;
    console.log(get_query)
    db.query(get_query, function (error, results) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            res.json({
                status: true,
                message: 'Successfully Fetched Data',
                data: results
            })
        }
    });
}

module.exports.post_data = function (req, res) {
    var post_query = "Insert into " + req.params.table_name + " (";
    for (var keys = Object.keys(req.body), i = 0; i < keys.length; i++) {
        post_query += keys[i]
        if (i != keys.length - 1) post_query += ','
    }
    post_query += ') VALUES('
    for (var keys = Object.keys(req.body), i = 0; i < keys.length; i++) {
        if (typeof req.body[keys[i]] == 'string') post_query += "'" + req.body[keys[i]] + "'"
        else post_query += req.body[keys[i]]
        if (i != keys.length - 1) post_query += ','
    }
    post_query += ');'
    console.log(post_query);
    db.query(post_query, function (error, result) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            res.json({
                status: true,
                message: 'Successfully Inserted Data',
                data: result
            })
        }
    });
}

module.exports.put_data = function (req, res) {
    var put_query = "Update " + req.params.table_name + " set ";
    for (var keys = Object.keys(req.body), i = 0; i < keys.length; i++) {
        if (typeof req.body[keys[i]] == 'string') put_query += keys[i] + " = '" + req.body[keys[i]] + "'"
        else put_query += keys[i] + " = " + req.body[keys[i]]
        if (i != keys.length - 1) put_query += ','
    }
    if (req.query.where) put_query += " where " + req.query.where;
    console.log(put_query);
    db.query(put_query, function (error, result) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            res.json({
                status: true,
                message: 'Successfully Updated Data',
                data: result
            })
        }
    });
}

module.exports.delete_data = function (req, res) {
    var delete_query = "Delete from " + req.params.table_name;
    if (req.query.where) delete_query += " where " + req.query.where;
    console.log(delete_query);
    db.query(delete_query, function (error, result) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            res.json({
                status: true,
                message: 'Successfully Deleted Data',
                data: result
            })
        }
    });
}

module.exports.login = function(req,res) {
    
    db.query("Select * from user where email='"+req.body.email+"' and password='"+req.body.password+"'", function (error, results) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            if(results[0] != undefined){
                var data = {
                    "user_id": results[0].id,
                    "user_name": results[0].name,
                    "email": results[0].email
                } 
                const options = { expiresIn: '1d' };
                const secret = 'DA693C13E7C5528473D915EB827EC';
                var token = jwt.sign(data, secret, {});
                
                console.log('token : ',token);
                res.json({
                    status: true,
                    message: 'Login Successfully',
                    token: token
                });
            }else {
                res.json({
                    status: false,
                    message: 'Failed to Login'
                });
            }
        }
    });
    // http.get('http://localhost:8080/user?where=email="'+req.body.email+'" and password="'+req.body.password+'"', (response) => {    
    
    //     let login_data = '';

    //     // A chunk of data has been recieved.
    //     response.on('data', (chunk) => {
    //         login_data += chunk;
    //         login_data = JSON.parse(login_data);

    //         if(login_data.status && login_data.data.length == 1){
    //             var data = {
    //                 "user_id": login_data.data[0].id,
    //                 "user_name": login_data.data[0].name,
    //                 "email": login_data.data[0].email
    //             } 
    //             const options = { expiresIn: '1d' };
    //             const secret = 'DA693C13E7C5528473D915EB827EC';
    //             var token = jwt.sign(data, secret, {});
                
    //             console.log('token : ',token);
    //             res.json({
    //                 status: true,
    //                 message: 'Login Successfully',
    //                 token: token
    //             });
    //         }else {
    //             res.json({
    //                 status: false,
    //                 message: 'Failed to Login'
    //             });
    //         }
    //     });
        
    // }).on("error", (error) => {
    //     console.log(error);
    // })
}

module.exports.signup = function(req,res){

    var options = {
        hostname: 'localhost',
        path: '/user',
        port: 8080,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    var signup_data = '';
    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (body) {
            signup_data += body
            signup_data = JSON.parse(signup_data);
            if(signup_data.status){
                res.json({
                    status: true,
                    message: 'Signup Successfully'
                });
            }else {
                res.json({
                    status: false,
                    message: 'Failed to Signup'
                });
            }
        });
      });
      request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

      request.write('{"name": "'+req.body.name+'", "email" : "'+req.body.email+'", "password": "'+req.body.password+'"}');
      request.end();
}

module.exports.sendgrid = function (req, res) {
    mail.setApiKey('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');
    var data = {
        to: req.body.to_mail,
        from: req.body.from_mail,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html
    }
    console.log(data);
    mail.send(data);
}
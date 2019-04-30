//. app.js

var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cors = require( 'cors' ),
    cfenv = require( 'cfenv' ),
    easyimg = require( 'easyimage' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    cloudantlib = require( '@cloudant/cloudant' ),
    uuidv1 = require( 'uuid/v1' ),
    app = express();
var settings = require( './settings' );

var db = null;
var cloudant = cloudantlib( { account: settings.db_username, password: settings.db_password } );
if( cloudant ){
  cloudant.db.get( settings.db_name, function( err, body ){
    if( err ){
      if( err.statusCode == 404 ){
        cloudant.db.create( settings.db_name, function( err, body ){
          if( err ){
            db = null;
          }else{
            db = cloudant.db.use( settings.db_name );

            //. query index
            var query_index_userId = {
              _id: "_design/userId-index",
              language: "query",
              indexes: {
                "userId-index": {
                  index: {
                    fields: [ { name: "userId", type: "string" } ]
                  },
                  type: "text"
                }
              }
            };
            db.insert( query_index_userId, function( err, body ){} );
          }
        });
      }else{
        db = cloudant.db.use( settings.db_name );

        //. query index
        var query_index_userId = {
          _id: "_design/userId-index",
          language: "query",
          indexes: {
            "userId-index": {
              index: {
                fields: [ { name: "userId", type: "string" } ]
              },
              type: "text"
            }
          }
        };
        db.insert( query_index_userId, function( err, body ){} );
      }
    }else{
      db = cloudant.db.use( settings.db_name );

      //. query index
      var query_index_userId = {
        _id: "_design/userId-index",
        language: "query",
        indexes: {
          "userId-index": {
            index: {
              fields: [ { name: "userId", type: "string" } ]
            },
            type: "text"
          }
        }
      };
      db.insert( query_index_userId, function( err, body ){} );
    }
  });
}

var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ).single( 'image' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/public' );
app.set( 'view engine', 'ejs' );

app.use( cors() );

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

app.post( '/image', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var imgpath = req.file.path;
  var imgtype = req.file.mimetype;
  //var imgsize = req.file.size;
  var ext = imgtype.split( "/" )[1];
  var imgfilename = req.file.filename;
  var filename = req.file.originalname;

  //. thumbnail
  var imgpath0 = imgpath + '_0';
  var option = { src: imgpath, dst: imgpath0, width: 200 };
  easyimg.resize( option ).then(
    function( file ){
      var image_id = uuidv1();
      var img = fs.readFileSync( imgpath );
      var img64 = new Buffer( img ).toString( 'base64' );
      var img0 = fs.readFileSync( imgpath0 );
      var img064 = new Buffer( img0 ).toString( 'base64' );

      var params2 = {
        _id: image_id,
        filename: filename,
        timestamp: ( new Date() ).getTime(),
        _attachments: {
          image: {
            content_type: imgtype,
            data: img64
          },
          thumbnail: {
            content_type: imgtype,
            data: img064
          },
        }
      };
      db.insert( params2, image_id, function( err2, body2, header2 ){
        if( err2 ){
          console.log( err2 );
          var p = JSON.stringify( { status: false, error: err2 }, null, 2 );
          res.status( 400 );
          res.write( p );
          res.end();
        }else{
          var p = JSON.stringify( { status: true, id: image_id, body: body2 }, null, 2 );
          res.write( p );
          res.end();
        }
        fs.unlink( imgpath, function( err ){} );
        fs.unlink( imgpath0, function( err ){} );
      });

    },
    function( err ){
      fs.unlink( imgpath, function( err ){} );

      var p = JSON.stringify( { status: false, error: err }, null, 2 );
      res.status( 400 );
      res.write( p );
      res.end();
    }
  );
});

app.get( '/image', function( req, res ){
  var image_id = req.query.id;
  var att = req.query.att ? req.query.att : 'image';
  db.attachment.get( image_id, att, function( err1, body1 ){
    res.contentType( 'image/png' );
    res.end( body1, 'binary' );
  });
});

app.delete( '/image', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.query.id;

  //. Cloudant から削除
  db.get( id, null, function( err2, body2, header2 ){
    if( err2 ){
      err2.image_id = "error-2";
      res.write( JSON.stringify( { status: false, error: err2 } ) );
      res.end();
    }

    var rev = body2._rev;
    db.destroy( id, rev, function( err3, body3, header3 ){
      if( err3 ){
        err3.image_id = "error-3";
        res.write( JSON.stringify( { status: false, error: err3 } ) );
        res.end();
      }

      body3.image_id = id;
      res.write( JSON.stringify( { status: true, body: body3 } ) );
      res.end();
    });
  });
});


app.get( '/images', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var limit = req.query.limit ? parseInt( req.query.limit ) : 0;
  var offset = req.query.offset ? parseInt( req.query.offset ) : 0;

  if( db ){
    db.list( { include_docs: true }, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var total = body.total_rows;
        var images = [];
        body.rows.forEach( function( doc ){
          var _doc = JSON.parse(JSON.stringify(doc.doc));
          if( _doc._id.indexOf( '_' ) !== 0 ){
            images.push( _doc );
          }
        });

        if( offset || limit ){
          if( offset + limit > total ){
            images = images.slice( offset );
          }else{
            images = images.slice( offset, offset + limit );
          }
        }

        var result = { status: true, total: total, limit: limit, offset: offset, images: images };
        res.write( JSON.stringify( result, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is failed to initialize.' }, 2, null ) );
    res.end();
  }
});

app.get( '/images_by_userId', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var userId = req.params.userId;
  var limit = req.query.limit ? parseInt( req.query.limit ) : 0;
  var offset = req.query.offset ? parseInt( req.query.offset ) : 0;

  if( db ){
    db.find( { selector: { userId: userId } }, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var total = body.total_rows;
        var images = body.docs;

        images.sort( compareByTimestamp );

        if( offset || limit ){
          if( offset + limit > total ){
            images = images.slice( offset );
          }else{
            images = images.slice( offset, offset + limit );
          }
        }

        var result = { status: true, total: total, limit: limit, offset: offset, images: images };
        res.write( JSON.stringify( result, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is failed to initialize.' }, 2, null ) );
    res.end();
  }
});


function timestamp2datetime( ts ){
  if( ts ){
    var dt = new Date( ts );
    var yyyy = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var hh = dt.getHours();
    var nn = dt.getMinutes();
    var ss = dt.getSeconds();
    var datetime = yyyy + '-' + ( mm < 10 ? '0' : '' ) + mm + '-' + ( dd < 10 ? '0' : '' ) + dd
      + ' ' + ( hh < 10 ? '0' : '' ) + hh + ':' + ( nn < 10 ? '0' : '' ) + nn + ':' + ( ss < 10 ? '0' : '' ) + ss;
    return datetime;
  }else{
    return "";
  }
}

function compareByTimestamp( a, b ){
  var r = 0;
  if( a.timestamp < b.timestamp ){ r = -1; }
  else if( a.timestamp < b.timestamp ){ r = 1; }

  return r;
}


app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );

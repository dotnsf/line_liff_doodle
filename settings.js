exports.db_username = '';
exports.db_password = '';
exports.db_name = 'doodledb';
exports.db_url = '';
exports.liff_id = '';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.cloudantNoSQLDB ){
    exports.db_username = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username;
    exports.db_password = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password;
  }
}

if( process.env.db_username ){
  exports.db_username = process.env.db_username;
}
if( process.env.db_password ){
  exports.db_password = process.env.db_password;
}
if( process.env.db_name ){
  exports.db_name = process.env.db_name;
}
if( process.env.db_url ){
  exports.db_url = process.env.db_url;
}
if( process.env.liff_id ){
  exports.liff_id = process.env.liff_id;
}

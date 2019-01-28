    var fs = require('fs'); 
    var DBFFile = require('dbffile');
    var Parser = require('node-dbf');
    var iconv = require('iconv-lite');
  

    //var iconv = Iconv('windows-1251', 'utf-8');
    var DBF_FILE = '_K0063_M.DBF';
    
    encodingFunction = function (buffer, encoding) {
        return iconv.decode(buffer, 'CP866').trim(); //CP1252....
        console.log(buffer);
    };


    var parser = new Parser(DBF_FILE);// {encoder:encodingFunction});

    parser.on('start', function(p) {
        console.log('dBase file parsing has started');
    });
    
    parser.on('header', function(h) {
        console.log('dBase file header has been parsed');
    });
    
    parser.on('record', function(record) {
        console.log('Name: ' + record.firstName + ' ' + record.lastName); // Name: John Smith
    });
    
    parser.on('end', function(p) {
        console.log('Finished parsing the dBase file');
    });
    
    parser.parse();
/*
     DBFFile.open(DBF_FILE)

    .then(dbf => {
        console.log(`DBF file contains ${dbf.recordCount} rows.`);
        console.log(`Field names: ${dbf.fields.map(f => f.name)}`);
        return dbf.readRecords();
    })

   .then(rows => rows.forEach(
//            row => console.log(iconv.encode(iconv.decode(row.FIO, "cp1251"), "utf8").toString())
            row => {
                /let chunks = [];
                //chunks.push(row.FIO);
                //console.log(utf8.encode(row.FIO));
                let body = encodingFunction(row.FIO, 'CP866');//iconv.encode(iconv.decode(chunks, 'cp866'),'utf-8');
                //console.log(body);
                              
            }
            //row => console.log(autoenc.detectEncoding(row.FIO).encoding)
            ))
        .catch(err => console.log('An error occurred: ' + err));
*/
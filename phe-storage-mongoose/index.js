var mongoose = require('mongoose');

/**
 * References: 
 *          botkit-storage-mongoose - MongoDB/Mongoose driver for Botkit
 *
 * @param  {Object} config Must contain a mongoUri property
 * @return {Object} A storage object conforming to the Botkit storage interface
 *
 * --Modified to a more updated version.
 */
 
module.exports = function(config) {

    if (!config) {
        throw new Error('Need to provide mongo address or a mongoose instance');
    }

    if (!config.mongoUri && !config.db) {
        throw new Error('Need to provide mongo address or a mongoose instance');
    }

    // var db = config.db || 
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
     	useCreateIndex: true
    }, (err, db)=>{
        if(err) { 
            console.log('Error', err);}
        else{
            console.log("Sucessfully connected to database!");
        }
    });


    const db = mongoose.connection;

    var storage = {};

    var zones = ['teams', 'channels', 'users'];

    config.tables && config.tables.forEach(function(table) {
        if (typeof table === 'string') zones.push(table);
    });

    console.log(zones);

    zones.forEach(function(zone) {
        var model = createModel(db, zone);
        storage[zone] = getStorage(model);

    });

    return storage;
};

function createModel(db, zone) {
    var schema = new mongoose.Schema({}, {
        strict: false,
        collection: zone
    });
    
    try {
        return db.model(zone, schema);
    } catch (e) {
        if(e.name === 'OverwriteModelError'){
            return db.model(zone);
        } else {
            throw(e);
        }
    }
}

function getStorage(table) {

    return {
        get: function(id, cb) {
            return table.findOne({
                id: id
            }).lean().exec(cb);
        },
        save: function(data, cb) {
            return table.findOneAndUpdate({
                id: data.id
            }, data, {
                upsert: true,
                new: true
            }).lean().exec(cb);
        },
        all: function(cb) {
            return table.find({}).lean().exec(cb);
        },
        delete: function(id, cb) {
            return table.remove({id:id}).lean().exec(cb);
        },
        find: function(data, cb, options) {
            return table.find(data ,null, options).lean().exec(cb);
        },
    };
}


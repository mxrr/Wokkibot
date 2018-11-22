const Datastore = require('nedb');

module.exports = class Database {
  constructor() {
    this.db = {};
    this.db.users = new Datastore({ filename: './users.db', autoload: true });
    this.db.guilds = new Datastore({ filename: './guilds.db', autoload: true });
  }

  /**
   * User database
   */
  getUser (id) {
    return new Promise((resolve, reject) => {
      this.db.users.findOne({ did: id }, (err, data) => {
        if (err) reject(err);
        resolve(data);
        //else reject('No data');
      })
    });
  }

  getUsers () {
    return new Promise((resolve, reject) => {
      this.db.users.find({}, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  updateUser (id, field, value) {
    return new Promise((resolve, reject) => {
      this.getUser(id)
        .then(data => {
          if (data) {
            this.db.users.update({ did: id }, { $set: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
              if (err) reject(err);
              resolve(affectedDocuments);
            });
          }
          else {
            this.db.users.insert({ did: id, [field]: value }, (err, newDoc) => {
              if (err) reject(err);
              resolve(newDoc);
            });
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  pushUser (id, field, value) {
    return new Promise((resolve, reject) => {
      this.db.users.update({ did: id }, { $push: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
        if (err) reject(err);
        resolve(numAffected);
      });
    });
  }

  pullUser (id, field, value) {
    return new Promise((resolve, reject) => {
      this.db.users.update({ did: id }, { $pull: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
        if (err) reject(err);
        resolve(numAffected);
      });
    });
  }

  removeUser (id) {
    return new Promise((resolve, reject) => {
      this.db.users.remove({ did: id }, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }

  /**
   * Guild database
   */
  getGuild (id) {
    return new Promise((resolve, reject) => {
      this.db.guilds.findOne({ gid: id }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      })
    });
  }

  updateGuild (id, field, value) {
    return new Promise((resolve, reject) => {
      this.getGuild(id)
        .then(data => {
          if (data) {
            this.db.guilds.update({ gid: id }, { $set: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
              if (err) reject(err);
              resolve(numAffected);
            });
          }
          else {
            this.db.guilds.insert({ gid: id, [field]: value }, (err, newDoc) => {
              if (err) reject(err);
              resolve(newDoc);
            });
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  pushGuild (id, field, value) {
    return new Promise((resolve, reject) => {
      this.db.guilds.update({ gid: id }, { $push: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
        if (err) reject(err);
        resolve(numAffected);
      });
    });
  }

  pullGuild (id, field, value) {
    return new Promise((resolve, reject) => {
      this.db.guilds.update({ gid: id }, { $pull: { [field]: value } }, (err, numAffected, affectedDocuments, upsert) => {
        if (err) reject(err);
        resolve(numAffected);
      });
    });
  }

  removeGuild (id) {
    return new Promise((resolve, reject) => {
      this.db.guilds.remove({ gid: id }, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }
}
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

  updateUser (id, field, value) {
    return new Promise((resolve, reject) => {
      let data;
      this.getUser(id)
        .then(data => {
          if (data) {
            data = this.db.users.update({ did: id }, { $set: { [field]: value } });
            resolve(data);
          }
          else {
            data = this.db.users.insert({ did: id, [field]: value });
            resolve(data);
          }
        })
        .catch(e => {
          reject(e);
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
      let data;
      this.getGuild(id)
        .then(data => {
          if (data) {
            data = this.db.guilds.update({ gid: id }, { $set: { [field]: value } });
            resolve(data);
          }
          else {
            data = this.db.guilds.insert({ gid: id, [field]: value });
            resolve(data);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }
}